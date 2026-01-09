# Aero Hand 智能学习伙伴 - 启动指南

## 🚀 快速开始

### 前置要求

**必需软件：**
- Node.js (>= 18.0.0)
- npm 或 yarn

**检查是否已安装：**
```bash
node --version  # 应显示 v18.x.x 或更高
npm --version   # 应显示 9.x.x 或更高
```

### 启动步骤

#### 方法 1：开发模式（推荐学习时使用）

```bash
# 1. 进入项目目录
cd F:/sim/aero/aero-hand-open/aero-hand-learning-partner

# 2. 安装依赖（首次运行需要）
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器访问
# 服务器会显示地址，通常是：
# http://localhost:5173
# 或 http://localhost:5174（如果5173被占用）
```

**特点：**
- ✅ 实时更新代码修改
- ✅ 自动刷新浏览器
- ✅ 显示调试信息
- ⚠️ 需要保持命令行窗口打开

#### 方法 2：生产构建（用于部署或离线使用）

```bash
# 1. 构建项目
npm run build

# 2. 生成的文件在 dist/ 目录

# 3. 直接打开使用
# 方法 A：双击 dist/index.html
# 方法 B：用任何静态服务器（nginx, apache等）部署 dist/ 目录
```

**特点：**
- ✅ 单个 HTML 文件
- ✅ 可以离线使用
- ✅ 可以部署到任何服务器
- ✅ 可以发送给别人使用
- ⚠️ 修改代码需要重新构建

---

## 📁 项目结构

```
aero-hand-learning-partner/
├── src/
│   ├── views/           # 页面组件
│   │   ├── Home.vue              # 学习进度主页
│   │   ├── KnowledgeBase.vue    # 知识库
│   │   ├── HardwareChecklist.vue # 硬件清单
│   │   └── OfficialDocs.vue      # 官方文档
│   ├── components/
│   │   └── ai/
│   │       └── AIAssistant.vue   # AI助手组件
│   ├── stores/
│   │   └── learning.js           # 学习状态管理
│   ├── data/
│   │   ├── knowledge-base.js     # 知识库数据
│   │   └── knowledge-extended.js # 扩展知识库
│   ├── router/
│   │   └── index.js              # 路由配置
│   ├── App.vue                   # 根组件
│   └── main.js                   # 入口文件
├── dist/                          # 构建输出（生产模式）
├── index.html                     # HTML入口
├── package.json                   # 项目配置
└── vite.config.js                 # 构建配置
```

---

## 🤖 AI助手说明

### 当前实现（第一版）

**实现方式：** 预设问答库

**工作原理：**
1. 根据当前学习阶段选择对应问题集
2. 用户点击问题或自由输入
3. 系统查找预设答案并返回
4. 支持 Markdown 格式渲染

**优点：**
- ✅ 响应快速
- ✅ 答案准确
- ✅ 无需网络
- ✅ 无额外成本

**限制：**
- ⚠️ 只能回答预设的问题
- ⚠️ 无法理解复杂问题
- ⚠️ 无法生成代码

### 完整版（待实现）

**方案 1：集成 Claude API（推荐）**

```javascript
// 示例代码
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: 'your-api-key'
})

async function askClaude(question, context) {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `作为Aero Hand学习助手，回答：${question}\\n\\n当前学习阶段：${context}`
    }]
  })
  return response.content[0].text
}
```

**优点：**
- ✅ 理解复杂问题
- ✅ 生成定制答案
- ✅ 可以分析代码
- ✅ 可以生成示例

**成本：**
- 按使用量计费
- 约 $0.003/1K tokens
- 学习使用每月约 $5-10

**方案 2：本地运行大模型**

```bash
# 使用 Ollama 运行本地模型
ollama run llama2

# 通过 API 调用
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "解释舵机控制原理"
}'
```

**优点：**
- ✅ 完全免费
- ✅ 数据本地化
- ✅ 无需网络

**缺点：**
- ⚠️ 需要高性能电脑
- ⚠️ 模型质量不如商业 API

---

## 💾 跨电脑使用指南

### 方法 1：构建后部署（最简单）

```bash
# 在电脑 A 上构建
npm run build

# dist/ 目录包含所有文件
# 将 dist/ 整个文件夹复制到：

# USB 驱动器 → 电脑 B
# 网盘 → 电脑 B
# 邮箱附件 → 电脑 B

# 在电脑 B 上
# 直接双击 dist/index.html 即可使用
```

**注意：**
- ✅ 无需安装 Node.js
- ✅ 无需安装依赖
- ✅ 浏览器直接打开
- ⚠️ 修改需要重新构建

### 方法 2：部署到在线服务器

```bash
# 构建后部署到 GitHub Pages
npm run build

# 推送到 GitHub
git add dist/
git commit -m "Deploy"
git push

# 在 GitHub 设置中启用 GitHub Pages
# 选择 dist/ 目录作为发布源
```

**访问地址：** `https://yourname.github.io/aero-hand-learning-partner/`

### 方法 3：完整源码迁移

```bash
# 复制整个项目文件夹
# 在新电脑上：

cd aero-hand-learning-partner
npm install  # 重新安装依赖
npm run dev  # 启动
```

---

## 🔧 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器

# 构建
npm run build        # 生产构建
npm run preview      # 预览构建结果

# 依赖管理
npm install          # 安装依赖
npm install <包名>   # 安装新包
npm update           # 更新依赖

# 清除缓存
rm -rf node_modules/.vite  # 清除 Vite 缓存
```

---

## ❓ 常见问题

### Q1: 端口被占用怎么办？

```bash
# 方法 1: Vite 会自动尝试其他端口
# 5173 → 5174 → 5175 ...

# 方法 2: 手动指定端口
npm run dev -- --port 3000

# 方法 3: 关闭占用端口的程序
# Windows:
netstat -ano | findstr :5173
taskkill /PID <进程ID> /F
```

### Q2: 修改代码后页面没更新？

```bash
# 1. 检查开发服务器是否在运行
# 2. 尝试手动刷新浏览器 (Ctrl+R)
# 3. 清除浏览器缓存 (Ctrl+Shift+Delete)
# 4. 重启开发服务器
```

### Q3: 在其他电脑上打不开？

```bash
# 检查 dist/index.html 是否存在
# 确保复制了整个 dist/ 文件夹
# 尝试用不同的浏览器打开
```

### Q4: AI助手没有回答？

```bash
# 当前版本是预设问答，只能回答预设问题
# 点击问题标签可以查看可用问题
# 或者升级到完整版（集成真实AI）
```

---

## 📚 下一步

1. **查看学习进度** - 了解当前阶段
2. **阅读官方文档** - 理解项目架构
3. **使用硬件清单** - 确认零件齐全
4. **浏览知识库** - 深入学习技术细节
5. **使用AI助手** - 随时提问（点击右上角按钮）

---

## 🆘 获取帮助

- GitHub Issues: [提交问题](https://github.com/TetherIA/aero-hand/issues)
- 官方文档: https://docs.tetheria.ai
- 项目仓库: https://github.com/TetherIA/aero-hand-open

祝学习顺利！ 🎉
