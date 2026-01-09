# 🎓 Aero Hand 智能学习伙伴

> 一个交互式Web应用，帮助你系统地学习和复现 **Aero Hand Open** 肌腱驱动灵巧机械手项目

[![Live Demo](https://img.shields.io/badge/🌐-在线访问-brightgreen)](https://aero-hand-learning-partner.vercel.app)
[![GitHub](https://img.shields.io/badge/源码-GitHub-blue)](https://github.com/fanfan142/aero-hand-learning-partner)
[![Version](https://img.shields.io/badge/版本-v1.2.0-success)](https://github.com/fanfan142/aero-hand-learning-partner)

---

## ✨ 功能特性

### 🌌 知识图谱 (v1.2.0新增)
- **宇宙风格交互脑图** - 像行星一样漂浮的知识节点
- **ECharts Graph可视化** - 力导向图布局，支持缩放拖拽
- **节点详情** - 点击展开实现代码、前置知识、关联功能
- **漂浮动画** - 动态星空背景，节点漂浮效果
- **分类展示** - 7大技术分类（硬件、固件、SDK、仿真、ROS2、RL、Sim2Real）

### 📚 技术文档中心 (v1.2.0新增)
- **AI生成文档** - 12月29-30日生成的6个深度技术文档
- **学习路径方案** - 快速上手、完整掌握、研究深入三种路径
- **分层学习模块** - 6个阶段的详细学习指南
- **模块化学习** - 4个模块（通信协议、运动学、系统集成、高级应用）
- **在线Markdown查看** - 直接在浏览器中阅读技术文档

### 🏠 独立首页 (v1.1.0新增)
- **官方项目链接** - 最显眼位置展示官方文档和GitHub仓库
- **功能介绍** - 清晰展示网站的核心功能和技术栈
- **学习路线预览** - 8个阶段快速预览
- **快速开始指南** - 新手友好的入门指引

### 📚 个性化学习系统
- **学习进度追踪** - 从0%开始的进度可视化
- **任务清单** - 43个详细任务，支持勾选/取消勾选
- **自由导航** - 可以自由回顾已学内容或预览未来内容
- **详细步骤** - 每个任务包含操作步骤、命令、预期结果

### 📖 完整知识库
- **官方文档翻译** - Aero Hand项目的中文文档
- **技术栈详解** - 涵盖硬件、固件、SDK、仿真、强化学习等
- **Sim2Real教程** - 遥操作和立方体旋转完整教程
- **Mermaid图表** - 可视化展示技术架构

### 🧠 AI学习助手
- 支持多种OpenAI兼容API：
  - OpenAI (GPT-4/GPT-3.5)
  - DeepSeek（深度求索）
  - Moonshot（月之暗面）
  - Baichuan（百川）
  - 自定义API服务
- 自动读取学习进度和当前页面
- Markdown格式回答

### 📦 硬件清单
- 详细的零件清单（电子元件、3D打印、机械零件等）
- 交互式勾选功能
- 进度百分比显示
- 导出功能

### 📁 项目结构详解
- 完整的目录树展示
- 每个文件的作用说明
- 可执行操作列表
- 依赖关系说明
- 使用示例代码

---

## 🚀 快速开始

### 在线使用（推荐）

直接访问：https://aero-hand-learning-partner.vercel.app

无需安装任何软件，打开浏览器即可使用！

### 本地运行

```bash
# 1. 克隆仓库
git clone https://github.com/fanfan142/aero-hand-learning-partner.git
cd aero-hand-learning-partner

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器访问
# http://localhost:5173
```

### 生产构建

```bash
# 构建
npm run build

# 预览构建结果
npm run preview
```

---

## 📖 更新日志

### v1.2.1 (2025-01-09) - 构建修复
- 🐛 修复Element Plus图标兼容性问题
  - 替换不存在的Circle图标为SuccessFilled
  - 确保所有导入的图标都有效
  - 本地构建测试通过（8.48s）
- ✅ 完成代码审计
  - 审计所有Vue组件（10个文件）
  - 审计路由和状态管理
  - 验证所有图标导入
  - 确认代码质量和规范

### v1.2.0 (2025-01-09) - 知识图谱和技术文档
- ✨ 新增宇宙风格交互式知识图谱页面
  - ECharts Graph 力导向图
  - 漂浮动画效果，星空背景
  - 节点详情展示（代码、前置知识、关联）
- ✨ 新增技术文档中心
  - 整理AI生成的6个深度技术文档
  - 学习路径方案和模块化学习
  - 在线Markdown查看器
- 🎨 代码块背景色优化（浅蓝色 #e6f3ff）
- 📝 新增导航：知识图谱、技术文档

### v1.1.0 (2024-01-09) - 重大功能更新
- ✨ 新增独立首页组件，展示官方项目链接和功能介绍
- 🔧 路由重构：`/` → 首页，`/learning` → 学习进度
- 🐛 修复学习进度从非0%开始的bug
- ✨ 任务支持取消勾选
- 📝 任务列表从22个扩展到43个详细任务
- 📝 每个任务新增：操作步骤、可执行命令、预期结果

### v1.0.0 (2024-01-08) - 首次发布
- 🎉 8阶段学习路线（硬件、固件、舵机、SDK、仿真、ROS2、RL、Sim2Real）
- 📚 完整知识库
- 🧠 AI学习助手
- 📦 硬件清单
- 📁 项目结构详解

---

## 📖 学习路线

本项目将学习过程分为 **8个阶段，共43个详细任务**：

### 1️⃣ 硬件准备 (4任务)
- 购买电子元件（ESP32-S3、HLS3606M舵机等）
- 3D打印零件
- 机械组装
- 电气连接

### 2️⃣ 固件烧录 (5任务)
- 安装Arduino IDE
- 打开固件项目
- 配置固件参数
- 编译并烧录固件
- 测试串口通信

### 3️⃣ 舵机配置 (5任务)
- 理解舵机控制原理
- 安装Python SDK
- 配置单个舵机端点
- 配置所有舵机
- 测试SDK控制

### 4️⃣ SDK使用 (4任务)
- 理解代码架构
- 探索官方示例代码
- 运行示例脚本
- 编写自定义控制脚本

### 5️⃣ MuJoCo仿真 (6任务)
- 理解MuJoCo基础
- 理解XML模型
- 安装MuJoCo环境
- 加载仿真模型
- 实时控制仿真
- 测试预训练策略

### 6️⃣ ROS2集成 (4任务)
- 理解ROS2作用
- 搭建ROS2环境
- 运行示例节点
- 理解话题消息

### 7️⃣ RL训练 (8任务)
- 理解强化学习基础
- 理解PPO算法
- 探索训练代码
- 配置训练参数
- 配置监控工具（wandb）
- 运行训练
- 监控和分析训练
- 评估训练策略

### 8️⃣ Sim2Real (7任务)
- 理解Sim2Real挑战
- 理解完整流程
- 导出策略模型
- 策略部署（SDK方式）
- 策略部署（ROS2方式）
- 调试和优化
- 记录结果

---

## 🎯 核心功能展示

### 学习进度面板
- 显示当前完成百分比
- 可视化学习路线图
- 任务列表支持勾选完成

### 知识库
- 完整的Aero Hand技术文档
- 官方教程中文翻译
- 代码示例和配置说明

### 硬件清单
- 分类整理的零件列表
- 规格参数和数量要求
- 勾选追踪功能

### 项目结构
- 完整的GitHub仓库结构展示
- 文件作用和重要性标注
- 可执行操作说明

---

## 🛠️ 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **Vite** - 下一代前端构建工具
- **Element Plus** - Vue 3 UI组件库
- **Pinia** - Vue状态管理
- **Vue Router** - 路由管理
- **ECharts** - 数据可视化
- **Markdown-it** - Markdown渲染

### AI集成
- OpenAI兼容API
- DeepSeek、Moonshot、Baichuan等国产AI
- 自定义API服务支持

### 部署
- **Vercel** - 自动部署和CDN
- **GitHub Pages** - 静态托管

---

## 📝 开发指南

### 项目结构

```
aero-hand-learning-partner/
├── src/
│   ├── views/           # 页面组件
│   │   ├── Welcome.vue            # 首页 (v1.1.0新增)
│   │   ├── Home.vue               # 学习进度主页
│   │   ├── KnowledgeBase.vue      # 知识库
│   │   ├── HardwareChecklist.vue  # 硬件清单
│   │   ├── OfficialDocs.vue       # 官方文档
│   │   └── ProjectStructure.vue   # 项目结构
│   ├── components/
│   │   └── ai/
│   │       └── AIAssistant.vue   # AI助手组件
│   ├── stores/
│   │   └── learning.js           # 学习状态管理
│   ├── data/
│   │   ├── knowledge-base.js     # 知识库数据
│   │   ├── detailed-tasks.js     # 详细任务列表
│   │   ├── project-structure.js  # 项目结构数据
│   │   └── ai-config.js          # AI配置
│   └── router/
│       └── index.js              # 路由配置
├── public/                        # 静态资源
├── index.html                     # HTML入口
├── package.json                   # 项目配置
├── vite.config.js                 # Vite配置
└── vercel.json                    # Vercel部署配置
```

### 添加新功能

1. **添加新页面**：在 `src/views/` 创建Vue组件
2. **添加路由**：在 `src/router/index.js` 注册路由
3. **添加数据**：在 `src/data/` 添加或修改数据文件
4. **更新导航**：在 `src/App.vue` 添加导航标签

---

## 💾 数据存储说明

### 学习进度
- **存储位置**：浏览器 `localStorage`（本地存储）
- **特点**：
  - ✅ 每个浏览器/设备进度独立
  - ✅ 无需登录，快速使用
  - ❌ 清除浏览器数据会丢失进度
  - ❌ 换设备需要重新开始

### AI API配置
- **存储位置**：浏览器 `localStorage`（本地存储）
- **特点**：
  - ✅ 每个设备独立配置
  - ✅ API密钥不会上传到服务器（安全）
  - ❌ 换设备需要重新配置

### 部署机制
- **自动部署**：每次 `git push` 到GitHub，Vercel自动检测并部署
- **部署时间**：约30秒
- **无需操作**：完全自动化，推送即部署

---

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 提交Issue
- Bug报告
- 功能建议
- 文档改进
- 翻译纠错

### 提交PR
1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 🌟 致谢

- [Aero Hand Open](https://github.com/TetherIA/aero-hand-open) - 原项目
- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Element Plus](https://element-plus.org/) - Vue 3组件库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具

---

## 📮 联系方式

- GitHub: [@fanfan142](https://github.com/fanfan142)
- Issues: [提交问题](https://github.com/fanfan142/aero-hand-learning-partner/issues)

---

## 🎊 开始学习

**准备好开始你的Aero Hand学习之旅了吗？**

👉 访问 [https://aero-hand-learning-partner.vercel.app](https://aero-hand-learning-partner.vercel.app)

---

<div align="center">

**如果这个项目对你有帮助，请给个⭐Star支持一下！**

Made with ❤️ by [fanfan142](https://github.com/fanfan142)

</div>
