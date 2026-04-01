# Aero Hand 智能学习伙伴

[English](./README_EN.md) | 简体中文

🎓 一个基于 Vue 3 的交互式学习系统，帮助您系统地学习和复现 Aero Hand Open 开源机器人项目。

## 🌐 在线访问

| 平台 | 地址 | 状态 |
|------|------|------|
| **Vercel** | [aero-hand-learning-partner.vercel.app](https://aero-hand-learning-partner.vercel.app/) | ✅ 正常运行 |
| **GitHub Pages** | [fanfan142.github.io/aero-hand-learning-partner](https://fanfan142.github.io/aero-hand-learning-partner/) | ✅ 正常运行 |

## ✨ 功能特点

- 📚 **学习进度追踪** - 可视化显示学习阶段和完成度
- 🧠 **技术知识库** - 完整的中文技术文档和知识图谱
- 🔧 **硬件清单** - 详细的零件列表、规格和采购指南
- 📁 **项目结构** - 解读每个文件的作用和功能
- 💬 **AI 助手** - 支持多种 AI 的问答系统
- 🎯 **关节映射** - 可视化关节控制映射
- 🔄 **技术流程** - 技术流程可视化展示

## 🛠️ 技术栈

- **前端框架**: Vue 3 + Composition API
- **状态管理**: Pinia
- **UI 组件**: Element Plus
- **路由**: Vue Router 4
- **构建工具**: Vite 5
- **图表**: ECharts 5
- **3D 可视化**: Three.js
- **Markdown**: markdown-it + highlight.js

## 📦 安装运行

```bash
# 克隆仓库
git clone https://github.com/fanfan142/aero-hand-learning-partner.git
cd aero-hand-learning-partner

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

## 🚀 部署

### Vercel (推荐)

Vercel 会自动检测并部署，无需额外配置。

### GitHub Pages

推送到 main 分支后，GitHub Actions 会自动构建并部署到 GitHub Pages。

**注意**: 需要在 GitHub 仓库设置中启用 GitHub Pages，选择 "GitHub Actions" 作为 source。

## 📚 学习路径

项目分为 8 个学习阶段：

1. **硬件准备** - 电子元件采购和 3D 打印
2. **组装调试** - 机械装配和电气连接
3. **固件烧录** - ESP32-S3 固件刷写
4. **SDK 使用** - Python 控制接口
5. **ROS2 集成** - ROS2 通信配置
6. **仿真环境** - MuJoCo 物理仿真
7. **强化学习** - RL 训练流程
8. **Sim2Real** - 仿真到实物转移

## 📂 项目结构

```
aero-hand-learning-partner/
├── public/              # 静态资源
├── src/
│   ├── assets/         # 资源文件
│   ├── components/      # 公共组件
│   ├── composables/    # 组合式函数
│   ├── data/           # 静态数据
│   ├── router/         # 路由配置
│   ├── stores/         # Pinia 状态
│   ├── utils/          # 工具函数
│   └── views/          # 页面组件
├── .github/
│   └── workflows/      # GitHub Actions
├── docs/               # 技术文档
└── package.json
```

## 🔧 开发指南

### 添加新页面

1. 在 `src/views/` 创建 Vue 组件
2. 在 `src/router/index.js` 添加路由
3. 在 `src/App.vue` 的导航栏添加链接

### 添加 AI 提供商

在 `src/data/ai-config.js` 中的 `providers` 对象添加新配置。

## 📝 更新日志

### v1.2.1 (2026-04-01)

- ✅ 全面代码审计与优化
- ✅ 添加统一日志工具 Logger
- ✅ 重构所有 stores/views 使用 Logger
- ✅ 实现路径高亮功能
- ✅ 实现学习进度对话框
- ✅ 优化 Vite chunk 分割配置
- ✅ 清理空目录结构
- ✅ 修复 GitHub Pages 部署配置

### v1.2.0

- ✅ 新增关节映射可视化
- ✅ 新增技术流程查看器
- ✅ 新增知识图谱
- ✅ 优化移动端适配

### v1.1.0

- ✅ AI 助手支持多提供商
- ✅ 学习进度追踪
- ✅ 硬件清单功能

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目基于 MIT 许可证开源。

## 🔗 相关链接

- [Aero Hand Open 官方仓库](https://github.com/TetherIA/aero-hand-open)
- [Aero Hand Open 官方文档](https://tetheria.github.io/aero-hand-open/)
- [MuJoCo PlayGround](https://github.com/google-deepmind/mujoco_playground)

---

Made with ❤️ for the Aero Hand Open community
