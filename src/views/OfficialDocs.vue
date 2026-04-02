<template>
  <div class="official-docs">
    <!-- 页面头部 -->
    <div class="docs-header">
      <div class="header-content">
        <div class="header-title">
          <h1>📚 官方文档中心</h1>
          <p class="subtitle">Aero Hand Open 权威文档查阅门户</p>
        </div>
        <div class="header-meta">
          <span class="version-badge">v1.0.0</span>
          <span class="last-updated">最后更新: 2025-12-17</span>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选栏 -->
    <div class="search-filter-bar">
      <div class="search-box">
        <el-icon class="search-icon"><Search /></el-icon>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索文档..."
          class="search-input"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
          <el-icon><Close /></el-icon>
        </button>
      </div>
      <div class="filter-tabs">
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="['filter-tab', { active: activeCategory === cat.id }]"
          @click="activeCategory = cat.id"
        >
          <span class="tab-icon">{{ cat.icon }}</span>
          <span class="tab-label">{{ cat.label }}</span>
          <span class="tab-count">{{ getCategoryCount(cat.id) }}</span>
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="docs-main">
      <!-- 左侧：文档列表 -->
      <div class="docs-sidebar">
        <div class="sidebar-header">
          <h3>文档列表</h3>
          <span class="doc-count">{{ filteredDocs.length }} 篇</span>
        </div>
        <div class="doc-list">
          <div
            v-for="doc in filteredDocs"
            :key="doc.id"
            :class="['doc-card', { active: selectedDoc?.id === doc.id }]"
            @click="selectDoc(doc)"
          >
            <div class="doc-card-header">
              <span class="doc-icon">{{ doc.icon }}</span>
              <div class="doc-info">
                <h4 class="doc-title">{{ doc.title }}</h4>
                <div class="doc-tags">
                  <span
                    v-for="tag in doc.tags"
                    :key="tag"
                    class="doc-tag"
                  >{{ tag }}</span>
                </div>
              </div>
            </div>
            <p class="doc-desc">{{ doc.description }}</p>
            <div class="doc-footer">
              <span :class="['doc-category', doc.category]">{{ getCategoryLabel(doc.category) }}</span>
              <span v-if="doc.external" class="external-link">
                <el-icon><Link /></el-icon>
                外部链接
              </span>
            </div>
          </div>
          <div v-if="filteredDocs.length === 0" class="no-results">
            <el-icon size="48"><DocumentDelete /></el-icon>
            <p>未找到匹配的文档</p>
          </div>
        </div>
      </div>

      <!-- 右侧：文档详情 -->
      <div class="docs-detail">
        <div v-if="selectedDoc" class="detail-content">
          <!-- 文档头部 -->
          <div class="detail-header">
            <div class="detail-title-row">
              <span class="detail-icon">{{ selectedDoc.icon }}</span>
              <h2>{{ selectedDoc.title }}</h2>
            </div>
            <div class="detail-meta">
              <span :class="['detail-category', selectedDoc.category]">
                {{ getCategoryLabel(selectedDoc.category) }}
              </span>
              <span v-if="selectedDoc.version" class="detail-version">
                版本: {{ selectedDoc.version }}
              </span>
              <span v-if="selectedDoc.author" class="detail-author">
                作者: {{ selectedDoc.author }}
              </span>
            </div>
            <div class="detail-tags">
              <span v-for="tag in selectedDoc.tags" :key="tag" class="detail-tag">
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- 适用场景 -->
          <div v-if="selectedDoc.scenarios?.length" class="detail-section scenarios">
            <h3><el-icon><Location /></el-icon> 适用场景</h3>
            <ul>
              <li v-for="scenario in selectedDoc.scenarios" :key="scenario">
                {{ scenario }}
              </li>
            </ul>
          </div>

          <!-- 内容 -->
          <div class="detail-body markdown-body" v-html="renderedContent"></div>

          <!-- 相关文档 -->
          <div v-if="selectedDoc.relatedDocs?.length" class="detail-section related">
            <h3><el-icon><Connection /></el-icon> 相关文档</h3>
            <div class="related-list">
              <div
                v-for="relatedId in selectedDoc.relatedDocs"
                :key="relatedId"
                class="related-item"
                @click="selectDocById(relatedId)"
              >
                <span class="related-icon">{{ getDocIcon(relatedId) }}</span>
                <span class="related-title">{{ getDocTitle(relatedId) }}</span>
                <el-icon class="arrow"><ArrowRight /></el-icon>
              </div>
            </div>
          </div>

          <!-- 外部链接 -->
          <div v-if="selectedDoc.externalLinks?.length" class="detail-section external">
            <h3><el-icon><Link /></el-icon> 外部资源</h3>
            <div class="external-links">
              <a
                v-for="link in selectedDoc.externalLinks"
                :key="link.url"
                :href="link.url"
                target="_blank"
                class="external-link-item"
              >
                <span class="link-title">{{ link.title }}</span>
                <span class="link-desc">{{ link.description }}</span>
                <el-icon class="link-icon"><TopRight /></el-icon>
              </a>
            </div>
          </div>
        </div>

        <!-- 未选择文档 -->
        <div v-else class="no-selection">
          <div class="no-selection-content">
            <el-icon size="80"><Document /></el-icon>
            <h3>选择一个文档</h3>
            <p>从左侧列表选择文档查看详情</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MarkdownIt from 'markdown-it'
import { extendedKnowledge } from '@/data/knowledge-extended.js'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

// 搜索和筛选
const searchQuery = ref('')
const activeCategory = ref('all')
const selectedDoc = ref(null)

// 文档分类
const categories = [
  { id: 'all', label: '全部', icon: '📖' },
  { id: 'intro', label: '项目介绍', icon: '🏠' },
  { id: 'hardware', label: '硬件', icon: '🔧' },
  { id: 'firmware', label: '固件', icon: '⚡' },
  { id: 'sdk', label: 'SDK', icon: '💻' },
  { id: 'ros2', label: 'ROS2', icon: '🤖' },
  { id: 'simulation', label: '仿真', icon: '🎮' }
]

// 文档数据结构
const docs = [
  {
    id: 'intro-overview',
    title: '项目概述',
    icon: '🏠',
    category: 'intro',
    description: 'Aero Hand Open 项目简介、核心特点、与商业方案对比',
    version: '1.0.0',
    tags: ['入门', '概述', '对比'],
    scenarios: [
      '初次了解 Aero Hand Open 项目',
      '评估项目是否适合您的研究需求',
      '与商业灵巧手方案进行对比选型'
    ],
    content: extendedKnowledge.officialDocs.intro?.content || '',
    relatedDocs: ['hardware-bom', 'firmware-flashing', 'sdk-install'],
    externalLinks: [
      { title: 'GitHub 仓库', url: 'https://github.com/TetherIA/aero-hand-open', description: '官方源码仓库' },
      { title: '项目主页', url: 'https://aero-hand-open.io', description: '官方网站' }
    ]
  },
  {
    id: 'hardware-bom',
    title: '硬件清单',
    icon: '📦',
    category: 'hardware',
    description: '完整零件清单、3D打印文件、采购建议和成本估算',
    version: '1.0.0',
    tags: ['采购', '零件', '成本'],
    scenarios: [
      '准备组装前的零件采购',
      '评估项目总体成本',
      '核对已有零件库存'
    ],
    content: extendedKnowledge.officialDocs.hardware?.content || '',
    relatedDocs: ['assembly-guide', 'firmware-flashing'],
    externalLinks: [
      { title: 'PCB 设计文件', url: './hardware/PCB/', description: 'KiCad 设计文件' },
      { title: '3D 模型下载', url: './hardware/CAD/', description: 'STEP 和 STL 文件' }
    ]
  },
  {
    id: 'assembly-guide',
    title: '组装指南',
    icon: '🔧',
    category: 'hardware',
    description: '详细组装步骤、舵机测试、常见问题解决',
    version: '1.0.0',
    tags: ['组装', '教程', '调试'],
    scenarios: [
      '按照步骤组装机械手',
      '测试和调试组装后的硬件',
      '排查组装过程中的问题'
    ],
    content: extendedKnowledge.officialDocs.assembly?.content || '',
    relatedDocs: ['hardware-bom', 'firmware-flashing', 'examples-run'],
    externalLinks: [
      { title: '视频教程', url: 'https://youtube.com/playlist', description: '组装过程演示视频' }
    ]
  },
  {
    id: 'firmware-flashing',
    title: '固件烧录指南',
    icon: '⚡',
    category: 'firmware',
    description: 'ESP32 固件烧录方法、配置参数、测试验证',
    version: '1.0.0',
    tags: ['烧录', 'ESP32', '配置'],
    scenarios: [
      '将固件烧录到 ESP32-S3',
      '配置舵机端点参数',
      '测试固件功能'
    ],
    content: extendedKnowledge.officialDocs.firmware?.content || '',
    relatedDocs: ['examples-run', 'sdk-install'],
    externalLinks: [
      { title: 'PlatformIO 文档', url: 'https://docs.platformio.org/', description: 'PlatformIO 使用指南' },
      { title: 'Arduino ESP32', url: 'https://github.com/espressif/arduino-esp32', description: 'ESP32 Arduino 核心' }
    ]
  },
  {
    id: 'sdk-install',
    title: 'SDK 安装指南',
    icon: '💻',
    category: 'sdk',
    description: 'Python SDK 安装、环境配置、快速开始',
    version: '1.0.0',
    tags: ['安装', 'Python', '配置'],
    scenarios: [
      '安装 aero-open-sdk Python 包',
      '配置开发环境',
      '运行第一个示例'
    ],
    content: `
## SDK 简介

Aero Open SDK 是控制 Aero Hand 的 Python 接口，提供简洁的 API 来操作机械手。

### 安装方式

#### 使用 pip（推荐）

\`\`\`bash
pip install aero-open-sdk
\`\`\`

#### 从源码安装

\`\`\`bash
git clone https://github.com/TetherIA/aero-hand-open
cd aero-hand-open/sdk
pip install -e .
\`\`\`

### 快速开始

\`\`\`python
from aero_open_sdk import AeroHand

# 创建控制实例
hand = AeroHand()

# 归位
hand.home()

# 设置关节位置 (0-100)
hand.set_joint_positions([50, 50, 50, 50, 50, 50])
\`\`\`

### 系统要求

- Python 3.10+
- 支持 Windows、Linux、macOS
- 串口通信（921600 波特率）
`,
    relatedDocs: ['examples-run', 'firmware-flashing'],
    externalLinks: [
      { title: 'PyPI 页面', url: 'https://pypi.org/project/aero-open-sdk/', description: 'PyPI 包页面' },
      { title: 'SDK GitHub', url: 'https://github.com/TetherIA/aero-hand-open/tree/main/sdk', description: 'SDK 源码' }
    ]
  },
  {
    id: 'examples-run',
    title: '示例脚本详解',
    icon: '📜',
    category: 'sdk',
    description: 'run_sequence.py 详解、动作序列、自定义手势',
    version: '1.0.0',
    tags: ['示例', '教程', '进阶'],
    scenarios: [
      '学习使用示例脚本',
      '创建自定义动作序列',
      '实现平滑过渡动画'
    ],
    content: extendedKnowledge.officialDocs.examples?.content || '',
    relatedDocs: ['sdk-install', 'sim-teleop'],
    externalLinks: [
      { title: '示例代码仓库', url: 'https://github.com/TetherIA/aero-hand-open/tree/main/sdk/examples', description: '所有示例脚本' }
    ]
  },
  {
    id: 'ros2-setup',
    title: 'ROS2 集成',
    icon: '🤖',
    category: 'ros2',
    description: 'ROS2 节点、消息类型、遥操作集成',
    version: '1.0.0',
    tags: ['ROS2', '集成', '通信'],
    scenarios: [
      '将 Aero Hand 集成到 ROS2 系统',
      '使用 ROS2 消息控制机械手',
      '开发自定义 ROS2 节点'
    ],
    content: `
## ROS2 集成概述

Aero Hand Open 提供完整的 ROS2 Humble 支持。

### 包结构

\`\`\`
ros2/
├── aero_hand_bringup/     # 启动文件
├── aero_hand_msgs/        # 消息定义
├── aero_hand_nodes/      # 控制节点
└── aero_hand_teleop/     # 遥操作
\`\`\`

### 消息类型

#### JointCommand

\`\`\`yaml
uint8 MODE_POSITION = 0
uint8 MODE_VELOCITY = 1
uint8 MODE_TORQUE = 2

uint8 mode
float32[] positions      # 0-100
float32[] velocities     # 可选
duration timeout
\`\`\`

#### JointState

\`\`\`yaml
float32[] positions
float32[] velocities
float32[] efforts
bool[] calibrated
\`\`\`

### 快速开始

\`\`\`bash
# 安装
cd ~/colcon_ws/src
git clone https://github.com/TetherIA/aero-hand-open
cd ~/colcon_ws
colcon build --packages-select aero_hand_msgs aero_hand_nodes
source install/setup.bash

# 运行
ros2 launch aero_hand_bringup minimal.launch.py
\`\`\`
`,
    relatedDocs: ['sdk-install', 'sim-teleop'],
    externalLinks: [
      { title: 'ROS2 文档', url: 'https://docs.ros.org/en/humble/', description: 'ROS2 Humble 官方文档' }
    ]
  },
  {
    id: 'sim-teleop',
    title: '遥操作 Sim2Real',
    icon: '🎮',
    category: 'simulation',
    description: '遥操作数据采集、行为克隆训练、策略部署',
    version: '1.0.0',
    tags: ['Sim2Real', '遥操作', 'RL'],
    scenarios: [
      '采集遥操作数据训练策略',
      '使用行为克隆快速获得策略',
      '将训练好的策略部署到真实硬件'
    ],
    content: extendedKnowledge.sim2real?.teleoperation?.content || '',
    relatedDocs: ['examples-run', 'sim-cube-rotate'],
    externalLinks: [
      { title: 'MuJoCo 文档', url: 'https://mujoco.readthedocs.io/', description: 'MuJoCo 物理引擎文档' },
      { title: 'mujoco_playground', url: 'https://github.com/google-deepmind/mujoco_playground', description: 'DeepMind MuJoCo 工具集' }
    ]
  },
  {
    id: 'sim-cube-rotate',
    title: '魔方旋转任务',
    icon: '🧊',
    category: 'simulation',
    description: 'PPO 训练、策略导出、Sim2Real 部署',
    version: '1.0.0',
    tags: ['PPO', '强化学习', '训练'],
    scenarios: [
      '训练强化学习策略完成魔方旋转',
      '分析训练曲线和调试策略',
      '将策略从仿真迁移到真实硬件'
    ],
    content: extendedKnowledge.sim2real?.cubeRotate?.content || '',
    relatedDocs: ['sim-teleop', 'sdk-install'],
    externalLinks: [
      { title: 'JAX/Flax', url: 'https://flax.readthedocs.io/', description: 'JAX 神经网络框架' },
      { title: 'WandB', url: 'https://wandb.ai/', description: '训练可视化工具' }
    ]
  }
]

// 计算属性
const filteredDocs = computed(() => {
  let result = docs

  // 按分类筛选
  if (activeCategory.value !== 'all') {
    result = result.filter(doc => doc.category === activeCategory.value)
  }

  // 按搜索词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(doc =>
      doc.title.toLowerCase().includes(query) ||
      doc.description.toLowerCase().includes(query) ||
      doc.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return result
})

// 方法
const getCategoryCount = (categoryId) => {
  if (categoryId === 'all') return docs.length
  return docs.filter(doc => doc.category === categoryId).length
}

const getCategoryLabel = (categoryId) => {
  const cat = categories.find(c => c.id === categoryId)
  return cat ? cat.label : categoryId
}

const getDocIcon = (docId) => {
  const doc = docs.find(d => d.id === docId)
  return doc ? doc.icon : '📄'
}

const getDocTitle = (docId) => {
  const doc = docs.find(d => d.id === docId)
  return doc ? doc.title : docId
}

const selectDoc = (doc) => {
  selectedDoc.value = doc
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const selectDocById = (docId) => {
  const doc = docs.find(d => d.id === docId)
  if (doc) selectDoc(doc)
}

const renderedContent = computed(() => {
  if (!selectedDoc.value?.content) return ''
  return md.render(selectedDoc.value.content)
})
</script>

<style scoped>
.official-docs {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

/* 页面头部 */
.docs-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-title h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.version-badge {
  background: rgba(255,255,255,0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.last-updated {
  font-size: 12px;
  opacity: 0.8;
}

/* 搜索和筛选栏 */
.search-filter-bar {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.search-box {
  position: relative;
  margin-bottom: 16px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #909399;
}

.search-input {
  width: 100%;
  padding: 12px 40px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #909399;
  padding: 4px;
}

.clear-btn:hover {
  color: #409eff;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f5f7fa;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
  transition: all 0.2s;
}

.filter-tab:hover {
  background: #e4e7ed;
}

.filter-tab.active {
  background: #667eea;
  color: white;
}

.tab-count {
  background: rgba(0,0,0,0.1);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
}

.filter-tab.active .tab-count {
  background: rgba(255,255,255,0.2);
}

/* 主内容区 */
.docs-main {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
}

/* 侧边栏 */
.docs-sidebar {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.doc-count {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 10px;
}

.doc-list {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.doc-card {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.2s;
}

.doc-card:hover {
  background: #f5f7fa;
}

.doc-card.active {
  background: #f0f3ff;
  border-left: 3px solid #667eea;
}

.doc-card-header {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.doc-icon {
  font-size: 24px;
  line-height: 1;
}

.doc-info {
  flex: 1;
  min-width: 0;
}

.doc-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.doc-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.doc-tag {
  font-size: 10px;
  padding: 1px 6px;
  background: #e4e7ed;
  border-radius: 4px;
  color: #606266;
}

.doc-desc {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.doc-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.doc-category {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.doc-category.intro { background: #e8f4ff; color: #1890ff; }
.doc-category.hardware { background: #fff7e6; color: #fa8c16; }
.doc-category.firmware { background: #fff1f0; color: #ff4d4f; }
.doc-category.sdk { background: #f6ffed; color: #52c41a; }
.doc-category.ros2 { background: #f9f0ff; color: #722ed1; }
.doc-category.simulation { background: #fff0f5; color: #eb2f96; }

.external-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #909399;
}

.no-results {
  padding: 40px 20px;
  text-align: center;
  color: #909399;
}

.no-results p {
  margin: 12px 0 0 0;
}

/* 详情区 */
.docs-detail {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  min-height: 600px;
}

.detail-content {
  padding: 32px;
}

.detail-header {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e4e7ed;
}

.detail-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.detail-icon {
  font-size: 32px;
}

.detail-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.detail-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #606266;
}

.detail-version, .detail-author {
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-category {
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.detail-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.detail-tag {
  font-size: 12px;
  padding: 4px 12px;
  background: #f5f7fa;
  border-radius: 16px;
  color: #606266;
}

.detail-section {
  margin: 24px 0;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.detail-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-section.scenarios ul {
  margin: 0;
  padding-left: 20px;
}

.detail-section.scenarios li {
  margin: 8px 0;
  color: #606266;
  line-height: 1.6;
}

/* Markdown 内容样式 */
.detail-body {
  line-height: 1.8;
  color: #2c3e50;
}

.detail-body :deep(h1) {
  font-size: 1.8em;
  margin: 1.5em 0 0.5em 0;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.detail-body :deep(h2) {
  font-size: 1.5em;
  margin: 1.5em 0 0.5em 0;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.detail-body :deep(h3) {
  font-size: 1.25em;
  margin: 1.5em 0 0.5em 0;
}

.detail-body :deep(p) {
  margin: 1em 0;
}

.detail-body :deep(code) {
  background: #f6f8fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  color: #e74c3c;
}

.detail-body :deep(pre) {
  background: #1a1a1a;
  color: #e0e0e0;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5em 0;
  line-height: 1.6;
}

.detail-body :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
}

.detail-body :deep(blockquote) {
  border-left: 4px solid #667eea;
  padding-left: 16px;
  margin: 1.5em 0;
  color: #666;
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 0 4px 4px 0;
}

.detail-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5em 0;
}

.detail-body :deep(th),
.detail-body :deep(td) {
  border: 1px solid #e4e7ed;
  padding: 8px 12px;
  text-align: left;
}

.detail-body :deep(th) {
  background: #f5f7fa;
  font-weight: 600;
}

.detail-body :deep(ul),
.detail-body :deep(ol) {
  margin: 1em 0;
  padding-left: 2em;
}

.detail-body :deep(li) {
  margin: 0.5em 0;
}

/* 相关文档 */
.related-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.related-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.related-item:hover {
  background: #f0f3ff;
}

.related-icon {
  font-size: 18px;
}

.related-title {
  flex: 1;
  font-size: 14px;
  color: #303133;
}

.related-item .arrow {
  color: #c0c4cc;
  transition: transform 0.2s;
}

.related-item:hover .arrow {
  transform: translateX(4px);
  color: #667eea;
}

/* 外部链接 */
.external-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.external-link-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.2s;
}

.external-link-item:hover {
  background: #f0f3ff;
  transform: translateX(4px);
}

.link-title {
  font-weight: 600;
  color: #1890ff;
  font-size: 14px;
}

.link-desc {
  flex: 1;
  font-size: 12px;
  color: #909399;
}

.link-icon {
  color: #c0c4cc;
}

/* 未选择状态 */
.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  color: #c0c4cc;
}

.no-selection-content {
  text-align: center;
}

.no-selection-content h3 {
  margin: 16px 0 8px 0;
  font-size: 18px;
  color: #909399;
}

.no-selection-content p {
  margin: 0;
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 1024px) {
  .docs-main {
    grid-template-columns: 1fr;
  }

  .doc-list {
    max-height: 400px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
