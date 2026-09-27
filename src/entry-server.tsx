// 构建期 SSR 入口：把某个 URL 渲染成 HTML 字符串，供 prerender 脚本生成静态页。
// 仅在 Node 构建期执行，不进浏览器包。
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'

export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  )
}
