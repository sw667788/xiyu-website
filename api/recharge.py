# -*- coding: utf-8 -*-
"""账户充值系统 — Vercel Python Function（并入 xiyu-website 官网仓库）

范式与同目录 express_fill.py 一致：Vercel 文件式函数只匹配精确路径 /api/recharge，
不匹配子路径，因此本应用采用「单入口 + query 参数分派」，所有操作都走 /api/recharge。

访问形态（对用户暴露的是干净路径 /recharge，由 vercel.json rewrite -> /api/recharge）：
  GET  /recharge                     充值首页
  POST /recharge                     (a)账号+金额 创建订单并跳支付宝
                                     (b)支付宝异步通知(带 sign/trade_status) 验签入账
  GET  /recharge?r=return&out_trade_no=..  同步回跳（仅展示）
  GET  /recharge?r=status&oid=..     轮询订单状态(JSON)
  GET  /recharge?r=admin&token=..    后台查看（需 ADMIN_TOKEN）

挂载：werkzeug DispatcherMiddleware 把 Flask 应用挂到 /api/recharge，去掉前缀后
Flask 内部仍按根路径（/）书写。
"""
import os
import sqlite3
import uuid
import time
from flask import Flask, request, redirect, jsonify, render_template_string
from werkzeug.middleware.dispatcher import DispatcherMiddleware

# 支付宝 SDK（python-alipay-sdk）已在 api/requirements.txt 声明
from alipay import AliPay

app = Flask(__name__)
# DispatcherMiddleware 精确匹配挂载点时会给出空 PATH_INFO，关掉尾斜杠重定向避免 308
app.url_map.strict_slashes = False

# ============ 配置区（全部可用环境变量覆盖，无需改代码） ============
APP_ID = os.environ.get("ALIPAY_APP_ID", "你的支付宝APP_ID")
APP_PRIVATE_KEY = os.environ.get("APP_PRIVATE_KEY")
ALIPAY_PUBLIC_KEY = os.environ.get("ALIPAY_PUBLIC_KEY")
PRIVATE_KEY_PATH = os.environ.get("PRIVATE_KEY_PATH", "app_private_key.pem")
PUBLIC_KEY_PATH = os.environ.get("PUBLIC_KEY_PATH", "alipay_public_key.pem")
SANDBOX = os.environ.get("ALIPAY_SANDBOX", "0") == "1"
GATEWAY = "https://openapi.alipaydev.com/gateway.do" if SANDBOX \
    else "https://openapi.alipay.com/gateway.do"
# 用户可见的干净路径（由 vercel.json rewrite 映射到 /api/recharge）
RETURN_URL = os.environ.get("RETURN_URL", "https://xiyutex.com/recharge?r=return")
NOTIFY_URL = os.environ.get("NOTIFY_URL", "https://xiyutex.com/recharge")
# 链接前缀：页面内链接/表单统一带此前缀（干净路径）
BASE_PATH = os.environ.get("BASE_PATH", "/recharge").rstrip("/")
# 数据库：DATABASE_URL 支持 postgres:// / mysql:// / 本地 SQLite 文件
DATABASE_URL = os.environ.get("DATABASE_URL")
USE_PG = bool(DATABASE_URL) and DATABASE_URL.startswith(("postgres://", "postgresql://"))
USE_MYSQL = bool(DATABASE_URL) and DATABASE_URL.startswith(("mysql://", "mysql+pymysql://"))
DB_KIND = "pg" if USE_PG else ("mysql" if USE_MYSQL else "sqlite")
# Vercel 文件系统只读（除 /tmp），SQLite 默认落到 /tmp 避免启动期报错
DATABASE = os.environ.get("DB_PATH", "/tmp/recharge.db")
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "change_this_admin_token")
# ===============================================================

_alipay = None


def _read_secret(env_val, path, label):
    if env_val:
        return env_val
    if not os.path.exists(path):
        raise RuntimeError(
            f"缺少支付宝{label}：请用环境变量传入 PEM 文本，或将密钥文件放到 {path}"
        )
    return open(path, "r").read()


def get_alipay():
    global _alipay
    if _alipay is None:
        _alipay = AliPay(
            appid=APP_ID,
            app_notify_url=NOTIFY_URL,
            app_private_key_string=_read_secret(APP_PRIVATE_KEY, PRIVATE_KEY_PATH, "应用私钥"),
            alipay_public_key_string=_read_secret(ALIPAY_PUBLIC_KEY, PUBLIC_KEY_PATH, "支付宝公钥"),
            sign_type="RSA2",
        )
    return _alipay


def qmark(sql_str):
    return sql_str.replace("?", "%s") if DB_KIND in ("pg", "mysql") else sql_str


class _DB:
    def __init__(self, conn, use_conn_execute, cursor=None):
        self.conn = conn
        self.use_conn_execute = use_conn_execute
        self._cur = cursor

    def execute(self, sql, params=None):
        if self.use_conn_execute:
            return self.conn.execute(sql, params or ())
        self._cur.execute(sql, params or ())
        return self._cur

    def commit(self):
        self.conn.commit()

    def close(self):
        self.conn.close()


def get_db():
    if USE_PG:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        conn = psycopg2.connect(DATABASE_URL, sslmode="require",
                                cursor_factory=RealDictCursor)
        db = _DB(conn, use_conn_execute=True)
    elif USE_MYSQL:
        import pymysql
        from urllib.parse import urlparse
        u = urlparse(DATABASE_URL)
        conn = pymysql.connect(
            host=u.hostname or "127.0.0.1",
            port=u.port or 3306,
            user=u.username or "root",
            password=u.password or "",
            database=(u.path or "").lstrip("/") or None,
            charset="utf8mb4",
            autocommit=False,
        )
        db = _DB(conn, use_conn_execute=False,
                 cursor=conn.cursor(pymysql.cursors.DictCursor))
    else:
        conn = sqlite3.connect(DATABASE)
        conn.row_factory = sqlite3.Row
        db = _DB(conn, use_conn_execute=True)
    try:
        _create_tables(db)
    except Exception:
        pass
    return db


def db_label():
    if DB_KIND == "sqlite":
        return "SQLite 文件：" + DATABASE
    if DB_KIND == "pg":
        from urllib.parse import urlparse
        u = urlparse(DATABASE_URL)
        return f"Postgres：{u.hostname or ''}:{u.port or 5432}/{(u.path or '').lstrip('/')}"
    if DB_KIND == "mysql":
        from urllib.parse import urlparse
        u = urlparse(DATABASE_URL)
        return f"MySQL：{u.hostname or ''}:{u.port or 3306}/{(u.path or '').lstrip('/')}"
    return DATABASE


def _create_tables(db):
    if DB_KIND == "pg":
        db.execute("""CREATE TABLE IF NOT EXISTS accounts (
            account TEXT PRIMARY KEY, balance DOUBLE PRECISION DEFAULT 0)""")
        db.execute("""CREATE TABLE IF NOT EXISTS orders (
            order_id TEXT PRIMARY KEY, account TEXT, amount DOUBLE PRECISION,
            status TEXT, created_at TEXT)""")
    elif DB_KIND == "mysql":
        db.execute("""CREATE TABLE IF NOT EXISTS accounts (
            account VARCHAR(64) PRIMARY KEY,
            balance DECIMAL(12,2) NOT NULL DEFAULT 0)""")
        db.execute("""CREATE TABLE IF NOT EXISTS orders (
            order_id VARCHAR(64) PRIMARY KEY,
            account  VARCHAR(64),
            amount   DECIMAL(12,2),
            status   VARCHAR(16),
            created_at VARCHAR(32))""")
    else:
        db.execute("""CREATE TABLE IF NOT EXISTS accounts (
            account  TEXT PRIMARY KEY,
            balance  REAL DEFAULT 0
        )""")
        db.execute("""CREATE TABLE IF NOT EXISTS orders (
            order_id   TEXT PRIMARY KEY,
            account    TEXT,
            amount     REAL,
            status     TEXT,
            created_at TEXT
        )""")


def init_db():
    db = get_db()
    _create_tables(db)
    db.commit()
    db.close()


try:
    init_db()
except Exception as e:
    print("WARN: 初始化建表未成功（首次访问时重试）：", e)


# ---------- 页面模板 ----------
INDEX_HTML = """
<html><body style="font-family:sans-serif;max-width:420px;margin:40px auto">
  <h2>账户充值</h2>
  <form action="{{ base }}" method="post">
    <p>账号：<br><input name="account" required style="width:100%;padding:6px"></p>
    <p>金额：<br>
      <select name="amount" style="width:100%;padding:6px">
        <option value="6">6 元</option>
        <option value="30">30 元</option>
        <option value="98">98 元</option>
        <option value="198">198 元</option>
        <option value="328">328 元</option>
      </select>
    </p>
    <button type="submit" style="padding:8px 16px">去支付</button>
  </form>
  <p style="color:#888;font-size:12px">本系统用于合法业务账户充值。</p>
</body></html>
"""

STATUS_HTML = """
<html><body style="font-family:sans-serif;max-width:420px;margin:40px auto">
  <h2>充值结果</h2>
  <p id="s">正在确认支付状态…</p>
  <script>
    const oid = "{{oid}}";
    const base = "{{ base }}";
    const t = setInterval(async () => {
      const r = await fetch(base + "?r=status&oid=" + encodeURIComponent(oid));
      const d = await r.json();
      if (d.status === "SUCCESS") {
        document.getElementById("s").innerText =
          "✅ 支付成功！账号 " + d.account + " 当前余额：" + d.balance;
        clearInterval(t);
      } else if (d.status === "NOT_FOUND") {
        document.getElementById("s").innerText = "订单不存在";
        clearInterval(t);
      } else {
        document.getElementById("s").innerText = "⏳ 支付确认中…（状态：" + d.status + "）";
      }
    }, 2000);
  </script>
</body></html>
"""

ADMIN_HTML = """
<html><body style="font-family:sans-serif;max-width:760px;margin:30px auto">
  <h2>充值后台 · 数据库查看</h2>
  <p style="font-size:13px;color:#666">数据库：{{db}}</p>

  <h3>账户余额</h3>
  <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">
    <tr><th>账号</th><th>余额</th></tr>
    {% for a in accounts %}
    <tr><td>{{ a.account }}</td><td>{{ a.balance }}</td></tr>
    {% endfor %}
  </table>

  <h3>最近订单（前 50 条）</h3>
  <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">
    <tr><th>订单号</th><th>账号</th><th>金额</th><th>状态</th><th>时间</th></tr>
    {% for o in orders %}
    <tr><td>{{ o.order_id }}</td><td>{{ o.account }}</td><td>{{ o.amount }}</td>
        <td>{{ o.status }}</td><td>{{ o.created_at }}</td></tr>
    {% endfor %}
  </table>
</body></html>
"""


# ---------- 业务处理 ----------
def _index():
    return render_template_string(INDEX_HTML, base=BASE_PATH)


def _status(order_id):
    db = get_db()
    order = db.execute(
        qmark("SELECT status, account FROM orders WHERE order_id=?"), (order_id,)
    ).fetchone()
    if not order:
        db.close()
        return jsonify({"status": "NOT_FOUND"})
    account = order["account"]
    acc = db.execute(
        qmark("SELECT balance FROM accounts WHERE account=?"), (account,)
    ).fetchone()
    db.close()
    return jsonify({
        "status": order["status"],
        "account": account,
        "balance": acc["balance"] if acc else 0,
    })


def _return_page(order_id):
    return render_template_string(
        STATUS_HTML.replace("{{oid}}", order_id), base=BASE_PATH
    )


def _admin():
    if request.args.get("token") != ADMIN_TOKEN:
        return "Forbidden：请提供正确的 ?token=", 403
    db = get_db()
    accounts = db.execute(
        qmark("SELECT account, balance FROM accounts ORDER BY balance DESC")
    ).fetchall()
    orders = db.execute(
        qmark("SELECT order_id, account, amount, status, created_at FROM orders "
              "ORDER BY created_at DESC LIMIT 50")
    ).fetchall()
    db.close()
    return render_template_string(
        ADMIN_HTML, db=db_label(), accounts=accounts, orders=orders
    )


def _create():
    account = (request.form.get("account") or "").strip()
    try:
        amount = float(request.form.get("amount"))
    except (TypeError, ValueError):
        return "金额格式不对", 400
    if not account:
        return "缺少账号", 400
    order_id = "R" + uuid.uuid4().hex[:16]

    created_at = time.strftime("%Y-%m-%d %H:%M:%S")
    db = get_db()
    db.execute(
        qmark("INSERT INTO orders (order_id, account, amount, status, created_at) "
              "VALUES (?,?,?,?,?)"),
        (order_id, account, amount, "PENDING", created_at),
    )
    db.commit()
    db.close()

    try:
        ali = get_alipay()
    except RuntimeError as e:
        return str(e), 500
    order_string = ali.api_alipay_trade_page_pay(
        out_trade_no=order_id,
        total_amount=str(amount),
        subject="账户充值",
        return_url=RETURN_URL,
        notify_url=NOTIFY_URL,
    )
    return redirect(GATEWAY + "?" + order_string)


def _notify():
    """支付宝异步通知：付款成功的唯一可靠依据。"""
    data = request.form.to_dict()
    sign = data.pop("sign", None)
    if not sign or not get_alipay().verify(data, sign):
        return "fail"

    if data.get("trade_status") in ("TRADE_SUCCESS", "TRADE_FINISHED"):
        order_id = data.get("out_trade_no")
        db = get_db()
        row = db.execute(
            qmark("SELECT account, amount FROM orders WHERE order_id=?"), (order_id,)
        ).fetchone()
        if row:
            account, amount = row["account"], row["amount"]
            if DB_KIND == "pg":
                db.execute(
                    qmark("INSERT INTO accounts (account) VALUES (?) "
                          "ON CONFLICT (account) DO NOTHING"), (account,)
                )
            elif DB_KIND == "mysql":
                db.execute(
                    qmark("INSERT IGNORE INTO accounts (account) VALUES (?)"), (account,)
                )
            else:
                db.execute("INSERT OR IGNORE INTO accounts (account) VALUES (?)", (account,))
            db.execute(
                qmark("UPDATE accounts SET balance = balance + ? WHERE account = ?"),
                (amount, account),
            )
            db.execute(
                qmark("UPDATE orders SET status = 'SUCCESS' WHERE order_id = ?"), (order_id,)
            )
        db.commit()
        db.close()
    return "success"  # 必须返回 success，否则支付宝会重复通知


@app.route("/", methods=["GET", "POST"])
def entry():
    if request.method == "POST":
        form = request.form
        # 支付宝异步通知：含 sign / trade_status / out_trade_no
        if "sign" in form or "trade_status" in form:
            return _notify()
        # 充值下单：含 account + amount
        if "account" in form and "amount" in form:
            return _create()
        return "bad request", 400
    r = request.args.get("r", "")
    if r == "status":
        return _status(request.args.get("oid", ""))
    if r == "return":
        return _return_page(request.args.get("out_trade_no", ""))
    if r == "admin":
        return _admin()
    return _index()


# ---------- Vercel 挂载：把本应用挂到 /api/recharge ----------
# Vercel 会把完整路径（含 /api/recharge）传给 Flask，用 DispatcherMiddleware 去掉前缀。
# 模块级 `app` 必须是这个 dispatcher（Vercel 导入的 WSGI 应用）。
flask_app = app
app = DispatcherMiddleware(Flask("recharge-root"), {"/api/recharge": flask_app})


if __name__ == "__main__":
    # 本地调试：访问 http://localhost:8090/api/recharge
    port = int(os.environ.get("PORT", 8090))
    flask_app.run(host="0.0.0.0", port=port, debug=True)
