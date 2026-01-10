<template>
  <div class="tech-docs-page">
    <!-- 顶部搜索和筛选 -->
    <div class="docs-header card">
      <h1>📚 技术文档中心</h1>
      <p class="subtitle">AI生成的深度技术文档，帮助你全面理解Aero Hand Open项目</p>

      <el-row :gutter="20" class="mt-4">
        <el-col :span="12">
          <el-input
            v-model="searchQuery"
            placeholder="搜索文档..."
            prefix-icon="Search"
            clearable
            size="large"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="12">
          <el-select
            v-model="selectedCategory"
            placeholder="选择分类"
            size="large"
            style="width: 100%"
          >
            <el-option label="全部文档" value="all" />
            <el-option label="学习路径" value="learning-path" />
            <el-option label="模块化学习" value="modules" />
            <el-option label="完整指南" value="guides" />
            <el-option label="技术专题" value="topics" />
            <el-option label="模块文档" value="module-docs" />
          </el-select>
        </el-col>
      </el-row>
    </div>

    <!-- 文档分类 -->
    <div class="docs-content">
      <!-- 学习路径方案 -->
      <div v-if="selectedCategory === 'all' || selectedCategory === 'learning-path'" class="doc-section">
        <h2>🎯 学习路径方案</h2>
        <p class="section-desc">系统性学习路线，从基础到高级的完整学习计划</p>

        <el-row :gutter="20">
          <el-col :span="8" v-for="doc in learningPathDocs" :key="doc.id">
            <el-card class="doc-card" @click="openDoc(doc)">
              <div class="doc-icon">{{ doc.icon }}</div>
              <h3>{{ doc.title }}</h3>
              <p>{{ doc.description }}</p>
              <div class="doc-meta">
                <el-tag size="small" type="info">{{ doc.duration }}</el-tag>
                <el-tag size="small" type="success">{{ doc.level }}</el-tag>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- Scheme 1 详细模块 -->
        <div class="scheme-modules mt-4">
          <h3>📖 方案一：分层学习（6个阶段）</h3>
          <el-collapse v-model="activeScheme1">
            <el-collapse-item
              v-for="module in scheme1Modules"
              :key="module.id"
              :name="module.id"
            >
              <template #title>
                <div class="module-title">
                  <span class="module-number">{{ module.number }}</span>
                  <span class="module-name">{{ module.name }}</span>
                  <el-tag size="small" :type="module.tagType">{{ module.tag }}</el-tag>
                </div>
              </template>
              <div class="module-content">
                <p><strong>📝 内容概述：</strong>{{ module.description }}</p>
                <p><strong>⏱️ 学习时长：</strong>{{ module.duration }}</p>
                <p><strong>📂 关键文件：</strong></p>
                <ul class="file-list">
                  <li v-for="file in module.files" :key="file">
                    <el-icon><Document /></el-icon>
                    {{ file }}
                  </li>
                </ul>
                <el-button
                  type="primary"
                  size="small"
                  @click="loadMarkdownDoc(module.path)"
                >
                  查看详细文档
                </el-button>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>

      <!-- 模块化学习 -->
      <div v-if="selectedCategory === 'all' || selectedCategory === 'modules'" class="doc-section">
        <h2>🔧 模块化学习方案</h2>
        <p class="section-desc">按技术模块分类，专注学习特定技术领域</p>

        <el-row :gutter="20">
          <el-col :span="12" v-for="module in scheme2Modules" :key="module.id">
            <el-card class="module-card">
              <div class="module-header">
                <div class="module-badge">{{ module.letter }}</div>
                <h3>{{ module.name }}</h3>
              </div>
              <p class="module-desc">{{ module.description }}</p>
              <div class="module-info">
                <div class="info-item">
                  <el-icon><Clock /></el-icon>
                  <span>{{ module.duration }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Reading /></el-icon>
                  <span>{{ module.prerequisites }}</span>
                </div>
              </div>
              <div class="module-files">
                <p><strong>对应文件：</strong></p>
                <code>{{ module.files }}</code>
              </div>
              <el-button
                type="primary"
                @click="loadMarkdownDoc(module.path)"
                class="mt-3"
              >
                开始学习
              </el-button>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 完整指南 -->
      <div v-if="selectedCategory === 'all' || selectedCategory === 'guides'" class="doc-section">
        <h2>📖 AI生成技术文档 (2025-12-29 ~ 12-30)</h2>
        <p class="section-desc">深度技术分析文档，全面解析Aero Hand Open项目</p>

        <!-- 12月29日文档 -->
        <div class="date-group">
          <h3>📅 2025年12月29日</h3>
          <el-row :gutter="20">
            <el-col :span="8" v-for="guide in completeGuides.filter(g => g.date === '2025-12-29')" :key="guide.id">
              <el-card class="guide-card" @click="loadMarkdownDoc(guide.path)">
                <div class="guide-icon">{{ guide.icon }}</div>
                <h4>{{ guide.title }}</h4>
                <p>{{ guide.description }}</p>
                <div class="guide-meta">
                  <el-tag size="small" type="info">{{ guide.module }}</el-tag>
                  <el-tag size="small" type="success">12-29</el-tag>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 12月30日文档 -->
        <div class="date-group mt-4">
          <h3>📅 2025年12月30日</h3>
          <el-row :gutter="20">
            <el-col :span="8" v-for="guide in completeGuides.filter(g => g.date === '2025-12-30')" :key="guide.id">
              <el-card class="guide-card" @click="loadMarkdownDoc(guide.path)">
                <div class="guide-icon">{{ guide.icon }}</div>
                <h4>{{ guide.title }}</h4>
                <p>{{ guide.description }}</p>
                <div class="guide-meta">
                  <el-tag size="small" type="info">{{ guide.module }}</el-tag>
                  <el-tag size="small" type="warning">12-30</el-tag>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 技术专题 -->
      <div v-if="selectedCategory === 'all' || selectedCategory === 'topics'" class="doc-section">
        <h2>🔬 技术专题</h2>
        <p class="section-desc">深入探讨特定技术主题</p>

        <el-timeline>
          <el-timeline-item
            v-for="topic in technicalTopics"
            :key="topic.id"
            :timestamp="topic.date"
            placement="top"
          >
            <el-card>
              <h4>{{ topic.title }}</h4>
              <p>{{ topic.description }}</p>
              <el-button
                text
                type="primary"
                @click="loadMarkdownDoc(topic.path)"
              >
                阅读文档 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 模块文档 -->
      <div v-if="selectedCategory === 'all' || selectedCategory === 'module-docs'" class="doc-section">
        <h2>📁 模块文档</h2>
        <p class="section-desc">各模块的AI上下文文档</p>

        <el-row :gutter="20">
          <el-col :span="8" v-for="mod in moduleDocs" :key="mod.id">
            <el-card class="mod-doc-card" @click="loadMarkdownDoc(mod.path)">
              <div class="mod-doc-icon">{{ mod.icon }}</div>
              <h4>{{ mod.name }}</h4>
              <p>{{ mod.description }}</p>
              <div class="mod-stats">
                <span><el-icon><Document /></el-icon> {{ mod.fileCount }} 文件</span>
                <span><el-icon><DataAnalysis /></el-icon> {{ mod.coverage }} 覆盖率</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 文档查看器抽屉 -->
    <el-drawer
      v-model="docDrawerVisible"
      :title="currentDocTitle"
      direction="rtl"
      size="60%"
      class="doc-drawer"
    >
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading"><Loading /></el-icon>
        <p>加载中...</p>
      </div>
      <div v-else-if="currentDocContent" class="doc-content">
        <div class="markdown-body" v-html="renderedMarkdown"></div>
      </div>
      <div v-else class="empty-content">
        <el-icon><DocumentDelete /></el-icon>
        <p>文档内容为空</p>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Search,
  Document,
  Clock,
  Reading,
  ArrowRight,
  Loading,
  DocumentDelete,
  DataAnalysis
} from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'

const searchQuery = ref('')
const selectedCategory = ref('all')
const docDrawerVisible = ref(false)
const currentDocTitle = ref('')
const currentDocContent = ref('')
const loading = ref(false)
const activeScheme1 = ref(['1', '2'])

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

// 文档数据
const learningPathDocs = [
  {
    id: 'path1',
    icon: '🎯',
    title: '快速上手路径',
    description: '30-40小时快速掌握基础操作',
    duration: '30-40h',
    level: '初级',
    path: '/docs/README.md'
  },
  {
    id: 'path2',
    icon: '📚',
    title: '完整掌握路径',
    description: '50-75小时全面学习技术栈',
    duration: '50-75h',
    level: '中级',
    path: '/docs/README.md'
  },
  {
    id: 'path3',
    icon: '🔬',
    title: '研究深入路径',
    description: '80-120小时成为领域专家',
    duration: '80-120h',
    level: '高级',
    path: '/docs/README.md'
  }
]

const scheme1Modules = [
  {
    id: '1',
    number: '01',
    name: '硬件架构与机械设计',
    description: '3D打印结构、ESP32-S3、HLS3606M舵机、PCB设计原理',
    duration: '15-20小时',
    tag: '硬件层',
    tagType: 'danger',
    files: ['hardware/', 'document/'],
    path: '/learning/scheme1/01_硬件架构与机械设计.md'
  },
  {
    id: '2',
    number: '02',
    name: '固件层 - ESP32控制核心',
    description: 'Arduino框架、串口通信、16字节协议、舵机控制',
    duration: '15-20小时',
    tag: '固件层',
    tagType: 'warning',
    files: ['firmware/main/'],
    path: '/learning/scheme1/02_固件层_ESP32控制核心.md'
  },
  {
    id: '3',
    number: '03',
    name: 'SDK层 - Python控制接口',
    description: 'AeroHand类、运动学转换、GUI配置工具',
    duration: '15-20小时',
    tag: 'SDK层',
    tagType: 'success',
    files: ['sdk/src/aero_open_sdk/'],
    path: '/learning/scheme1/03_SDK层_Python控制接口.md'
  },
  {
    id: '4',
    number: '04',
    name: 'ROS2层 - 机器人系统集成',
    description: 'ROS2架构、话题通信、遥操作节点',
    duration: '15-20小时',
    tag: 'ROS2层',
    tagType: 'primary',
    files: ['ros2/'],
    path: '/learning/scheme1/04_ROS2层_机器人系统集成.md'
  },
  {
    id: '5',
    number: '05',
    name: '仿真层 - MuJoCo与强化学习',
    description: 'MuJoCo物理引擎、MJX、PPO算法训练',
    duration: '20-40小时',
    tag: '仿真层',
    tagType: 'info',
    files: ['sim_rl/'],
    path: '/learning/scheme1/05_仿真层_MuJoCo与强化学习.md'
  },
  {
    id: '6',
    number: '06',
    name: '完整工作流程与调试指南',
    description: '系统集成、调试技巧、常见问题解决',
    duration: '10-15小时',
    tag: '实践层',
    tagType: 'success',
    files: ['learning/复现指南/'],
    path: '/learning/scheme1/06_完整工作流程与调试指南.md'
  }
]

const scheme2Modules = [
  {
    id: 'ma',
    letter: 'A',
    name: '通信协议分析',
    description: '16字节二进制协议、串口通信、调试技巧',
    duration: '8-12小时',
    prerequisites: '基础编程',
    files: 'firmware/main/, sdk/src/aero_open_sdk/aero_hand.py',
    path: '/模块A_通信协议分析/通信协议分析指南.md'
  },
  {
    id: 'mb',
    letter: 'B',
    name: '运动学控制',
    description: '肌腱驱动原理、正向/逆向运动学、运动限制',
    duration: '10-15小时',
    prerequisites: '模块A，基础线性代数',
    files: 'sdk/src/aero_open_sdk/joints_to_actuations.py',
    path: '/模块B_运动学控制/运动学控制指南.md'
  },
  {
    id: 'mc',
    letter: 'C',
    name: '系统集成',
    description: '硬件-固件接口、固件-SDK通信、SDK-ROS2集成',
    duration: '12-18小时',
    prerequisites: '模块A和B，基础电子知识',
    files: 'ros2/, 系统配置',
    path: '/模块C_系统集成/系统集成指南.md'
  },
  {
    id: 'md',
    letter: 'D',
    name: '高级应用',
    description: 'MediaPipe遥操作、MuJoCo仿真、强化学习',
    duration: '20-30小时',
    prerequisites: '模块A、B、C，Python中级',
    files: 'ROS2遥操作, 仿真环境, 训练脚本',
    path: '/模块D_高级应用/高级应用指南.md'
  }
]

const completeGuides = [
  {
    id: 'cg1',
    icon: '📖',
    title: '完整实现指南',
    description: '63KB · 从零开始的完整实现文档',
    module: '整体',
    date: '2025-12-29',
    path: '/模块A_通信协议分析/AERO_HAND_COMPLETE_IMPLEMENTATION_GUIDE.md'
  },
  {
    id: 'cg2',
    icon: '📊',
    title: '实现总结',
    description: '32KB · 项目实现总结文档',
    module: '整体',
    date: '2025-12-29',
    path: '/模块A_通信协议分析/AERO_HAND_IMPLEMENTATION_SUMMARY.md'
  },
  {
    id: 'cg3',
    icon: '🤖',
    title: 'RL Sim2Real技术',
    description: '81KB · 强化学习Sim2Real技术详解',
    module: '仿真',
    date: '2025-12-29',
    path: '/模块A_通信协议分析/AERO_HAND_RL_SIM2REAL_TECHNICAL.md'
  },
  {
    id: 'cg4',
    icon: '🔄',
    title: 'Sim2Real实用指南',
    description: '31KB · 仿真到实物转移实战',
    module: '高级',
    date: '2025-12-30',
    path: '/模块A_通信协议分析/AERO_HAND_SIM2REAL_PRACTICAL_GUIDE.md'
  },
  {
    id: 'cg5',
    icon: '📊',
    title: 'Sim2Real参数参考',
    description: '29KB · 参数配置详细说明',
    module: '高级',
    date: '2025-12-30',
    path: '/模块A_通信协议分析/AERO_HAND_SIM2REAL_PARAMETERS_REFERENCE.md'
  },
  {
    id: 'cg6',
    icon: '📚',
    title: '技术栈总结',
    description: '48KB · 完整技术栈总结',
    module: '整体',
    date: '2025-12-30',
    path: '/模块A_通信协议分析/AERO_HAND_TECHNICAL_STACK_SUMMARY.md'
  }
]

const technicalTopics = [
  {
    id: 'tt1',
    title: '通信协议深度解析',
    description: '16字节协议的详细分析和实现',
    date: '2025-12-17',
    path: '/模块A_通信协议分析/通信协议分析指南.md'
  },
  {
    id: 'tt2',
    title: '肌腱驱动运动学',
    description: '理解肌腱驱动的数学模型',
    date: '2025-12-17',
    path: '/模块B_运动学控制/运动学控制指南.md'
  },
  {
    id: 'tt3',
    title: 'ROS2集成架构',
    description: 'ROS2节点设计和通信模式',
    date: '2025-12-17',
    path: '/模块C_系统集成/系统集成指南.md'
  },
  {
    id: 'tt4',
    title: '强化学习实战',
    description: 'PPO算法在Aero Hand上的应用',
    date: '2025-12-17',
    path: '/模块D_高级应用/高级应用指南.md'
  }
]

const moduleDocs = [
  {
    id: 'md1',
    icon: '⚙️',
    name: '固件模块',
    description: 'ESP32固件和协议实现',
    fileCount: '15+',
    coverage: '95%',
    path: '/firmware/CLAUDE.md'
  },
  {
    id: 'md2',
    icon: '🐍',
    name: 'SDK模块',
    description: 'Python控制接口',
    fileCount: '20+',
    coverage: '90%',
    path: '/sdk/CLAUDE.md'
  },
  {
    id: 'md3',
    icon: '🤖',
    name: 'ROS2模块',
    description: '机器人操作系统集成',
    fileCount: '10+',
    coverage: '85%',
    path: '/ros2/CLAUDE.md'
  },
  {
    id: 'md4',
    icon: '🔧',
    name: '硬件模块',
    description: '3D设计和PCB',
    fileCount: '30+',
    coverage: '80%',
    path: '/hardware/CLAUDE.md'
  },
  {
    id: 'md5',
    icon: '🎮',
    name: '仿真模块',
    description: 'MuJoCo和MJX',
    fileCount: '40+',
    coverage: '75%',
    path: '/sim_rl/CLAUDE.md'
  },
  {
    id: 'md6',
    icon: '📚',
    name: '文档模块',
    description: '舵机库和工具',
    fileCount: '10+',
    coverage: '100%',
    path: '/document/CLAUDE.md'
  }
]

// 计算渲染的Markdown
const renderedMarkdown = computed(() => {
  if (!currentDocContent.value) return ''
  return md.render(currentDocContent.value)
})

// 打开文档
function openDoc(doc) {
  loadMarkdownDoc(doc.path)
}

// 加载Markdown文档
async function loadMarkdownDoc(path) {
  loading.value = true
  docDrawerVisible.value = true
  currentDocTitle.value = path.split('/').pop() || '文档'

  try {
    // 从 GitHub raw 内容加载
    const baseUrl = 'https://raw.githubusercontent.com/tether-ia/aero-hand-open/main'
    const url = `${baseUrl}${path}`

    const response = await fetch(url)
    if (response.ok) {
      currentDocContent.value = await response.text()
    } else {
      // 尝试使用代理
      const proxyUrl = `https://cors.isomorphic-git.org/${baseUrl}${path}`
      const proxyResponse = await fetch(proxyUrl)
      if (proxyResponse.ok) {
        currentDocContent.value = await proxyResponse.text()
      } else {
        currentDocContent.value = `# 文档加载失败\n\n无法从以下路径加载文档：\n\`${path}\`\n\n请确保文件存在于GitHub仓库中。`
      }
    }
  } catch (error) {
    console.error('加载文档失败:', error)
    currentDocContent.value = `# 加载错误\n\n加载文档时发生错误：\n\`\`\`\n${error.message}\n\`\`\``
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.tech-docs-page {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
}

.docs-header h1 {
  margin: 0 0 10px 0;
  font-size: 32px;
  color: #303133;
}

.subtitle {
  margin: 0;
  font-size: 16px;
  color: #909399;
}

.mt-4 {
  margin-top: 20px;
}

.mt-3 {
  margin-top: 16px;
}

.doc-section {
  margin-bottom: 50px;
}

.doc-section h2 {
  font-size: 28px;
  color: #303133;
  margin: 0 0 10px 0;
}

.section-desc {
  color: #909399;
  font-size: 16px;
  margin-bottom: 25px;
}

/* 文档卡片 */
.doc-card {
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.doc-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.doc-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.doc-card h3 {
  font-size: 18px;
  color: #303133;
  margin: 10px 0;
}

.doc-card p {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 10px 0;
}

.doc-meta {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

/* 模块卡片 */
.module-card {
  height: 100%;
  margin-bottom: 20px;
}

.module-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.module-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
}

.module-card h3 {
  font-size: 18px;
  color: #303133;
  margin: 0;
}

.module-desc {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 15px;
}

.module-info {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #909399;
  font-size: 14px;
}

.module-files code {
  display: block;
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #1a1a1a;
  margin-bottom: 15px;
}

/* Scheme 1 折叠面板 */
.scheme-modules h3 {
  font-size: 20px;
  color: #303133;
  margin: 0 0 20px 0;
}

.module-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.module-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

.module-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.module-content {
  padding: 15px 0;
}

.module-content p {
  margin-bottom: 10px;
  color: #606266;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 10px 0;
}

.file-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  color: #606266;
  font-size: 14px;
}

/* 指南卡片 */
.guide-card {
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
  text-align: center;
}

.guide-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.guide-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.guide-card h4 {
  font-size: 16px;
  color: #303133;
  margin: 10px 0;
}

.guide-card p {
  font-size: 13px;
  color: #606266;
  margin: 10px 0;
}

.guide-meta {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 10px;
}

/* 日期分组 */
.date-group h3 {
  font-size: 18px;
  color: #667eea;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #e4e7ed;
}

/* 时间线 */
.el-timeline {
  padding-left: 10px;
}

.el-timeline-item__content {
  h4 {
    font-size: 16px;
    color: #303133;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: #606266;
    margin: 8px 0;
  }
}

/* 模块文档卡片 */
.mod-doc-card {
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.mod-doc-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.mod-doc-icon {
  font-size: 36px;
  margin-bottom: 10px;
}

.mod-doc-card h4 {
  font-size: 16px;
  color: #303133;
  margin: 10px 0;
}

.mod-doc-card p {
  font-size: 13px;
  color: #606266;
  margin: 10px 0;
}

.mod-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.mod-stats span {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #909399;
}

/* 文档抽屉 */
.doc-drawer :deep(.el-drawer__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 20px;
}

.doc-drawer :deep(.el-drawer__body) {
  padding: 20px;
  background: #f5f7fa;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 20px;
  color: #909399;
}

.loading-container .el-icon {
  font-size: 48px;
  color: #667eea;
}

.doc-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.empty-content .el-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

/* Markdown 样式 */
.markdown-body :deep(h1) {
  font-size: 28px;
  color: #303133;
  border-bottom: 2px solid #e4e7ed;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.markdown-body :deep(h2) {
  font-size: 24px;
  color: #303133;
  margin-top: 30px;
  margin-bottom: 15px;
}

.markdown-body :deep(h3) {
  font-size: 20px;
  color: #303133;
  margin-top: 25px;
  margin-bottom: 12px;
}

.markdown-body :deep(p) {
  line-height: 1.8;
  color: #606266;
  margin-bottom: 15px;
}

.markdown-body :deep(code) {
  background: #e6f3ff;
  color: #1a1a1a;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown-body :deep(pre) {
  background: #e6f3ff;
  color: #1a1a1a;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #b3d9ff;
  overflow-x: auto;
  margin: 1.5em 0;
  line-height: 1.6;
}

.markdown-body :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 25px;
  margin-bottom: 15px;
}

.markdown-body :deep(li) {
  margin-bottom: 8px;
  line-height: 1.6;
  color: #606266;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid #409eff;
  padding-left: 16px;
  margin: 15px 0;
  color: #606266;
  background: #f5f7fa;
  padding: 10px 16px;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid #dcdfe6;
  padding: 8px 12px;
  text-align: left;
}

.markdown-body :deep(th) {
  background: #f5f7fa;
  font-weight: 600;
}

.markdown-body :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

/* 响应式 */
@media (max-width: 768px) {
  .doc-card,
  .module-card,
  .guide-card,
  .mod-doc-card {
    margin-bottom: 15px;
  }

  .module-info {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
