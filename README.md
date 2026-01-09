# 🎓 Aero Hand 智能学习伙伴

> 一个交互式Web应用，帮助你系统地学习和复现 **Aero Hand Open** 肌腱驱动灵巧机械手项目

[![Live Demo](https://img.shields.io/badge/🌐-在线访问-brightgreen)](https://aero-hand-learning-partner.vercel.app)
[![GitHub](https://img.shields.io/badge/源码-GitHub-blue)](https://github.com/fanfan142/aero-hand-learning-partner)

---

## ✨ 功能特性

### 📚 个性化学习系统
- **学习进度追踪** - 可视化显示当前学习阶段和完成度
- **任务清单** - 每个阶段细分具体任务，支持勾选完成
- **自由导航** - 可以自由回顾已学内容或预览未来内容

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

## 📖 学习路线

本项目将学习过程分为 **8个阶段**：

### 1️⃣ 硬件准备
- 购买电子元件（ESP32-S3、HLS3606M舵机等）
- 3D打印零件
- 机械装配

### 2️⃣ 固件烧录
- 安装Arduino开发环境
- 编译并上传ESP32固件
- 测试串口通信

### 3️⃣ 舵机配置
- 理解舵机控制原理
- 配置端点（grasp_count/extend_count）
- 测试SDK控制

### 4️⃣ SDK使用
- 安装Python SDK
- 运行示例程序
- 开发自定义控制

### 5️⃣ MuJoCo仿真
- 安装MuJoCo和MJX
- 加载仿真模型
- 运行物理仿真

### 6️⃣ ROS2集成
- 安装ROS2 Humble
- 配置工作空间
- 运行遥操作节点

### 7️⃣ RL训练
- 理解PPO算法
- 配置训练环境
- 运行强化学习训练
- 监控训练进度

### 8️⃣ Sim2Real
- 理解域随机化
- 训练鲁棒策略
- 部署到实物
- 调试和优化

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
│   │   ├── Home.vue              # 学习进度主页
│   │   ├── KnowledgeBase.vue    # 知识库
│   │   ├── HardwareChecklist.vue # 硬件清单
│   │   ├── OfficialDocs.vue      # 官方文档
│   │   └── ProjectStructure.vue  # 项目结构
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

- [Aero Hand Open](https://github.com/tether-ia/aero-hand-open) - 原项目
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
