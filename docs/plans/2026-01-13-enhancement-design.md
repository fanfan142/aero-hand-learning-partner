# Aero Hand 学习伙伴 - 功能增强设计方案

**设计日期**: 2026-01-13
**项目版本**: v1.2.1
**设计状态**: 待实施

---

## 📋 目录

- [1. 设计概述](#1-设计概述)
- [2. 整体架构](#2-整体架构)
- [3. 技术流程可视化引擎](#3-技术流程可视化引擎)
- [4. 交互式实践系统](#4-交互式实践系统)
- [5. 关节映射可视化页面](#5-关节映射可视化页面)
- [6. 组件架构设计](#6-组件架构设计)
- [7. 实施计划](#7-实施计划)

---

## 1. 设计概述

### 1.1 项目定位

Aero Hand 学习伙伴是一个**学习+文档双重定位**的交互式学习平台，服务于 Aero Hand 灵巧机械手项目的学习和实践。

### 1.2 核心设计目标

1. **多角度技术流程可视化** - 线性/并行流程 + 交互式星状图
2. **交互式学习体验** - 关节映射、配置模拟、代码实践
3. **灵活的学习路径** - 无强制解锁，支持跳步学习
4. **完善的知识管理** - 笔记、书签、搜索、分类

### 1.3 技术选型

```
前端框架: Vue 3 (Composition API)
UI 组件库: Element Plus
状态管理: Pinia
可视化: ECharts (2D) + Three.js (3D可选)
路由: Vue Router 4
构建工具: Vite
```

---

## 2. 整体架构

### 2.1 三大支柱系统

```
┌─────────────────────────────────────────────────────────┐
│                    Aero Hand 学习平台                    │
├──────────────┬──────────────┬───────────────────────────┤
│ 技术流程     │ 交互式实践   │ 知识管理                 │
│ 可视化引擎   │ 系统         │                          │
├──────────────┼──────────────┼───────────────────────────┤
│ - 线性流程   │ - 关节映射   │ - 知识图谱               │
│ - 并行泳道   │ - 配置模拟   │ - 笔记系统               │
│ - 树形配置   │ - 任务追踪   │ - 代码片段               │
│ - 3D展示     │ - 代码编辑   │ - 搜索功能               │
└──────────────┴──────────────┴───────────────────────────┘
```

### 2.2 数据流架构

```
用户输入 → 组件层 → Composables逻辑 → Stores状态 → 本地存储
                ↓
          可视化渲染 (ECharts/Three.js)
```

---

## 3. 技术流程可视化引擎

### 3.1 线性流程图

**应用场景**: 关节-舵机-脉冲映射

```
用户指令(0-100%)
    ↓
SDK API位置百分比
    ↓
端点转换(grasp_count/extend_count)
    ↓
脉冲数量(0-4095)
    ↓
串口协议帧(16字节)
    ↓
PWM信号
    ↓
舵机角度
    ↓
关节角度
```

**功能特性**:
- 每个节点可点击展开详细参数
- 数据流动画演示
- 参数悬停提示
- 节点状态高亮

### 3.2 并行泳道图

**应用场景**: 强化学习训练流程

```
[环境配置] ──┐
            ├──→ [训练循环] ──→ [策略评估] ──→ [Sim2Real部署]
[策略网络] ──┤       ↓
            └── [域随机化]
[数据采集] ──┘
```

**功能特性**:
- 多泳道并行时序展示
- 数据流向动画
- 模块依赖关系
- 实时状态监控

### 3.3 树形配置图

**应用场景**: ROS2配置树

```
ROS2工作空间
├── aero_hand包
│   ├── 节点 (hand_controller, teleop)
│   ├── 话题 (/hand/command, /hand/state)
│   └── 服务 (/calibrate, /home)
└── 依赖包
    ├── sensor_msgs
    └── std_msgs
```

**功能特性**:
- 展开/折叠节点
- 层级关系展示
- 数据流向追踪
- 配置参数展示

### 3.4 交互式星状图(知识图谱)

**从现有MindMap.vue升级**

**布局特性**:
- 分层星状布局
- 核心 → 子系统 → 组件
- 力导向自动布局

**交互功能**:
- 点击节点: 详细信息卡片
- 拖拽节点: 自定义布局
- 搜索高亮: 路径追踪动画
- 右键菜单: 导航/笔记/收藏

**关系可视化**:
- 实线: 直接依赖
- 虚线: 间接关联
- 颜色编码: 关系类型

### 3.5 3D可视化(可选)

**交互式3D机械手**:
- 关节高亮显示
- 肌腱路径追踪
- 动作回放功能
- 仿真对比视图

---

## 4. 交互式实践系统

### 4.1 任务系统增强

**改进点**:
- ❌ 移除强制解锁机制
- ✅ 保留依赖提示(仅提示)
- ✅ 添加"跳过"按钮
- ✅ 支持自由调整顺序
- ✅ 集成 detailed-tasks.js 丰富数据

**任务详情展示**:
- 操作步骤
- 前置知识
- 验证标准
- 故障排除
- 代码示例

### 4.2 知识记录与笔记

**功能**:
- 节点笔记: 流程图/知识图谱任意节点添加笔记
- 学习日志: 时间线展示学习记录
- 截图标注: 图解/代码标注
- Markdown支持: 富文本编辑
- 标签分类: 多维度分类
- 全文搜索: 快速定位

### 4.3 配置模拟器

**舵机端点配置模拟器**:
- 滑块调整参数
- 实时计算范围
- 限位警告
- 配置对比

**RL训练参数调优面板**:
- 参数滑块调整
- 训练时间预估
- wandb集成对比
- 历史配置管理

### 4.4 代码片段库

**功能**:
- 代码收藏
- 按模块分类
- 语法高亮
- 在线编辑
- 一键复制
- 导出功能

---

## 5. 关节映射可视化页面 ⭐

### 5.1 页面布局

**三栏设计**:

**左栏 - 控制区**
```
关节选择器 (多选)
├─ ☑ 食指 (Index)
├─ ☑ 中指 (Middle)
├─ ☑ 无名指 (Ring)
├─ ☑ 小指 (Pinky)
├─ ☐ 拇指内收
├─ ☐ 拇指弯曲
└─ ☐ 手腕

位置控制滑块
━━━●━━ 0.65
[0]    [1]

预设动作
[张开] [半握] [握拳] [捏取]
```

**中栏 - 实时数据流**
```
输入层
位置百分比: 65%
━━━━━━●━━━ 65%

映射层
关节角度: 97.5° (65% × 150°)
舵机角度: 78° (传动比调整)
脉冲数量: 3264 (78° ÷ 360° × 4096)

配置层
extend_count: 3800
grasp_count: 1200
当前脉冲: 2864 (插值结果)
```

**右栏 - 可视化区**
```
3D关节动画
- 实时显示弯曲角度
- 肌腱路径追踪

多关节对比图 (柱状图)
食指 ████░░ 65%
中指 ██████ 80%
无名 ███░░░ 55%

历史曲线 (折线图)
- 最近调整记录
```

### 5.2 核心功能

1. **多关节独立控制**
   - 同步控制多个关节
   - 单独微调
   - 预设动作

2. **实时计算展示**
   - 位置% → 关节角度
   - 关节角度 → 舵机角度
   - 舵机角度 → 脉冲数量
   - 脉冲数量 → 实际输出

3. **参数配置面板**
   - 修改端点配置
   - 调整传动比
   - 设置限位
   - 实时预览

4. **数据对比功能**
   - 保存多组方案
   - 并排对比
   - 导出配置

### 5.3 增强细节

- **动画模式**: 0% → 100% 自动播放
- **异常检测**: 超限红色警告
- **数据导出**: 参数对照表
- **教学提示**: 悬停显示原理

---

## 6. 组件架构设计

### 6.1 目录结构

```
src/
├── components/
│   ├── common/                      # 通用组件
│   │   ├── CodeViewer.vue          # 代码查看器
│   │   ├── MarkdownRenderer.vue    # Markdown渲染
│   │   ├── DataTable.vue           # 数据表格
│   │   └── NoteEditor.vue          # 笔记编辑器
│   │
│   ├── visualization/               # 可视化组件
│   │   ├── FlowChart/
│   │   │   ├── LinearFlow.vue      # 线性流程图
│   │   │   ├── ParallelFlow.vue    # 并行泳道图
│   │   │   └── TreeFlow.vue        # 树形配置图
│   │   ├── KnowledgeGraph/
│   │   │   ├── StarGraph.vue       # 星状知识图谱
│   │   │   ├── GraphNode.vue       # 图节点
│   │   │   └── GraphEdge.vue       # 连线
│   │   ├── ThreeD/
│   │   │   ├── HandModel.vue       # 3D机械手
│   │   │   ├── JointHighlight.vue  # 关节高亮
│   │   │   └── TendonTrace.vue     # 肌腱追踪
│   │   └── Charts/
│   │       ├── DataChart.vue       # 通用图表
│   │       └── ComparisonChart.vue # 对比图表
│   │
│   ├── learning/                    # 学习组件
│   │   ├── TaskList.vue            # 任务列表
│   │   ├── TaskDetail.vue          # 任务详情
│   │   ├── TaskCard.vue            # 任务卡片
│   │   └── StageProgress.vue       # 阶段进度
│   │
│   ├── practice/                    # 实践组件
│   │   ├── JointMapping.vue        # 关节映射页面
│   │   ├── ServoConfig.vue         # 舵机配置模拟
│   │   ├── RLParams.vue            # RL参数调优
│   │   ├── NoteSystem.vue          # 笔记系统
│   │   └── CodeSnippet.vue         # 代码片段
│   │
│   └── ai/                          # AI组件
│       └── AIAssistant.vue
│
├── views/                            # 页面视图
│   ├── Welcome.vue
│   ├── Home.vue
│   ├── JointMapping.vue            # 关节映射页(新增)
│   ├── FlowViewer.vue              # 流程可视化页(新增)
│   ├── PracticeLab.vue             # 实验室(新增)
│   ├── KnowledgeGraph.vue          # 知识图谱(增强)
│   ├── KnowledgeBase.vue
│   ├── HardwareChecklist.vue
│   ├── OfficialDocs.vue
│   ├── ProjectStructure.vue
│   └── TechDocs.vue
│
├── stores/                           # 状态管理
│   ├── learning.js                  # 学习进度
│   ├── tasks.js                     # 任务管理
│   ├── notes.js                     # 笔记系统
│   ├── config.js                    # 配置参数
│   └── visualization.js             # 可视化状态
│
├── data/                             # 数据文件
│   ├── detailed-tasks.js            # 任务树
│   ├── flow-definitions.js          # 流程定义
│   ├── knowledge-graph.js           # 知识图谱
│   ├── joint-mappings.js            # 关节映射
│   └── ai-config.js
│
├── utils/                            # 工具函数
│   ├── math.js                      # 数学计算
│   ├── geometry.js                  # 几何计算
│   ├── export.js                    # 数据导出
│   └── validation.js                # 参数验证
│
├── composables/                      # 组合式函数
│   ├── useJointMapping.js           # 关节映射
│   ├── useFlowChart.js              # 流程图
│   ├── useThreeD.js                 # 3D场景
│   └── useNotes.js                  # 笔记系统
│
└── router/
    └── index.js
```

### 6.2 新增路由

```javascript
{
  path: '/joint-mapping',
  name: 'JointMapping',
  component: () => import('@/views/JointMapping.vue'),
  meta: { title: '关节映射可视化' }
},
{
  path: '/flows/:flowId',
  name: 'FlowViewer',
  component: () => import('@/views/FlowViewer.vue'),
  meta: { title: '技术流程' }
},
{
  path: '/practice',
  name: 'PracticeLab',
  component: () => import('@/views/PracticeLab.vue'),
  meta: { title: '实践实验室' }
}
```

### 6.3 核心Stores

**stores/tasks.js**
```javascript
export const useTasksStore = defineStore('tasks', () => {
  const taskTree = ref(detailedTaskTree)
  const completedTasks = ref(new Set())
  const skippedTasks = ref(new Set())
  const taskNotes = ref({})

  function toggleTaskComplete(taskId)
  function skipTask(taskId)
  function addTaskNote(taskId, note)
})
```

**stores/config.js**
```javascript
export const useConfigStore = defineStore('config', () => {
  const servoConfig = ref({
    servos: Array(7).fill({
      extend_count: 3800,
      grasp_count: 1200,
      max_angle: 150,
      gear_ratio: 1.0
    })
  })

  function updateServoConfig(servoId, params)
  function exportConfig()
})
```

### 6.4 核心工具函数

**utils/math.js**
```javascript
// 位置百分比 → 脉冲数量
export function positionToPulse(percent, extendCount, graspCount) {
  const range = extendCount - graspCount
  return Math.round(graspCount + percent * range)
}

// 脉冲数量 → 关节角度
export function pulseToAngle(pulse, extendCount, graspCount, maxAngle) {
  const percent = (pulse - graspCount) / (extendCount - graspCount)
  return percent * maxAngle
}

// 关节角度 → 舵机角度
export function angleToServoAngle(jointAngle, gearRatio) {
  return jointAngle * gearRatio
}
```

---

## 7. 实施计划

### 7.1 阶段划分

**阶段一：基础设施搭建** (1-2天)
- 安装依赖 (three, echarts)
- 创建目录结构
- 创建基础Stores
- 创建工具函数

**阶段二：关节映射页面** (2-3天) ⭐核心
- 创建 useJointMapping.js
- 开发 JointMapping.vue
- 开发子组件
- 集成配置存储

**阶段三：技术流程可视化** (3-4天)
- 创建流程定义数据
- 开发流程图组件
- 创建 FlowViewer 页面
- 实现数据流动画

**阶段四：知识图谱增强** (2-3天)
- 准备知识图谱数据
- 升级 KnowledgeGraph.vue
- 添加高级功能
- 集成笔记系统

**阶段五：交互式实践功能** (2-3天)
- 任务系统集成
- 配置模拟器开发
- 笔记系统
- 代码片段库

**阶段六：3D可视化** (可选, 3-4天)
- Three.js基础搭建
- 加载机械手模型
- 关节动画实现
- 集成到关节映射页面

**阶段七：测试与优化** (1-2天)
- 功能测试
- 性能优化
- 用户体验优化
- 文档更新

### 7.2 优先级

**第一优先级** (立即开始):
- 阶段一：基础设施
- 阶段二：关节映射页面 ⭐

**第二优先级** (核心功能):
- 阶段三：技术流程可视化
- 阶段四：知识图谱增强
- 阶段五：交互式实践功能

**第三优先级** (可选增强):
- 阶段六：3D可视化

### 7.3 成功标准

- ✅ 关节映射页面完整实现，7个关节可独立控制
- ✅ 3个技术流程图可正常展示和交互
- ✅ 知识图谱支持搜索、高亮、笔记
- ✅ 任务系统无强制解锁，支持跳步
- ✅ 所有数据本地持久化
- ⏸️ 3D可视化作为可选项，视时间而定

---

## 8. 附录

### 8.1 技术参考

- [ECharts 文档](https://echarts.apache.org/)
- [Three.js 文档](https://threejs.org/docs/)
- [Vue 3 文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)

### 8.2 数据文件说明

**detailed-tasks.js**: 已有的详细任务树，包含操作步骤、前置知识、验证标准等

**flow-definitions.js**: 待创建，定义各种技术流程的节点和边

**knowledge-graph.js**: 待创建，定义知识图谱的节点关系

**joint-mappings.js**: 待创建，定义关节映射的默认参数

---

**文档版本**: 1.0
**最后更新**: 2026-01-13
**状态**: 待评审
