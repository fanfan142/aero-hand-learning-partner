# Aero Hand 学习伙伴 - 部署指南

本文档介绍如何将项目部署到公网，让所有人可以访问。

---

## 🚀 方案对比

| 方案 | 实时预览 | 稳定性 | 速度 | 适用场景 | 成本 |
|------|---------|--------|------|----------|------|
| **Vercel** | ❌ 需重部署 | ⭐⭐⭐⭐⭐ | 🚀 极快 | 正式使用 | 免费 |
| **Netlify** | ❌ 需重部署 | ⭐⭐⭐⭐⭐ | 🚀 快 | 正式使用 | 免费 |
| **ngrok隧道** | ✅ 实时 | ⭐⭐ | 🐢 慢 | 开发演示 | 免费(限速) |
| **StackBlitz** | ✅ 实时 | ⭐⭐⭐⭐ | 🚀 快 | 在线开发 | 免费 |

---

## 方案1：Vercel自动部署（推荐⭐⭐⭐⭐⭐）

### 优点
- ✅ 全球CDN加速
- ✅ 自动HTTPS
- ✅ Git推送自动部署
- ✅ �览部署环境
- ✅ 完全免费

### 步骤

#### 1.1 推送代码到GitHub

```bash
cd F:/sim/aero/aero-hand-open/aero-hand-learning-partner

# 初始化Git
git init
git add .
git commit -m "Initial commit"

# 创建GitHub仓库后
git remote add origin https://github.com/你的用户名/aero-hand-learning-partner.git
git branch -M main
git push -u origin main
```

#### 1.2 部署到Vercel

**方法A：通过网页（最简单）**

1. 访问 https://vercel.com
2. 使用GitHub账号登录
3. 点击 "Add New Project"
4. 选择你的GitHub仓库
5. 点击 "Deploy"

**等待30秒**，你会得到一个类似这样的网址：
```
https://aero-hand-learning-partner.vercel.app
```

**方法B：通过CLI**

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd F:/sim/aero/aero-hand-open/aero-hand-learning-partner
vercel
```

#### 1.3 自动更新流程

```bash
# 1. 修改代码
# 2. 提交到GitHub
git add .
git commit -m "Add new feature"
git push

# 3. Vercel自动检测推送并重新部署
# 4. 约30秒后网站自动更新！
```

#### 1.4 预览部署（测试环境）

每次推送都会创建一个预览URL：
```
https://aero-hand-learning-partner-xxx-username.vercel.app
```

可以在合并到主分支前测试修改。

---

## 方案2：Netlify部署（备选）

### 步骤

#### 2.1 通过网页部署

1. 访问 https://netlify.com
2. 注册/登录
3. 拖拽 `dist/` 文件夹到页面

#### 2.2 连接GitHub自动部署

1. 在Netlify点击 "New site from Git"
2. 选择GitHub仓库
3. 配置：
   - Build command: `npm run build`
   - Publish directory: `dist`
4. 点击 "Deploy site"

---

## 方案3：GitHub Pages（完全免费）

### 步骤

#### 3.1 修改vite.config.js

```javascript
export default defineConfig({
  base: '/aero-hand-learning-partner/', // 仓库名
  // ... 其他配置
})
```

#### 3.2 创建部署脚本

在 `package.json` 添加：

```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

#### 3.3 安装gh-pages并部署

```bash
npm install -D gh-pages
npm run deploy
```

访问地址：`https://你的用户名.github.io/aero-hand-learning-partner/`

---

## 方案4：ngrok实时预览隧道（开发演示用）

### 优点
- ✅ 本地修改实时可见
- ✅ 适合演示和调试

### 缺点
- ❌ 关闭后地址失效
- ❌ 速度较慢
- ❌ 免费版有限制

### 步骤

#### 4.1 下载ngrok

1. 访问 https://ngrok.com 注册
2. 下载Windows版ngrok
3. 解压到任意目录

#### 4.2 配置authtoken

```bash
ngrok config add-authtoken 你的token
```

#### 4.3 启动隧道

**终端1：启动开发服务器**
```bash
cd F:/sim/aero/aero-hand-open/aero-hand-learning-partner
npm run dev
```

**终端2：启动ngrok**
```bash
ngrok http 5173
```

你会看到：
```
Forwarding  https://abc1-23-45-67-89.ngrok-free.app -> http://localhost:5173
```

这个URL可以分享给任何人，**你修改代码后会实时更新！**

---

## 方案5：StackBlitz在线IDE（最灵活）

### 步骤

1. 访问 https://stackblitz.com
2. 点击 "New Project" → "Vite + Vue (TypeScript)"
3. 复制你的代码到在线编辑器
4. 实时预览，分享链接

**优势：**
- 完全在线，无需本地环境
- 可以实时编辑并看到效果
- 可以邀请他人协作编辑
- 自动HTTPS和托管

---

## 🎯 最佳实践组合

### 正式使用 + 快速迭代

```
本地开发 → ngrok实时预览 → 满意后提交GitHub → Vercel自动部署
```

### 具体流程

```bash
# === 开发阶段 ===
# 1. 本地开发
npm run dev

# 2. 实时预览（需要时启动）
ngrok http 5173
# 分享 ngrok URL 给他人查看

# === 发布阶段 ===
# 3. 代码满意后提交
git add .
git commit -m "Add feature"
git push

# 4. Vercel自动部署，获得永久URL
# https://your-project.vercel.app
```

---

## 📝 常见问题

### Q1: Vercel部署后页面空白？
**A:** 检查 `vite.config.js` 中的 `base` 配置，GitHub Pages需要设置为仓库名。

### Q2: ngrok太慢怎么办？
**A:** ngrok适合演示，正式使用请用Vercel/Netlify。

### Q3: 如何自定义域名？
**A:** 在Vercel/Netlify的域名设置中添加你的域名，配置CNAME。

### Q4: 如何隐藏API密钥？
**A:** 使用环境变量，在Vercel dashboard中配置：
```javascript
// vite.config.js
export default defineConfig({
  define: {
    __APP_ENV__: JSON.stringify(process.env.APP_ENV)
  }
})
```

---

## 🔗 有用的链接

- **Vercel**: https://vercel.com
- **Netlify**: https://netlify.com
- **GitHub Pages**: https://pages.github.com
- **ngrok**: https://ngrok.com
- **StackBlitz**: https://stackblitz.com
- **Railway** (替代方案): https://railway.app

---

## ⚡ 一键部署命令

```bash
# 安装Vercel CLI
npm i -g vercel

# 一键部署
vercel --prod
```

祝部署顺利！🎉
