import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// GitHub Pages 需要设置仓库名作为基础路径
// 如果部署到 Vercel/Netlify，设置为 '/'
// 如果部署到 GitHub Pages，设置为 '/仓库名/'
const base = process.env.DEPLOY_TARGET === 'github-pages'
  ? '/aero-hand-learning-partner/'
  : '/'

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
