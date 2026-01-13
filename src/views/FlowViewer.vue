<template>
  <div class="flow-viewer-page">
    <el-page-header @back="$router.back()" title="返回">
      <template #content>
        <span class="page-title">{{ flowDefinition?.name || '技术流程' }}</span>
      </template>
    </el-page-header>

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
      </div>

      <!-- 流程图展示 -->
      <el-card shadow="hover" class="flow-chart-card">
        <template #header>
          <div class="chart-header">
            <span>{{ flowDefinition?.name }}</span>
            <div class="header-actions">
              <el-button text @click="resetZoom">
                <el-icon><FullScreen /></el-icon>
                重置视图
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
                    <el-dropdown-item command="json">导出为 JSON</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </template>

        <div class="chart-container">
          <!-- 线性流程图 -->
          <div
            v-if="flowDefinition?.type === 'linear'"
            ref="linearChartRef"
            class="flow-chart"
          ></div>

          <!-- 并行泳道图 -->
          <div
            v-else-if="flowDefinition?.type === 'parallel'"
            ref="parallelChartRef"
            class="flow-chart"
          ></div>

          <!-- 树形图 -->
          <div
            v-else-if="flowDefinition?.type === 'tree'"
            ref="treeChartRef"
            class="flow-chart"
          ></div>

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
          <span>节点详情</span>
        </template>

        <div class="node-detail-content">
          <div class="node-title">
            <el-tag :type="getNodeTypeTag(selectedNode.category || selectedNode.type)">
              {{ selectedNode.name }}
            </el-tag>
          </div>

          <div v-if="selectedNode.description" class="node-description">
            <div class="detail-label">描述</div>
            <div class="detail-value">{{ selectedNode.description }}</div>
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
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import {
  Clock, Download, ArrowDown, FullScreen, Search,
  Connection, Cpu, FolderOpened
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
const flowSearchQuery = ref('')
const difficultyFilter = ref('all')

// 图表引用
const linearChartRef = ref(null)
const parallelChartRef = ref(null)
const treeChartRef = ref(null)
let chartInstance = null

// ========== 计算属性 ==========

const flowDefinition = computed(() => getFlowDefinition(currentFlowId.value))
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
  if (flowDefinition.value.type === 'linear') {
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

function selectFlow(flowId) {
  currentFlowId.value = flowId
  selectedNode.value = null
  initChart()
}

function resetZoom() {
  if (chartInstance) {
    chartInstance.dispatchAction({
      type: 'restore'
    })
  }
}

function handleExport(command) {
  if (command === 'png' && chartInstance) {
    const url = chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff'
    })
    const link = document.createElement('a')
    link.href = url
    link.download = `${flowDefinition.value?.name || 'flow'}.png`
    link.click()
  } else if (command === 'json') {
    exportAsJSON(flowDefinition.value, `${flowDefinition.value?.id || 'flow'}.json`)
  }
}

// ========== 图表初始化 ==========

function initChart() {
  nextTick(() => {
    disposeChart()

    if (!flowDefinition.value) return

    if (flowDefinition.value.type === 'linear') {
      initLinearChart()
    } else if (flowDefinition.value.type === 'parallel') {
      initParallelChart()
    } else if (flowDefinition.value.type === 'tree') {
      initTreeChart()
    }
  })
}

function disposeChart() {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
}

function initLinearChart() {
  if (!linearChartRef.value) return

  chartInstance = echarts.init(linearChartRef.value)

  const nodes = flowDefinition.value.nodes.map((node, index) => {
    const spacing = 80 / (flowDefinition.value.nodes.length || 1)
    const y = 90 - index * spacing
    return {
      id: node.id,
      name: node.label,
      value: node.description || '',
      x: 50,
      y: y,
      category: node.type,
      data: node.data || {},
      itemStyle: {
        color: getNodeColor(node.type)
      }
    }
  })

  const edges = flowDefinition.value.edges.map(edge => ({
    source: edge.from,
    target: edge.to,
    name: edge.label || '',
    lineStyle: { curveness: 0.2 }
  }))

  chartInstance.setOption({
    tooltip: {
      formatter: (params) => {
        if (params.dataType === 'node') {
          let tooltip = `<strong>${params.name}</strong><br/>${params.value}`
          if (params.data.data) {
            Object.entries(params.data.data).forEach(([key, value]) => {
              tooltip += `<br/>${key}: ${value}`
            })
          }
          return tooltip
        }
        return params.name
      }
    },
    series: [{
      type: 'graph',
      layout: 'none',
      symbolSize: 70,
      roam: true,
      label: {
        show: true,
        position: 'bottom',
        fontSize: 12
      },
      edgeSymbol: ['circle', 'arrow'],
      edgeSymbolSize: [4, 12],
      data: nodes,
      links: edges,
      lineStyle: {
        width: 2,
        opacity: 0.8
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: { width: 4 }
      }
    }]
  })

  chartInstance.on('click', (params) => {
    if (params.dataType === 'node') {
      selectedNode.value = params.data
    }
  })
}

function initParallelChart() {
  if (!parallelChartRef.value) return

  chartInstance = echarts.init(parallelChartRef.value)

  const nodesByLane = {}
  flowDefinition.value.lanes.forEach(lane => {
    nodesByLane[lane.id] = flowDefinition.value.nodes
      .filter(n => n.lane === lane.id)
      .sort((a, b) => a.order - b.order)
  })

  const maxOrder = Math.max(...flowDefinition.value.nodes.map(n => n.order))
  const nodeLookup = new Map()
  flowDefinition.value.lanes.forEach((lane, laneIndex) => {
    nodesByLane[lane.id].forEach(node => {
      nodeLookup.set(node.id, { x: node.order, y: laneIndex })
    })
  })
  const lineData = flowDefinition.value.edges.map(edge => {
    const source = nodeLookup.get(edge.from)
    const target = nodeLookup.get(edge.to)
    if (!source || !target) return null
    return {
      coords: [[source.x, source.y], [target.x, target.y]],
      lineStyle: {
        color: edge.crossLane ? '#909399' : '#409EFF',
        type: edge.crossLane ? 'dashed' : 'solid'
      }
    }
  }).filter(Boolean)

  chartInstance.setOption({
    grid: {
      left: '10%',
      right: '10%',
      top: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: maxOrder + 1 }, (_, i) => `步骤 ${i}`),
      axisLabel: { rotate: 30 }
    },
    yAxis: {
      type: 'category',
      data: flowDefinition.value.lanes.map(l => l.name)
    },
    series: [
      {
        type: 'lines',
        coordinateSystem: 'cartesian2d',
        data: lineData,
        symbol: ['none', 'arrow'],
        symbolSize: 8,
        lineStyle: {
          width: 2,
          opacity: 0.7
        }
      },
      ...flowDefinition.value.lanes.map((lane, laneIndex) => {
        const laneNodes = nodesByLane[lane.id]
        return {
          type: 'scatter',
          name: lane.name,
          data: laneNodes.map(node => [node.order, laneIndex]),
          symbolSize: 100,
          label: {
            show: true,
            formatter: ({ data }) => {
              const node = laneNodes.find(n => n.order === data[0])
              return node ? node.label : ''
            },
            fontSize: 11
          },
          itemStyle: { color: lane.color }
        }
      })
    ]
  })

  chartInstance.on('click', (params) => {
    const laneId = flowDefinition.value.lanes[params.data[1]].id
    const node = flowDefinition.value.nodes.find(
      n => n.lane === laneId && n.order === params.data[0]
    )
    if (node) {
      selectedNode.value = node
    }
  })
}

function initTreeChart() {
  if (!treeChartRef.value) return

  chartInstance = echarts.init(treeChartRef.value)

  function buildTree() {
    const nodeMap = new Map()
    flowDefinition.value.nodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] })
    })

    const roots = []
    nodeMap.forEach(node => {
      if (node.parent && nodeMap.has(node.parent)) {
        nodeMap.get(node.parent).children.push(node)
      } else {
        roots.push(node)
      }
    })

    return roots.length > 0 ? roots[0] : null
  }

  const treeData = buildTree()

  chartInstance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}'
    },
    series: [{
      type: 'tree',
      data: treeData ? [treeData] : [],
      top: '5%',
      left: '10%',
      bottom: '5%',
      right: '20%',
      symbolSize: 14,
      expandAndCollapse: true,
      initialTreeDepth: 2,
      label: {
        position: 'left',
        verticalAlign: 'middle',
        align: 'right',
        fontSize: 12
      },
      leaves: {
        label: {
          position: 'right',
          verticalAlign: 'middle',
          align: 'left'
        }
      }
    }]
  })

  chartInstance.on('click', (params) => {
    selectedNode.value = params.data
  })
}

function getNodeColor(type) {
  const colors = {
    input: '#67C23A',
    output: '#67C23A',
    process: '#409EFF',
    decision: '#E6A23C',
    data: '#909399'
  }
  return colors[type] || '#909399'
}

function handleResize() {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// ========== 生命周期 ==========

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  disposeChart()
  window.removeEventListener('resize', handleResize)
})

// 监听流程变化
watch(currentFlowId, () => {
  initChart()
})

watch(() => route.params.flowId, (flowId) => {
  if (flowId && flowId !== currentFlowId.value) {
    currentFlowId.value = flowId
  }
})
</script>

<style scoped>
.flow-viewer-page {
  padding: 20px;
  min-height: 100vh;
  background: #f5f7fa;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
}

.flow-content {
  display: grid;
  grid-template-columns: 350px 1fr 300px;
  gap: 20px;
  margin-top: 20px;
}

.flow-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  gap: 12px;
}

.flow-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.flow-item:hover {
  background: #f0f9ff;
  border-color: #b3d8ff;
}

.flow-item.active {
  background: #e6f4ff;
  border-color: #409EFF;
}

.flow-info {
  flex: 1;
}

.flow-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.flow-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.flow-meta {
  display: flex;
  align-items: center;
  gap: 10px;
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
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 12px;
  background: #f5f7fa;
  padding: 12px;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #409EFF;
}

.overview-steps {
  background: #f9fafc;
  padding: 12px;
  border-radius: 8px;
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

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.chart-container {
  min-height: 600px;
}

.flow-chart {
  width: 100%;
  height: 600px;
}

.flow-legend {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-title {
  font-size: 13px;
  color: #909399;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #606266;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
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

.node-detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.node-title {
  font-size: 18px;
}

.node-description,
.node-data {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.detail-label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #606266;
}

.detail-value {
  color: #303133;
  line-height: 1.6;
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
}

.data-key {
  color: #606266;
}

.data-value {
  color: #409EFF;
  font-weight: 500;
}

@media (max-width: 1400px) {
  .flow-content {
    grid-template-columns: 300px 1fr;
  }

  .node-detail-card {
    grid-column: 1 / -1;
  }
}

@media (max-width: 900px) {
  .flow-content {
    grid-template-columns: 1fr;
  }

  .flow-sidebar {
    order: 1;
  }

  .flow-chart-card {
    order: 2;
  }

  .node-detail-card {
    order: 3;
  }
}
</style>
