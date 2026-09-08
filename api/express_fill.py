# -*- coding: utf-8 -*-
"""寄样快递费用回填 — Vercel Python Function（并入 xiyu-website 官网仓库）

访问形态（Vite 静态页在 public/express-fill/，本函数提供后端）：
  GET  /api/express_fill?r=records           拉取全表记录（含待回填标记）
  GET  /api/express_fill?r=img&token=<token> 图片代理
  POST /api/express_fill  body={record_id,重量kg,费用元,时效}  回填

凭据：环境变量 FEISHU_APP_ID / FEISHU_APP_SECRET（本地缺失回退 ~/.openclaw/openclaw.json）
数据表：稀榆快递费用登记 app / 寄样快递费用表
"""
import os
import json
import urllib.request
import urllib.error
from flask import Flask, request, jsonify, Response

APP_TOKEN = os.environ.get("FEISHU_APP_TOKEN", "NrscbM8spadEPgsIE5VcntTHn5b")
TABLE_ID = os.environ.get("FEISHU_TABLE_ID", "tblcQoxrvAmzeqts")
FEISHU_BASE = "https://open.feishu.cn/open-apis"
IMAGE_FIELDS = ["面单图片", "寄件图片"]

app = Flask(__name__)


def _feishu_creds():
    aid = os.environ.get("FEISHU_APP_ID")
    sec = os.environ.get("FEISHU_APP_SECRET")
    if aid and sec:
        return aid, sec
    try:
        cfg = json.load(open(os.path.expanduser("~/.openclaw/openclaw.json"), encoding="utf-8"))
        f = cfg["channels"]["feishu"]
        return f["appId"], f["appSecret"]
    except Exception:
        return None, None


def _http(method, url, token=None, payload=None, timeout=20):
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "ignore")
        try:
            return json.loads(body)
        except Exception:
            return {"code": e.code, "msg": body[:200]}


def _raw(url, token=None, timeout=20):
    headers = {"Authorization": "Bearer " + token} if token else {}
    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, resp.read(), resp.headers.get("Content-Type", "image/jpeg")
    except urllib.error.HTTPError as e:
        return e.code, e.read(), "text/plain"


def _tenant_token():
    aid, sec = _feishu_creds()
    if not aid or not sec:
        raise RuntimeError("缺少飞书凭据（FEISHU_APP_ID/SECRET）")
    out = _http("POST", f"{FEISHU_BASE}/auth/v3/tenant_access_token/internal",
                payload={"app_id": aid, "app_secret": sec}, timeout=10)
    tok = out.get("tenant_access_token")
    if not tok:
        raise RuntimeError("tenant_access_token 获取失败")
    return tok


def _text(v):
    if v is None:
        return ""
    if isinstance(v, dict):
        return str(v.get("text") or v.get("name") or "")
    return str(v)


def _num(v):
    try:
        if v is None or v == "":
            return None
        return round(float(v), 4)
    except (TypeError, ValueError):
        return None


def _images(v):
    out = []
    if isinstance(v, list):
        for it in v:
            if isinstance(it, dict) and it.get("file_token"):
                out.append({"token": it["file_token"], "name": it.get("name", "")})
    return out


def _records():
    recs = []
    page_token = None
    while True:
        url = f"{FEISHU_BASE}/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records?page_size=100"
        if page_token:
            url += "&page_token=" + page_token
        out = _http("GET", url, token=_tenant_token(), timeout=20)
        if out.get("code") != 0:
            raise RuntimeError("拉取记录失败: " + json.dumps(out, ensure_ascii=False)[:200])
        for item in out.get("data", {}).get("items", []):
            if item.get("deleted"):
                continue
            fld = item.get("fields", {})
            weight = _num(fld.get("重量kg"))
            cost = _num(fld.get("费用元"))
            rec = {
                "record_id": item.get("record_id") or item.get("id"),
                "面单号": _text(fld.get("面单号")),
                "日期": fld.get("日期"),
                "收件人": _text(fld.get("收件人")),
                "收件电话": _text(fld.get("收件电话")),
                "收件公司": _text(fld.get("收件公司")),
                "收件地址": _text(fld.get("收件地址")),
                "备注": _text(fld.get("备注")),
                "安排人": _text(fld.get("安排人")),
                "时效": _text(fld.get("时效")),
                "寄件样品": _text(fld.get("寄件样品")),
                "重量kg": weight,
                "费用元": cost,
                "待回填": weight is None or cost is None,
            }
            for img_field in IMAGE_FIELDS:
                rec[img_field] = _images(fld.get(img_field))
            recs.append(rec)
        if out.get("data", {}).get("has_more"):
            page_token = out["data"].get("page_token")
        else:
            break
    return recs


@app.route("/api/express_fill", methods=["GET", "POST"])
def entry():
    try:
        if request.method == "POST":
            return _backfill()
        r = request.args.get("r", "")
        if r == "records":
            return jsonify({"ok": True, "records": _records()})
        if r == "img":
            tok = request.args.get("token", "")
            if not tok:
                return jsonify({"ok": False, "error": "缺少 token"}), 400
            status, data, ctype = _raw(f"{FEISHU_BASE}/drive/v1/medias/{tok}/download",
                                       token=_tenant_token(), timeout=20)
            if status != 200:
                return jsonify({"ok": False, "error": f"图片下载失败 http={status}"}), status
            return Response(data, content_type=ctype, headers={"Cache-Control": "public, max-age=3600"})
        return jsonify({"ok": False, "error": "未知请求"}), 400
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


def _backfill():
    try:
        body = request.get_json(force=True, silent=True) or {}
    except Exception:
        body = {}
    record_id = str(body.get("record_id") or "").strip()
    if not record_id:
        return jsonify({"ok": False, "error": "缺少 record_id"}), 400
    fields = {}
    w = body.get("重量kg")
    if w is not None and w != "":
        n = _num(w)
        if n is None or n < 0:
            return jsonify({"ok": False, "error": "重量kg 格式不对"}), 400
        fields["重量kg"] = n
    c = body.get("费用元")
    if c is not None and c != "":
        n = _num(c)
        if n is None or n < 0:
            return jsonify({"ok": False, "error": "费用元 格式不对"}), 400
        fields["费用元"] = n
    s = (body.get("时效") or "").strip()
    if s:
        if s not in ("普通", "加急"):
            return jsonify({"ok": False, "error": "时效只能是 普通 或 加急"}), 400
        fields["时效"] = s
    if not fields:
        return jsonify({"ok": False, "error": "请填写重量kg / 费用元 / 时效 至少一项"}), 400
    out = _http("PUT",
                f"{FEISHU_BASE}/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records/{record_id}",
                token=_tenant_token(), payload={"fields": fields}, timeout=20)
    if out.get("code") != 0:
        return jsonify({"ok": False, "error": "飞书更新失败: " + json.dumps(out, ensure_ascii=False)[:300]}), 500
    return jsonify({"ok": True, "updated": fields})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8081")), debug=False)
