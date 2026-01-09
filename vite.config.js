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
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'markdown-it': ['markdown-it']
        }
      }
    }
  }
})
