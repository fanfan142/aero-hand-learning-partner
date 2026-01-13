<template>
  <div class="flow-viewer-page">
    <el-page-header @back="$router.back()" title="返回">
      <template #content>
        <span class="page-title">{{ flowDefinition?.name || '技术流程' }}</span>
      </template>
    </el-page-header>

    <div class="flow-content">
      <!-- 流程类型选择 -->
      <el-card shadow="hover" class="flow-selector-card">
        <template #header>
          <span>选择流程</span>
        </template>

        <div class="flow-list">
          <div
            v-for="flow in flowList"
            :key="flow.id"
            class="flow-item"
            :class="{ active: currentFlowId === flow.id }"
            @click="selectFlow(flow.id)"
          >
            <el-icon :size="24" :color="flow.color">
              <component :is="flow.icon" />
            </el-icon>
            <div class="flow-info">
              <div class="flow-name">{{ flow.name }}</div>
              <div class="flow-desc">{{ flow.description }}</div>
              <div class="flow-meta">
                <el-tag size="small" :type="getDifficultyType(flow.difficulty)">
                  {{ flow.difficulty }}
                </el-tag>
                <span class="flow-duration">
                  <el-icon><Clock /></el-icon>
                  {{ flow.duration }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </el-card>

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
  Clock, Download, ArrowDown, FullScreen,
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

// 图表引用
const linearChartRef = ref(null)
const parallelChartRef = ref(null)
const treeChartRef = ref(null)
let chartInstance = null

// ========== 计算属性 ==========

const flowDefinition = computed(() => getFlowDefinition(currentFlowId.value))

// ========== 方法 ==========

function getDifficultyType(difficulty) {
  const types = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger'
  }
  return types[difficulty] || 'info'
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
    const y = 90 - index * 11
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
    series: flowDefinition.value.lanes.map((lane, laneIndex) => {
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
}
</style>
