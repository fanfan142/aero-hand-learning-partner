import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// 检测部署平台
// GitHub Pages: DEPLOY_TARGET=github-pages
// Vercel: IS_VERCEL=true 或 NODE_ENV=production
// 本地开发: 默认 '/'
const isGitHubPages = process.env.DEPLOY_TARGET === 'github-pages'
const isVercel = process.env.VERCEL === 'true' || process.env.IS_VERCEL === 'true'

let base = '/'
if (isGitHubPages) {
  base = '/aero-hand-learning-partner/'
} else if (isVercel) {
  base = '/'
} else {
  // 本地开发或默认
  base = '/'
}

export default defineConfig({
  plugins: [vue()],
  base: base,
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    open: true,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'es2015',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Element Plus 及其依赖单独打包
            if (id.includes('element-plus')) {
              return 'element-plus'
            }
            // ECharts 单独打包
            if (id.includes('echarts')) {
              return 'echarts'
            }
            // Markdown 解析库
            if (id.includes('markdown-it') || id.includes('highlight.js')) {
              return 'markdown'
            }
            // Vue 生态
            if (id.includes('vue') || id.includes('@vue')) {
              return 'vue-vendor'
            }
            // 其他 node_modules 统一打包
            return 'vendor'
          }
        }
      }
    }
  }
})
