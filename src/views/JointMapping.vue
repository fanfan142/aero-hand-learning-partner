<template>
  <div class="joint-mapping-page">
    <el-page-header @back="$router.back()" title="返回">
      <template #content>
        <span class="page-title">关节映射可视化</span>
      </template>
    </el-page-header>

    <div class="mapping-container">
      <!-- 左栏：控制区 -->
      <div class="control-panel">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>关节选择</span>
              <el-button text type="primary" @click="selectAll">全选</el-button>
              <el-button text @click="clearAll">清空</el-button>
            </div>
          </template>

          <div class="joint-selector">
            <el-checkbox-group v-model="selectedJoints">
              <div v-for="joint in jointDefinitions" :key="joint.id" class="joint-checkbox">
                <el-checkbox :value="joint.id" border>
                  <div class="joint-item">
                    <span class="joint-icon" :style="{ background: joint.color }"></span>
                    <span>{{ joint.name }}</span>
                    <span class="joint-name-en">({{ joint.nameEn }})</span>
                  </div>
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </div>
        </el-card>

        <el-card shadow="hover" class="position-control-card">
          <template #header>
            <span>位置控制</span>
          </template>

          <div class="position-control">
            <el-slider
              v-model="positionPercent"
              :min="0"
              :max="100"
              :step="1"
              show-input
              :format-tooltip="formatTooltip"
              @change="onPositionChange"
            />
          </div>

          <div class="preset-actions">
            <div class="preset-title">预设动作</div>
            <div class="preset-buttons">
              <el-button
                v-for="(preset, key) in presetActions"
                :key="key"
                :icon="preset.icon"
                @click="applyPreset(key)"
              >
                {{ preset.name }}
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 中栏：实时数据流 -->
      <div class="data-flow-panel">
        <el-card shadow="hover">
          <template #header>
            <span>实时数据流</span>
          </template>

          <div class="data-flow-content">
            <!-- 输入层 -->
            <div class="data-layer input-layer">
              <div class="layer-title">输入层</div>
              <div class="layer-content">
                <div class="data-item">
                  <span class="data-label">位置百分比:</span>
                  <span class="data-value">{{ (positionPercent / 100).toFixed(2) }}</span>
                </div>
                <el-progress
                  :percentage="positionPercent"
                  :color="getProgressColor(positionPercent)"
                  :stroke-width="20"
                />
              </div>
            </div>

            <!-- 映射层 -->
            <div class="data-layer mapping-layer">
              <div class="layer-title">映射层</div>
              <div class="layer-content">
                <div v-for="jointId in selectedJoints" :key="jointId" class="joint-data">
                  <div class="joint-name">{{ getJointName(jointId) }}</div>
                  <div class="data-rows">
                    <div class="data-row">
                      <span class="data-label">关节角度:</span>
                      <span class="data-value">{{ getJointData(jointId).jointAngle?.toFixed(1) }}°</span>
                    </div>
                    <div class="data-row">
                      <span class="data-label">舵机角度:</span>
                      <span class="data-value">{{ getJointData(jointId).servoAngle?.toFixed(1) }}°</span>
                    </div>
                    <div class="data-row">
                      <span class="data-label">脉冲数量:</span>
                      <span class="data-value">{{ getJointData(jointId).pulse }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 配置层 -->
            <div class="data-layer config-layer">
              <div class="layer-title">配置层</div>
              <div class="layer-content">
                <div v-for="jointId in selectedJoints.slice(0, 2)" :key="`config-${jointId}`" class="config-data">
                  <div class="config-title">{{ getJointName(jointId) }} 配置</div>
                  <div class="data-row">
                    <span class="data-label">extend_count:</span>
                    <span class="data-value">{{ getJointConfig(jointId).extendCount }}</span>
                  </div>
                  <div class="data-row">
                    <span class="data-label">grasp_count:</span>
                    <span class="data-value">{{ getJointConfig(jointId).graspCount }}</span>
                  </div>
                  <div class="data-row">
                    <span class="data-label">当前脉冲:</span>
                    <span class="data-value">{{ getJointData(jointId).pulse }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右栏：可视化区 -->
      <div class="visualization-panel">
        <el-card shadow="hover">
          <template #header>
            <span>数据可视化</span>
          </template>

          <div class="visualization-content">
            <!-- 多关节对比图 -->
            <div class="chart-section">
              <div class="chart-title">多关节对比</div>
              <div ref="comparisonChartRef" class="chart"></div>
            </div>

            <!-- 历史曲线 -->
            <div class="chart-section">
              <div class="chart-title">历史调整记录</div>
              <div ref="historyChartRef" class="chart"></div>
            </div>
          </div>
        </el-card>

        <!-- 配置导出 -->
        <el-card shadow="hover" class="export-card">
          <template #header>
            <span>配置管理</span>
          </template>

          <div class="export-buttons">
            <el-button type="primary" :icon="Download" @click="exportConfig">
              导出配置
            </el-button>
            <el-button :icon="Upload" @click="importConfig">
              导入配置
            </el-button>
            <el-button :icon="Refresh" @click="resetConfig">
              重置默认
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { Download, Upload, Refresh } from '@element-plus/icons-vue'
import { jointDefinitions, presetActions } from '@/data/joint-mappings.js'
import { useMultiJointMapping } from '@/composables/useJointMapping.js'
import { useConfigStore } from '@/stores/config.js'
import { exportAsJSON, importFromJSON } from '@/utils/export.js'

// Store
const configStore = useConfigStore()

// 状态
const selectedJoints = ref([0, 1, 2, 3, 4, 5, 6]) // 默认选择四指
const positionPercent = ref(0)

// 多关节映射
const { jointStates, setMultiplePositions, applyPreset: applyPresetToJoints, getStatesArray } =
  useMultiJointMapping(selectedJoints.value)

// 图表引用
const comparisonChartRef = ref(null)
const historyChartRef = ref(null)
let comparisonChart = null
let historyChart = null

// 历史记录
const positionHistory = ref([])

// ========== 计算属性 ==========

function getJointName(jointId) {
  const joint = jointDefinitions.find(j => j.id === jointId)
  return joint ? joint.name : `关节 ${jointId}`
}

function getJointData(jointId) {
  return jointStates.value[jointId]?.getStateSummary() || {}
}

function getJointConfig(jointId) {
  return configStore.getJointConfig(jointId) || {}
}

// ========== 方法 ==========

function formatTooltip(value) {
  return `${value}%`
}

function getProgressColor(percent) {
  if (percent < 30) return '#67C23A'
  if (percent < 70) return '#E6A23C'
  return '#F56C6C'
}

function selectAll() {
  selectedJoints.value = jointDefinitions.map(j => j.id)
}

function clearAll() {
  selectedJoints.value = []
}

function onPositionChange(value) {
  updateJointsPosition(value / 100)

  // 记录历史
  positionHistory.value.push({
    time: new Date().toLocaleTimeString(),
    percent: value,
    joints: getStatesArray()
  })

  // 限制历史记录数量
  if (positionHistory.value.length > 20) {
    positionHistory.value.shift()
  }

  updateCharts()
}

function updateJointsPosition(percent) {
  selectedJoints.value.forEach(jointId => {
    if (jointStates.value[jointId]) {
      jointStates.value[jointId].setPosition(percent)
    }
  })
}

function applyPreset(presetKey) {
  const preset = presetActions[presetKey]
  if (preset) {
    preset.positions.forEach((pos, index) => {
      if (jointStates.value[index]) {
        jointStates.value[index].setPosition(pos)
      }
    })

    // 更新滑块（以第一个关节为准）
    if (selectedJoints.value.length > 0) {
      const firstJointId = selectedJoints.value[0]
      const state = jointStates.value[firstJointId]?.getStateSummary()
      if (state) {
        positionPercent.value = Math.round(state.position * 100)
      }
    }

    updateCharts()
  }
}

// ========== 图表 ==========

function initComparisonChart() {
  if (!comparisonChartRef.value) return

  comparisonChart = echarts.init(comparisonChartRef.value)
  updateComparisonChart()
}

function updateComparisonChart() {
  if (!comparisonChart) return

  const data = selectedJoints.value.map(jointId => {
    const state = jointStates.value[jointId]?.getStateSummary()
    const joint = jointDefinitions.find(j => j.id === jointId)
    return {
      name: joint ? joint.name : `关节${jointId}`,
      value: state ? state.position * 100 : 0,
      itemStyle: { color: joint ? joint.color : '#999' }
    }
  })

  comparisonChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name)
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%' }
    },
    series: [{
      type: 'bar',
      data: data.map(d => ({
        value: d.value,
        itemStyle: d.itemStyle
      })),
      barWidth: '60%'
    }]
  })
}

function initHistoryChart() {
  if (!historyChartRef.value) return

  historyChart = echarts.init(historyChartRef.value)
  updateHistoryChart()
}

function updateHistoryChart() {
  if (!historyChart) return

  const times = positionHistory.value.map(h => h.time)
  const series = selectedJoints.value.map(jointId => {
    const joint = jointDefinitions.find(j => j.id === jointId)
    return {
      name: joint ? joint.name : `关节${jointId}`,
      type: 'line',
      data: positionHistory.value.map(h => {
        const jointData = h.joints.find(j => j.jointId === jointId)
        return jointData ? Math.round(jointData.position * 100) : 0
      }),
      smooth: true
    }
  })

  historyChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: series.map(s => s.name)
    },
    xAxis: {
      type: 'category',
      data: times
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%' }
    },
    series
  })
}

function updateCharts() {
  updateComparisonChart()
  updateHistoryChart()
}

function exportConfig() {
  const config = configStore.exportConfig()
  exportAsJSON(config, `aero-hand-config-${Date.now()}.json`)
}

async function importConfig() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const data = await importFromJSON(file)
        configStore.importConfig(data)
        // 刷新显示
        updateJointsPosition(positionPercent.value / 100)
        updateCharts()
      } catch (error) {
        console.error('导入配置失败:', error)
      }
    }
  }
  input.click()
}

function resetConfig() {
  configStore.resetAllConfig()
  updateJointsPosition(positionPercent.value / 100)
  updateCharts()
}

// ========== 生命周期 ==========

onMounted(() => {
  nextTick(() => {
    initComparisonChart()
    initHistoryChart()
  })

  window.addEventListener('resize', () => {
    comparisonChart?.resize()
    historyChart?.resize()
  })
})

onUnmounted(() => {
  comparisonChart?.dispose()
  historyChart?.dispose()
})

// 监听选中关节变化
watch(selectedJoints, () => {
  updateCharts()
}, { deep: true })
</script>

<style scoped>
.joint-mapping-page {
  padding: 20px;
  min-height: 100vh;
  background: #f5f7fa;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
}

.mapping-container {
  display: grid;
  grid-template-columns: 220px 1fr 280px;
  gap: 20px;
  margin-top: 20px;
}

.control-panel,
.data-flow-panel,
.visualization-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.joint-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.joint-checkbox {
  margin-bottom: 8px;
}

.joint-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.joint-icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.joint-name-en {
  color: #999;
  font-size: 12px;
}

.position-control-card {
  margin-top: auto;
}

.position-control {
  margin-bottom: 30px;
}

.preset-actions {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.preset-title {
  font-weight: 600;
  margin-bottom: 15px;
  color: #606266;
}

.preset-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.data-flow-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.data-layer {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  background: #fafafa;
}

.layer-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: #409EFF;
}

.layer-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-label {
  color: #606266;
  font-size: 14px;
}

.data-value {
  color: #409EFF;
  font-weight: 600;
  font-size: 16px;
}

.joint-data {
  padding: 10px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
}

.joint-name {
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.data-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.data-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.config-data {
  padding: 10px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
}

.config-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #E6A23C;
}

.visualization-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.chart-section {
  min-height: 180px;
}

.chart-title {
  font-weight: 600;
  margin-bottom: 15px;
  color: #606266;
}

.chart {
  width: 100%;
  height: 200px;
}

.export-card {
  margin-top: auto;
}

.export-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.export-buttons .el-button {
  width: 100%;
}

@media (max-width: 1400px) {
  .mapping-container {
    grid-template-columns: 1fr 1fr;
  }

  .visualization-panel {
    grid-column: 1 / -1;
  }
}

@media (max-width: 900px) {
  .mapping-container {
    grid-template-columns: 1fr;
  }
}
</style>