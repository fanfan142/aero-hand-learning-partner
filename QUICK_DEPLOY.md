# 🚀 快速部署指南

## 最简单的部署方法（推荐）

### 方法1：Vercel - 30秒自动部署 ⚡

```bash
# 1. 推送代码到GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/aero-hand-learning-partner.git
git push -u origin main

# 2. 访问 https://vercel.com
# 3. 用GitHub登录
# 4. 点击 "New Project"
# 5. 选择这个仓库
# 6. 点击 "Deploy"

# 完成！30秒后获得永久网址：
# https://aero-hand-learning-partner.vercel.app
```

### 方法2：GitHub Pages - 完全免费

```bash
# 1. 推送代码到GitHub（同上）

# 2. 在GitHub仓库页面：
#    Settings → Pages → Source 选择 "GitHub Actions"

# 3. 自动部署，访问：
#    https://你的用户名.github.io/aero-hand-learning-partner/
```

### 方法3：ngrok - 实时预览（演示用）

```bash
# 终端1：启动开发服务器
npm run dev

# 终端2：启动ngrok
ngrok http 5173

# 分享显示的URL，修改代码实时更新！
```

---

## 📝 部署后如何更新

### Vercel/Netlify（自动）
```bash
# 修改代码后
git add .
git commit -m "更新内容"
git push

# 自动部署！30秒后生效
```

### GitHub Pages（自动）
```bash
# 同上，推送后自动触发部署
```

---

## 🔧 使用不同部署平台

修改 `vite.config.js` 中的配置：

```javascript
// Vercel / Netlify（默认）
const base = '/'

// GitHub Pages
const base = '/aero-hand-learning-partner/'
```

---

## 📚 详细文档

查看 `DEPLOYMENT_GUIDE.md` 获取更多部署选项。
