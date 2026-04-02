<template>
  <div class="flow-viewer-page">
    <el-page-header @back="$router.back()" title="返回">
      <template #content>
        <span class="page-title">{{ flowDefinition?.name || '技术流程' }}</span>
      </template>
    </el-page-header>

    <!-- 流程类型选择标签页 -->
    <div class="flow-tabs">
      <el-tabs v-model="activeFlowType" @tab-change="handleFlowTypeChange">
        <el-tab-pane label="控制流" name="control">
          <template #label>
            <span class="tab-label">
              <el-icon><Connection /></el-icon>
              控制流
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="反馈流" name="feedback">
          <template #label>
            <span class="tab-label">
              <el-icon><RefreshRight /></el-icon>
              反馈流
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="训练流" name="training">
          <template #label>
            <span class="tab-label">
              <el-icon><Cpu /></el-icon>
              训练流
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="开发流" name="development">
          <template #label>
            <span class="tab-label">
              <el-icon><FolderOpened /></el-icon>
              开发流
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="flow-content">
      <!-- 左侧：流程列表 + 概览 -->
      <div class="flow-sidebar">
        <el-card shadow="hover" class="flow-selector-card">
          <template #header>
            <span>选择流程</span>
          </template>

          <div class="flow-filter">
            <el-input
              v-model="flowSearchQuery"
              placeholder="搜索流程..."
              prefix-icon="Search"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="difficultyFilter" placeholder="难度" class="difficulty-select">
              <el-option label="全部" value="all" />
              <el-option label="入门" value="beginner" />
              <el-option label="进阶" value="intermediate" />
              <el-option label="高级" value="advanced" />
            </el-select>
          </div>

          <div v-if="filteredFlowList.length" class="flow-list">
            <div
              v-for="flow in filteredFlowList"
              :key="flow.id"
              class="flow-item"
              :class="{ active: currentFlowId === flow.id }"
              @click="selectFlow(flow.id)"
            >
              <el-icon :size="24" :color="flow.color">
                <component :is="iconMap[flow.icon]" />
              </el-icon>
              <div class="flow-info">
                <div class="flow-name">{{ flow.name }}</div>
                <div class="flow-desc">{{ flow.description }}</div>
                <div class="flow-meta">
                  <el-tag size="small" :type="getDifficultyType(flow.difficulty)">
                    {{ getDifficultyLabel(flow.difficulty) }}
                  </el-tag>
                  <span class="flow-duration">
                    <el-icon><Clock /></el-icon>
                    {{ flow.duration }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-else description="没有匹配的流程" />
        </el-card>

        <el-card shadow="hover" class="flow-overview-card">
          <template #header>
            <span>流程概览</span>
          </template>

          <div class="overview-content">
            <div class="overview-title">{{ flowDefinition?.name || '请选择流程' }}</div>
            <div class="overview-desc">{{ flowDefinition?.description || '选择左侧流程以查看详细内容。' }}</div>
            <div v-if="flowDefinition" class="overview-meta">
              <el-tag size="small" :type="getDifficultyType(currentFlowMeta?.difficulty)">
                {{ getDifficultyLabel(currentFlowMeta?.difficulty) }}
              </el-tag>
              <el-tag size="small" type="info">{{ flowDefinition.type }}</el-tag>
              <el-tag size="small" type="success">{{ currentFlowMeta?.duration }}</el-tag>
            </div>

            <div v-if="flowDefinition" class="overview-stats">
              <div class="stat-item">
                <span class="stat-label">节点数量</span>
                <span class="stat-value">{{ flowDefinition.nodes?.length || 0 }}</span>
              </div>
              <div class="stat-item" v-if="flowDefinition.lanes">
                <span class="stat-label">泳道数量</span>
                <span class="stat-value">{{ flowDefinition.lanes.length }}</span>
              </div>
              <div class="stat-item" v-if="flowDefinition.edges">
                <span class="stat-label">连接数量</span>
                <span class="stat-value">{{ flowDefinition.edges.length }}</span>
              </div>
            </div>

            <div v-if="orderedNodes.length" class="overview-steps">
              <div class="steps-title">关键步骤</div>
              <ol>
                <li v-for="node in orderedNodes" :key="node.id">
                  <span class="step-name">{{ node.label || node.name }}</span>
                  <span v-if="node.laneName" class="step-meta">· {{ node.laneName }}</span>
                </li>
              </ol>
            </div>
          </div>
        </el-card>

        <!-- 动画控制面板 -->
        <el-card shadow="hover" class="animation-control-card">
          <template #header>
            <span>动画演示</span>
          </template>

          <div class="animation-controls">
            <div class="control-row">
              <el-button type="primary" @click="toggleAnimation" :icon="isAnimating ? 'VideoPause' : 'VideoPlay'">
                {{ isAnimating ? '暂停' : '播放' }}
              </el-button>
              <el-button @click="resetAnimation" :icon="RefreshRight">重置</el-button>
            </div>

            <div class="control-row">
              <span class="control-label">速度:</span>
              <el-slider v-model="animationSpeed" :min="0.5" :max="3" :step="0.5" :show-tooltip="true" class="speed-slider" />
              <span class="speed-value">{{ animationSpeed }}x</span>
            </div>

            <div class="control-row">
              <span class="control-label">当前步骤:</span>
              <el-input-number
                v-model="currentStep"
                :min="0"
                :max="maxStep"
                size="small"
                @change="jumpToStep"
              />
              <span class="step-info">/ {{ maxStep }}</span>
            </div>

            <div class="progress-bar">
              <el-progress
                :percentage="progressPercentage"
                :stroke-width="8"
                :show-text="false"
                :color="progressColor"
              />
            </div>

            <div class="current-step-label" v-if="currentStepNode">
              <el-tag :type="getNodeTypeTag(currentStepNode.type)" effect="dark">
                {{ currentStepNode.label || currentStepNode.name }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 流程图展示 -->
      <el-card shadow="hover" class="flow-chart-card">
        <template #header>
          <div class="chart-header">
            <div class="header-left">
              <span class="chart-title">{{ flowDefinition?.name }}</span>
              <el-select v-model="currentFlowId" placeholder="选择流程" class="flow-select" @change="selectFlow">
                <el-option
                  v-for="flow in flowList"
                  :key="flow.id"
                  :label="flow.name"
                  :value="flow.id"
                />
              </el-select>
            </div>
            <div class="header-actions">
              <el-button text @click="resetZoom" title="重置视图">
                <el-icon><FullScreen /></el-icon>
                重置
              </el-button>
              <el-button text @click="zoomIn" title="放大">
                <el-icon><ZoomIn /></el-icon>
              </el-button>
              <el-button text @click="zoomOut" title="缩小">
                <el-icon><ZoomOut /></el-icon>
              </el-button>
              <el-dropdown @command="handleExport">
                <el-button text>
                  <el-icon><Download /></el-icon>
                  导出
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="png">导出为 PNG</el-dropdown-item>
                    <el-dropdown-item command="svg">导出为 SVG</el-dropdown-item>
                    <el-dropdown-item command="json">导出为 JSON</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </template>

        <div class="chart-container" ref="chartContainerRef">
          <!-- SVG 流程图 -->
          <svg
            v-if="flowDefinition?.type === 'linear' || flowDefinition?.type === 'control'"
            ref="svgChartRef"
            class="flow-svg"
            :viewBox="svgViewBox"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#409EFF" />
              </marker>
              <marker
                id="arrowhead-active"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#67C23A" />
              </marker>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.2" />
              </filter>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <!-- 连接线 -->
            <g class="connections">
              <path
                v-for="(edge, index) in svgEdges"
                :key="'edge-' + index"
                :d="edge.path"
                class="connection-line"
                :class="{
                  active: isEdgeActive(edge),
                  reversed: edge.reversed
                }"
                :marker-end="isEdgeActive(edge) ? 'url(#arrowhead-active)' : 'url(#arrowhead)'"
              />
            </g>

            <!-- 节点 -->
            <g class="nodes">
              <g
                v-for="(node, index) in svgNodes"
                :key="'node-' + node.id"
                :transform="`translate(${node.x}, ${node.y})`"
                class="flow-node"
                :class="{
                  active: isNodeActive(node),
                  clickable: true
                }"
                @click="handleNodeClick(node)"
                @mouseenter="hoveredNode = node"
                @mouseleave="hoveredNode = null"
              >
                <!-- 卡片背景 -->
                <rect
                  x="-70"
                  y="-35"
                  width="140"
                  height="70"
                  rx="8"
                  class="node-card"
                  :class="[node.type, { active: isNodeActive(node), hovered: hoveredNode?.id === node.id }]"
                  filter="url(#shadow)"
                />
                <!-- 节点图标 -->
                <circle
                  :cx="-50"
                  cy="-15"
                  r="12"
                  class="node-icon-bg"
                  :fill="getNodeColor(node.type)"
                />
                <text
                  :x="-50"
                  y="-11"
                  class="node-icon"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  fill="white"
                  font-size="10"
                >
                  {{ getNodeIcon(node.type) }}
                </text>
                <!-- 节点标签 -->
                <text
                  x="0"
                  y="-5"
                  class="node-label"
                  text-anchor="middle"
                >
                  {{ node.label }}
                </text>
                <!-- 节点描述 -->
                <text
                  x="0"
                  y="12"
                  class="node-desc"
                  text-anchor="middle"
                >
                  {{ truncateText(node.description, 20) }}
                </text>
                <!-- 活跃指示器 -->
                <circle
                  v-if="isNodeActive(node)"
                  cx="55"
                  cy="-20"
                  r="6"
                  class="active-indicator"
                  fill="#67C23A"
                >
                  <animate
                    attributeName="opacity"
                    values="1;0.3;1"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </circle>
                <!-- 步骤编号 -->
                <circle
                  cx="-55"
                  cy="20"
                  r="10"
                  class="step-number-bg"
                />
                <text
                  x="-55"
                  y="24"
                  class="step-number"
                  text-anchor="middle"
                >
                  {{ index + 1 }}
                </text>
              </g>
            </g>
          </svg>

          <!-- 并行泳道图 -->
          <svg
            v-else-if="flowDefinition?.type === 'parallel'"
            ref="svgChartRef"
            class="flow-svg parallel"
            :viewBox="svgViewBox"
          >
            <defs>
              <marker id="lane-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#909399" />
              </marker>
              <marker id="lane-arrow-active" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#67C23A" />
              </marker>
            </defs>

            <!-- 泳道背景 -->
            <g class="lanes">
              <rect
                v-for="(lane, index) in flowDefinition.lanes"
                :key="'lane-' + lane.id"
                :x="laneMargin"
                :y="index * laneHeight + headerHeight"
                :width="svgWidth - laneMargin * 2"
                :height="laneHeight - 10"
                rx="4"
                class="lane-bg"
                :class="{ active: isLaneActive(lane) }"
              />
              <text
                v-for="(lane, index) in flowDefinition.lanes"
                :key="'lane-label-' + lane.id"
                :x="laneMargin + 10"
                :y="index * laneHeight + headerHeight + 20"
                class="lane-label"
              >
                {{ lane.name }}
              </text>
            </g>

            <!-- 连接线 -->
            <g class="connections">
              <path
                v-for="(edge, index) in svgEdges"
                :key="'edge-' + index"
                :d="edge.path"
                class="connection-line"
                :class="{ active: isEdgeActive(edge), crossLane: edge.crossLane }"
                :marker-end="isEdgeActive(edge) ? 'url(#lane-arrow-active)' : 'url(#lane-arrow)'"
              />
            </g>

            <!-- 节点 -->
            <g class="nodes">
              <g
                v-for="node in svgNodes"
                :key="'node-' + node.id"
                :transform="`translate(${node.x}, ${node.y})`"
                class="flow-node"
                :class="{ active: isNodeActive(node) }"
                @click="handleNodeClick(node)"
              >
                <rect
                  x="-50"
                  y="-25"
                  width="100"
                  height="50"
                  rx="6"
                  class="node-card"
                  :class="[node.type, { active: isNodeActive(node) }]"
                />
                <text x="0" y="-5" class="node-label" text-anchor="middle">
                  {{ node.label }}
                </text>
                <text x="0" y="12" class="node-desc" text-anchor="middle">
                  {{ truncateText(node.description || '', 15) }}
                </text>
                <circle
                  v-if="isNodeActive(node)"
                  cx="40"
                  cy="-15"
                  r="5"
                  class="active-indicator"
                  fill="#67C23A"
                />
              </g>
            </g>
          </svg>

          <!-- 树形图 -->
          <svg
            v-else-if="flowDefinition?.type === 'tree'"
            ref="svgChartRef"
            class="flow-svg tree"
            :viewBox="svgViewBox"
          >
            <defs>
              <marker id="tree-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#409EFF" />
              </marker>
            </defs>

            <!-- 连接线 -->
            <g class="connections">
              <path
                v-for="(edge, index) in svgEdges"
                :key="'edge-' + index"
                :d="edge.path"
                class="connection-line"
                marker-end="url(#tree-arrow)"
              />
            </g>

            <!-- 节点 -->
            <g class="nodes">
              <g
                v-for="node in svgNodes"
                :key="'node-' + node.id"
                :transform="`translate(${node.x}, ${node.y})`"
                class="flow-node"
                :class="{ active: isNodeActive(node) }"
                @click="handleNodeClick(node)"
              >
                <rect
                  x="-55"
                  y="-25"
                  width="110"
                  height="50"
                  rx="6"
                  class="node-card"
                  :class="[node.type, { active: isNodeActive(node) }]"
                />
                <text x="0" y="-5" class="node-label" text-anchor="middle">
                  {{ node.label }}
                </text>
                <text x="0" y="12" class="node-desc" text-anchor="middle">
                  {{ truncateText(node.description || '', 18) }}
                </text>
              </g>
            </g>
          </svg>

          <!-- 无流程图时显示 -->
          <el-empty v-else description="请选择一个流程" />
        </div>

        <div v-if="flowDefinition" class="flow-legend">
          <span class="legend-title">图例说明</span>
          <div class="legend-items">
            <span class="legend-item">
              <span class="legend-dot input"></span>输入/输出
            </span>
            <span class="legend-item">
              <span class="legend-dot process"></span>过程
            </span>
            <span class="legend-item">
              <span class="legend-dot decision"></span>判断
            </span>
            <span class="legend-item">
              <span class="legend-dot data"></span>数据
            </span>
          </div>
        </div>
      </el-card>

      <!-- 节点详情 -->
      <el-card v-if="selectedNode" shadow="hover" class="node-detail-card">
        <template #header>
          <div class="detail-header">
            <span>节点详情</span>
            <el-button text size="small" @click="selectedNode = null">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </template>

        <div class="node-detail-content">
          <div class="node-title">
            <el-tag :type="getNodeTypeTag(selectedNode.type)" size="large" effect="dark">
              {{ selectedNode.name || selectedNode.label }}
            </el-tag>
            <el-tag v-if="selectedNode.stepNumber" size="small" type="info">
              步骤 {{ selectedNode.stepNumber }}
            </el-tag>
          </div>

          <div v-if="selectedNode.description" class="node-description">
            <div class="detail-label">描述</div>
            <div class="detail-value">{{ selectedNode.description }}</div>
          </div>

          <div v-if="selectedNode.files && selectedNode.files.length" class="node-files">
            <div class="detail-label">
              <el-icon><Document /></el-icon>
              涉及文件
            </div>
            <div class="files-list">
              <div v-for="file in selectedNode.files" :key="file.path" class="file-item">
                <el-link :href="file.path" type="primary" class="file-path">
                  {{ file.path }}
                </el-link>
                <span v-if="file.functions" class="file-functions">
                  <el-tag
                    v-for="func in file.functions"
                    :key="func"
                    size="small"
                    type="info"
                    class="function-tag"
                  >
                    {{ func }}
                  </el-tag>
                </span>
              </div>
            </div>
          </div>

          <div v-if="selectedNode.data && Object.keys(selectedNode.data).length > 0" class="node-data">
            <div class="detail-label">参数</div>
            <div class="data-list">
              <div v-for="(value, key) in selectedNode.data" :key="key" class="data-item">
                <span class="data-key">{{ key }}:</span>
                <span class="data-value">{{ value }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedNode.note" class="node-note">
            <div class="detail-label">
              <el-icon><Comment /></el-icon>
              注释
            </div>
            <div class="note-content">
              <el-input
                v-model="selectedNode.note"
                type="textarea"
                :rows="3"
                placeholder="添加注释..."
                @blur="saveNodeNote"
              />
            </div>
          </div>
        </div>
      </el-card>

      <!-- 步骤注释面板 -->
      <el-card v-if="showStepNotes" shadow="hover" class="step-notes-card">
        <template #header>
          <div class="detail-header">
            <span>步骤注释</span>
            <el-button text size="small" @click="showStepNotes = false">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </template>

        <div class="step-notes-content">
          <div v-if="currentStepNode" class="current-note">
            <div class="note-title">
              <span class="note-label">当前步骤:</span>
              <el-tag :type="getNodeTypeTag(currentStepNode.type)">
                {{ currentStepNode.label || currentStepNode.name }}
              </el-tag>
            </div>
            <el-input
              v-model="stepNotes[currentStep]"
              type="textarea"
              :rows="4"
              placeholder="为此步骤添加注释..."
            />
          </div>

          <div class="notes-list">
            <div class="notes-header">所有注释 ({{ Object.keys(stepNotes).length }})</div>
            <div v-if="Object.keys(stepNotes).length === 0" class="no-notes">
              暂无注释
            </div>
            <div
              v-for="(note, step) in stepNotes"
              :key="step"
              class="note-item"
              :class="{ current: parseInt(step) === currentStep }"
            >
              <div class="note-item-header">
                <span class="note-step">步骤 {{ parseInt(step) + 1 }}</span>
                <el-button text size="small" @click="deleteNote(step)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <div class="note-text">{{ note }}</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import {
  Clock, Download, ArrowDown, FullScreen, Search,
  Connection, Cpu, FolderOpened, RefreshRight,
  ZoomIn, ZoomOut, VideoPlay, VideoPause, Document,
  Comment, Close, Delete, DeleteFilled
} from '@element-plus/icons-vue'
import { flowList, getFlowDefinition } from '@/data/flow-definitions.js'
import { exportAsJSON } from '@/utils/export.js'

// 图标映射
const iconMap = {
  Connection,
  Cpu,
  FolderOpened
}

// 路由
const route = useRoute()

// 状态
const currentFlowId = ref(route.params.flowId || flowList[0]?.id)
const selectedNode = ref(null)
const hoveredNode = ref(null)
const flowSearchQuery = ref('')
const difficultyFilter = ref('all')
const activeFlowType = ref('control')
const showStepNotes = ref(false)

// 图表引用
const chartContainerRef = ref(null)
const svgChartRef = ref(null)
let animationTimer = null

// SVG 配置
const svgWidth = ref(800)
const svgHeight = ref(600)
const laneMargin = ref(100)
const laneHeight = ref(120)
const headerHeight = ref(40)
const nodeSpacing = ref(100)

// 动画状态
const isAnimating = ref(false)
const animationSpeed = ref(1)
const currentStep = ref(0)
const stepNotes = ref({})

// ========== 计算属性 ==========

const flowDefinition = computed(() => {
  const flow = getFlowDefinition(currentFlowId.value)
  // 如果没有找到，返回一个默认的控制流
  if (!flow) {
    return getFlowDefinition('joint-mapping')
  }
  return flow
})

const currentFlowMeta = computed(() => flowList.find(flow => flow.id === currentFlowId.value))

const filteredFlowList = computed(() => {
  const normalizedQuery = flowSearchQuery.value.trim().toLowerCase()
  return flowList.filter(flow => {
    const matchesQuery = !normalizedQuery || [flow.name, flow.description, flow.type]
      .some(field => String(field).toLowerCase().includes(normalizedQuery))
    const matchesDifficulty = difficultyFilter.value === 'all' || flow.difficulty === difficultyFilter.value
    return matchesQuery && matchesDifficulty
  })
})

const orderedNodes = computed(() => {
  if (!flowDefinition.value) return []
  if (flowDefinition.value.type === 'linear' || flowDefinition.value.type === 'control') {
    return flowDefinition.value.nodes
  }
  if (flowDefinition.value.type === 'parallel') {
    return flowDefinition.value.lanes.flatMap(lane => (
      flowDefinition.value.nodes
        .filter(node => node.lane === lane.id)
        .sort((a, b) => a.order - b.order)
        .map(node => ({ ...node, laneName: lane.name }))
    ))
  }
  if (flowDefinition.value.type === 'tree') {
    return flowDefinition.value.nodes.filter(node => !node.parent || node.parent === 'workspace')
  }
  return []
})

const maxStep = computed(() => {
  if (!flowDefinition.value) return 0
  if (flowDefinition.value.type === 'parallel') {
    return Math.max(...flowDefinition.value.nodes.map(n => n.order), 0)
  }
  return Math.max((flowDefinition.value.nodes?.length || 1) - 1, 0)
})

const currentStepNode = computed(() => {
  if (!flowDefinition.value) return null
  if (flowDefinition.value.type === 'linear' || flowDefinition.value.type === 'control') {
    return flowDefinition.value.nodes[currentStep.value]
  }
  if (flowDefinition.value.type === 'parallel') {
    const nodes = flowDefinition.value.nodes.filter(n => n.order === currentStep.value)
    return nodes[0]
  }
  return null
})

const progressPercentage = computed(() => {
  if (maxStep.value === 0) return 0
  return Math.round((currentStep.value / maxStep.value) * 100)
})

const progressColor = computed(() => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C']
  return colors[Math.floor(currentStep.value / Math.max(maxStep.value / 4, 1))]
})

const svgViewBox = computed(() => {
  return `0 0 ${svgWidth.value} ${svgHeight.value}`
})

// SVG 节点计算
const svgNodes = computed(() => {
  if (!flowDefinition.value) return []

  const type = flowDefinition.value.type
  const nodes = []

  if (type === 'linear' || type === 'control') {
    const nodeCount = flowDefinition.value.nodes.length
    const totalHeight = (nodeCount - 1) * nodeSpacing.value + 70
    const startY = 50

    svgHeight.value = Math.max(totalHeight + 50, 400)

    flowDefinition.value.nodes.forEach((node, index) => {
      nodes.push({
        ...node,
        x: svgWidth.value / 2,
        y: startY + index * nodeSpacing.value,
        stepNumber: index + 1
      })
    })
  } else if (type === 'parallel') {
    const laneCount = flowDefinition.value.lanes.length
    const maxOrder = Math.max(...flowDefinition.value.nodes.map(n => n.order), 0)

    svgWidth.value = Math.max((maxOrder + 2) * 100, 600)
    svgHeight.value = laneCount * laneHeight.value + headerHeight.value + 50

    flowDefinition.value.nodes.forEach(node => {
      const laneIndex = flowDefinition.value.lanes.findIndex(l => l.id === node.lane)
      nodes.push({
        ...node,
        x: laneMargin.value + node.order * 100 + 50,
        y: laneIndex * laneHeight.value + headerHeight.value + laneHeight.value / 2
      })
    })
  } else if (type === 'tree') {
    // 简单的树形布局
    svgWidth.value = 600
    svgHeight.value = 400

    const roots = flowDefinition.value.nodes.filter(n => !n.parent || n.parent === 'workspace')
    roots.forEach((root, index) => {
      nodes.push({
        ...root,
        x: svgWidth.value / 2,
        y: 50 + index * 80
      })
    })
  }

  return nodes
})

// SVG 边计算
const svgEdges = computed(() => {
  if (!flowDefinition.value || !flowDefinition.value.edges) return []

  const type = flowDefinition.value.type
  const edges = []

  if (type === 'linear' || type === 'control') {
    flowDefinition.value.edges.forEach((edge, index) => {
      const sourceNode = svgNodes.value.find(n => n.id === edge.from)
      const targetNode = svgNodes.value.find(n => n.id === edge.to)

      if (sourceNode && targetNode) {
        edges.push({
          ...edge,
          path: `M ${sourceNode.x} ${sourceNode.y + 35} Q ${sourceNode.x} ${(sourceNode.y + targetNode.y) / 2} ${targetNode.x} ${targetNode.y - 35}`,
          source: edge.from,
          target: edge.to
        })
      }
    })
  } else if (type === 'parallel') {
    flowDefinition.value.edges.forEach(edge => {
      const sourceNode = svgNodes.value.find(n => n.id === edge.from)
      const targetNode = svgNodes.value.find(n => n.id === edge.to)

      if (sourceNode && targetNode) {
        const sameLane = sourceNode.y === targetNode.y
        edges.push({
          ...edge,
          path: sameLane
            ? `M ${sourceNode.x + 50} ${sourceNode.y} L ${targetNode.x - 50} ${targetNode.y}`
            : `M ${sourceNode.x} ${sourceNode.y + 25} L ${targetNode.x} ${targetNode.y - 25}`,
          source: edge.from,
          target: edge.to,
          crossLane: !sameLane
        })
      }
    })
  } else if (type === 'tree') {
    flowDefinition.value.nodes.forEach(node => {
      if (node.children) {
        node.children.forEach(childId => {
          const parent = svgNodes.value.find(n => n.id === node.id)
          const child = svgNodes.value.find(n => n.id === childId)

          if (parent && child) {
            edges.push({
              source: node.id,
              target: childId,
              path: `M ${parent.x} ${parent.y + 25} L ${child.x} ${child.y - 25}`
            })
          }
        })
      }
    })
  }

  return edges
})

// ========== 方法 ==========

function getDifficultyType(difficulty) {
  const types = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger'
  }
  return types[difficulty] || 'info'
}

function getDifficultyLabel(difficulty) {
  const labels = {
    beginner: '入门',
    intermediate: '进阶',
    advanced: '高级'
  }
  return labels[difficulty] || '未知'
}

function getNodeTypeTag(type) {
  const tags = {
    input: 'success',
    output: 'success',
    process: 'primary',
    decision: 'warning',
    data: 'info',
    package: '',
    category: '',
    leaf: '',
    root: 'danger'
  }
  return tags[type] || ''
}

function getNodeColor(type) {
  const colors = {
    input: '#67C23A',
    output: '#67C23A',
    process: '#409EFF',
    decision: '#E6A23C',
    data: '#909399',
    root: '#F56C6C',
    package: '#9B59B6',
    category: '#3498DB',
    leaf: '#1ABC9C'
  }
  return colors[type] || '#909399'
}

function getNodeIcon(type) {
  const icons = {
    input: 'IN',
    output: 'OUT',
    process: 'P',
    decision: '?',
    data: 'D',
    root: 'R',
    package: 'PK',
    category: 'C',
    leaf: 'L'
  }
  return icons[type] || 'N'
}

function truncateText(text, maxLength) {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

function isNodeActive(node) {
  if (!flowDefinition.value) return false

  if (flowDefinition.value.type === 'linear' || flowDefinition.value.type === 'control') {
    return flowDefinition.value.nodes[currentStep.value]?.id === node.id
  }

  if (flowDefinition.value.type === 'parallel') {
    const activeNodes = flowDefinition.value.nodes.filter(n => n.order === currentStep.value)
    return activeNodes.some(n => n.id === node.id)
  }

  return false
}

function isEdgeActive(edge) {
  if (!flowDefinition.value) return false

  if (flowDefinition.value.type === 'linear' || flowDefinition.value.type === 'control') {
    const currentNode = flowDefinition.value.nodes[currentStep.value]
    return currentNode && (
      edge.from === currentNode.id ||
      edge.to === currentNode.id
    )
  }

  return false
}

function isLaneActive(lane) {
  if (!flowDefinition.value || flowDefinition.value.type !== 'parallel') return false
  const activeNodes = flowDefinition.value.nodes.filter(n => n.order === currentStep.value)
  return activeNodes.some(n => n.lane === lane.id)
}

function selectFlow(flowId) {
  currentFlowId.value = flowId
  selectedNode.value = null
  resetAnimation()
  nextTick(() => {
    initSvgDimensions()
  })
}

function handleNodeClick(node) {
  selectedNode.value = { ...node, stepNumber: svgNodes.value.indexOf(node) + 1 }
}

function handleFlowTypeChange(type) {
  // 根据类型筛选流程
  const typeMap = {
    control: 'joint-mapping',
    feedback: 'joint-mapping',
    training: 'rl-training',
    development: 'ros2-config'
  }
  if (typeMap[type]) {
    selectFlow(typeMap[type])
  }
}

function resetZoom() {
  if (svgChartRef.value) {
    svgChartRef.value.style.transform = 'scale(1)'
  }
}

function zoomIn() {
  if (svgChartRef.value) {
    const currentScale = parseFloat(svgChartRef.value.style.transform.replace('scale(', '').replace(')', '')) || 1
    svgChartRef.value.style.transform = `scale(${Math.min(currentScale + 0.2, 2)})`
  }
}

function zoomOut() {
  if (svgChartRef.value) {
    const currentScale = parseFloat(svgChartRef.value.style.transform.replace('scale(', '').replace(')', '')) || 1
    svgChartRef.value.style.transform = `scale(${Math.max(currentScale - 0.2, 0.5)})`
  }
}

function toggleAnimation() {
  isAnimating.value = !isAnimating.value

  if (isAnimating.value) {
    startAnimation()
  } else {
    stopAnimation()
  }
}

function startAnimation() {
  stopAnimation()

  const interval = 2000 / animationSpeed.value
  animationTimer = setInterval(() => {
    if (currentStep.value < maxStep.value) {
      currentStep.value++
    } else {
      currentStep.value = 0
    }
  }, interval)
}

function stopAnimation() {
  if (animationTimer) {
    clearInterval(animationTimer)
    animationTimer = null
  }
}

function resetAnimation() {
  stopAnimation()
  isAnimating.value = false
  currentStep.value = 0
}

function jumpToStep(step) {
  currentStep.value = step
  if (isAnimating.value) {
    stopAnimation()
    isAnimating.value = false
  }
}

function saveNodeNote() {
  // 保存注释到本地存储
  const key = `flow-note-${currentFlowId.value}-${currentStep}`
  if (stepNotes.value[currentStep.value]) {
    localStorage.setItem(key, stepNotes.value[currentStep.value])
  }
}

function deleteNote(step) {
  const key = `flow-note-${currentFlowId.value}-${step}`
  localStorage.removeItem(key)
  delete stepNotes.value[step]
}

function handleExport(command) {
  if (command === 'png' && svgChartRef.value) {
    // 使用 Canvas 导出
    const svg = svgChartRef.value
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    canvas.width = svg.width.baseVal.value * 2
    canvas.height = svg.height.baseVal.value * 2

    img.onload = () => {
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `${flowDefinition.value?.name || 'flow'}.png`
      link.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  } else if (command === 'svg' && svgChartRef.value) {
    const svg = svgChartRef.value
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${flowDefinition.value?.name || 'flow'}.svg`
    link.click()
    URL.revokeObjectURL(url)
  } else if (command === 'json') {
    const exportData = {
      ...flowDefinition.value,
      notes: stepNotes.value
    }
    exportAsJSON(exportData, `${flowDefinition.value?.id || 'flow'}.json`)
  }
}

function initSvgDimensions() {
  if (chartContainerRef.value) {
    const rect = chartContainerRef.value.getBoundingClientRect()
    svgWidth.value = Math.max(rect.width - 40, 600)
  }
}

function loadNotes() {
  // 从本地存储加载注释
  const savedNotes = {}
  Object.keys(stepNotes.value).forEach(key => {
    const storageKey = `flow-note-${currentFlowId.value}-${key}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      savedNotes[key] = saved
    }
  })
  stepNotes.value = savedNotes
}

// ========== 生命周期 ==========

onMounted(() => {
  initSvgDimensions()
  loadNotes()
  window.addEventListener('resize', initSvgDimensions)
})

onUnmounted(() => {
  stopAnimation()
  window.removeEventListener('resize', initSvgDimensions)
})

// 监听流程变化
watch(currentFlowId, () => {
  loadNotes()
})

watch(() => route.params.flowId, (flowId) => {
  if (flowId && flowId !== currentFlowId.value) {
    currentFlowId.value = flowId
  }
})

// 监听动画速度变化
watch(animationSpeed, () => {
  if (isAnimating.value) {
    stopAnimation()
    startAnimation()
  }
})
</script>

<style scoped>
.flow-viewer-page {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
}

.page-title {
  font-size: 20px;
  font-weight: 600;
}

/* 流程标签页 */
.flow-tabs {
  margin-top: 20px;
  background: white;
  border-radius: 12px;
  padding: 0 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.flow-content {
  display: grid;
  grid-template-columns: 320px 1fr 320px;
  gap: 20px;
  margin-top: 20px;
}

.flow-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.flow-filter {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.difficulty-select {
  width: 100%;
}

.flow-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
}

.flow-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.flow-item:hover {
  background: #f0f9ff;
  border-color: #b3d8ff;
  transform: translateX(4px);
}

.flow-item.active {
  background: linear-gradient(135deg, #e6f4ff 0%, #d6ecff 100%);
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.flow-info {
  flex: 1;
  min-width: 0;
}

.flow-name {
  font-weight: 600;
  margin-bottom: 4px;
  color: #303133;
}

.flow-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
}

.flow-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.flow-duration {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.flow-overview-card .overview-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.overview-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.overview-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.overview-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 12px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf0 100%);
  padding: 12px;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}

.stat-label {
  font-size: 11px;
  color: #909399;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #409EFF;
}

.overview-steps {
  background: #f9fafc;
  padding: 12px;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.steps-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.overview-steps ol {
  padding-left: 18px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.step-name {
  font-weight: 500;
}

.step-meta {
  color: #909399;
  font-size: 12px;
  margin-left: 6px;
}

/* 动画控制面板 */
.animation-control-card {
  background: linear-gradient(135deg, #fff 0%, #f9fafc 100%);
}

.animation-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-label {
  font-size: 13px;
  color: #606266;
  min-width: 60px;
}

.speed-slider {
  flex: 1;
}

.speed-value {
  font-size: 12px;
  color: #409EFF;
  min-width: 30px;
  text-align: right;
}

.step-info {
  font-size: 12px;
  color: #909399;
}

.progress-bar {
  padding: 0 4px;
}

.current-step-label {
  text-align: center;
  padding: 8px;
  background: #f0f9ff;
  border-radius: 6px;
}

/* 图表卡片 */
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.flow-select {
  width: 180px;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.chart-container {
  min-height: 550px;
  position: relative;
  overflow: hidden;
}

.flow-svg {
  width: 100%;
  height: 550px;
  transition: transform 0.3s ease;
}

/* SVG 节点样式 */
.flow-node {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.flow-node:hover {
  transform: scale(1.05);
}

.flow-node .node-card {
  fill: white;
  stroke: #e0e0e0;
  stroke-width: 2;
  transition: all 0.3s ease;
}

.flow-node .node-card.active {
  stroke: #67C23A;
  stroke-width: 3;
  filter: url(#glow);
}

.flow-node .node-card.hovered {
  stroke: #409EFF;
  stroke-width: 2;
}

.flow-node .node-card.input,
.flow-node .node-card.output {
  fill: #e8f5e9;
}

.flow-node .node-card.process {
  fill: #e3f2fd;
}

.flow-node .node-card.decision {
  fill: #fff8e1;
}

.flow-node .node-card.data {
  fill: #f5f5f5;
}

.flow-node .node-label {
  font-size: 12px;
  font-weight: 600;
  fill: #303133;
}

.flow-node .node-desc {
  font-size: 10px;
  fill: #909399;
}

.flow-node .step-number-bg {
  fill: #409EFF;
}

.flow-node .step-number {
  font-size: 10px;
  font-weight: 600;
  fill: white;
}

.active-indicator {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

/* 连接线样式 */
.connection-line {
  fill: none;
  stroke: #409EFF;
  stroke-width: 2;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.connection-line:hover {
  stroke-width: 3;
  opacity: 1;
}

.connection-line.active {
  stroke: #67C23A;
  stroke-width: 3;
  opacity: 1;
}

.connection-line.crossLane {
  stroke-dasharray: 5, 5;
}

/* 泳道样式 */
.lane-bg {
  fill: #f9fafc;
  stroke: #e0e0e0;
  stroke-width: 1;
  transition: all 0.3s ease;
}

.lane-bg.active {
  fill: #e6f4ff;
}

.lane-label {
  font-size: 13px;
  font-weight: 600;
  fill: #606266;
}

/* 图例 */
.flow-legend {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
}

.legend-title {
  font-size: 13px;
  color: #909399;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: #606266;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  display: inline-block;
}

.legend-dot.input {
  background: #67C23A;
}

.legend-dot.process {
  background: #409EFF;
}

.legend-dot.decision {
  background: #E6A23C;
}

.legend-dot.data {
  background: #909399;
}

/* 节点详情卡片 */
.node-detail-card {
  height: fit-content;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.node-detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.node-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.node-description {
  padding: 12px;
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
  border-radius: 8px;
}

.detail-label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-value {
  color: #303133;
  line-height: 1.6;
}

.node-files {
  padding: 12px;
  background: #f9fafc;
  border-radius: 8px;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file-path {
  font-size: 12px;
}

.file-functions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding-left: 12px;
}

.function-tag {
  font-size: 10px;
}

.node-data {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.data-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 4px 0;
  border-bottom: 1px dashed #e0e0e0;
}

.data-item:last-child {
  border-bottom: none;
}

.data-key {
  color: #606266;
}

.data-value {
  color: #409EFF;
  font-weight: 500;
  font-family: 'Monaco', 'Menlo', monospace;
}

.node-note {
  padding: 12px;
  background: #fffbe6;
  border-radius: 8px;
}

.note-content {
  margin-top: 8px;
}

/* 步骤注释面板 */
.step-notes-card {
  height: fit-content;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}

.step-notes-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.current-note {
  padding: 12px;
  background: linear-gradient(135deg, #e6f4ff 0%, #d6ecff 100%);
  border-radius: 8px;
}

.note-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.note-label {
  font-weight: 500;
  color: #303133;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notes-header {
  font-weight: 600;
  color: #606266;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.no-notes {
  color: #909399;
  text-align: center;
  padding: 20px;
}

.note-item {
  padding: 10px;
  background: #f9fafc;
  border-radius: 6px;
  border-left: 3px solid #e0e0e0;
}

.note-item.current {
  border-left-color: #409EFF;
  background: #f0f9ff;
}

.note-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.note-step {
  font-size: 12px;
  font-weight: 600;
  color: #409EFF;
}

.note-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

/* 响应式布局 */
@media (max-width: 1400px) {
  .flow-content {
    grid-template-columns: 280px 1fr 280px;
  }
}

@media (max-width: 1100px) {
  .flow-content {
    grid-template-columns: 1fr;
  }

  .flow-sidebar {
    order: 1;
  }

  .flow-chart-card {
    order: 2;
  }

  .node-detail-card,
  .step-notes-card {
    order: 3;
  }
}
</style>
