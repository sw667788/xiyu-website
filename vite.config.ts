import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command }) => ({
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react({
      // react-dev-locator 是 Trae IDE 的开发期定位工具，只应在 dev 启用；
      // 生产构建若启用会把 trae-inspector-* 属性与本地构建路径写进产物。
      babel: {
        plugins: command === 'serve' ? ['react-dev-locator'] : [],
      },
    }),
    tsconfigPaths()
  ],
}))
