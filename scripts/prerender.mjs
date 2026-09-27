// 构建期预渲染：把各路由渲染成真实 HTML，写入 dist。
// 配合 vercel.json 的 cleanUrls，/about 直接命中 dist/about.html，不再落到空壳 SPA。
// 用法：node scripts/prerender.mjs   （在 vite build 之后运行）
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const DIST = process.env.DIST_DIR || 'dist'
const SSR_ENTRY = process.env.SSR_ENTRY || path.join('.ssr-build', 'entry-server.js')

// 需要生成静态页的路由（与 src/App.tsx 的路由一致；动态段 /production/:step 暂不预渲染）
const ROUTES = ['/', '/about', '/products', '/production', '/contact']

const tplPath = path.join(DIST, 'index.html')
if (!fs.existsSync(tplPath)) {
  console.error(`[prerender] 找不到 ${tplPath}，请先运行 vite build`)
  process.exit(1)
}
const template = fs.readFileSync(tplPath, 'utf8')

if (!/ <div id="root">\s*<\/div>/.test(template)) {
  console.warn('[prerender] 警告：模板中未找到 <div id="root"></div>，仍继续尝试替换')
}

const mod = await import(pathToFileURL(path.resolve(SSR_ENTRY)).href)
const render = mod.render
if (typeof render !== 'function') {
  console.error('[prerender] SSR 入口未导出 render()')
  process.exit(1)
}

let count = 0
for (const route of ROUTES) {
  let appHtml = ''
  try {
    appHtml = render(route)
  } catch (e) {
    console.error(`[prerender] 渲染 ${route} 失败：`, e)
    process.exit(1)
  }
  const html = template.replace(
    /(<div id="root">)\s*(<\/div>)/,
    `$1${appHtml}$2`,
  )
  if (route === '/') {
    fs.writeFileSync(path.join(DIST, 'index.html'), html)
  } else {
    const out = path.join(DIST, route.replace(/^\//, '') + '.html')
    fs.writeFileSync(out, html)
  }
  count++
}

console.log(`[prerender] 已生成 ${count} 个静态页：${ROUTES.join(', ')}`)
