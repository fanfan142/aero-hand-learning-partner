<template>
  <div class="advanced-charts">
    <!-- 雷达图：技能掌握程度 -->
    <el-card shadow="hover" class="chart-card">
      <template #header>
        <div class="chart-header">
          <span>技能掌握程度</span>
          <el-button link type="primary" @click="exportChart('radarChart')">
            <el-icon><Download /></el-icon> 导出
          </el-button>
        </div>
      </template>
      <div ref="radarChartRef" class="chart-container"></div>
    </el-card>

    <!-- 柱状图：各阶段任务完成对比 -->
    <el-card shadow="hover" class="chart-card">
      <template #header>
        <div class="chart-header">
          <span>各阶段任务完成对比</span>
          <el-button link type="primary" @click="exportChart('barChart')">
            <el-icon><Download /></el-icon> 导出
          </el-button>
        </div>
      </template>
      <div ref="barChartRef" class="chart-container"></div>
    </el-card>

    <!-- 折线图：学习进度时间趋势 -->
    <el-card shadow="hover" class="chart-card">
      <template #header>
        <div class="chart-header">
          <span>学习进度时间趋势</span>
          <el-button link type="primary" @click="exportChart('lineChart')">
            <el-icon><Download /></el-icon> 导出
          </el-button>
        </div>
      </template>
      <div ref="lineChartRef" class="chart-container"></div>
    </el-card>

    <!-- 散点图：学习效率分析 -->
    <el-card shadow="hover" class="chart-card">
      <template #header>
        <div class="chart-header">
          <span>学习效率分析</span>
          <el-button link type="primary" @click="exportChart('scatterChart')">
            <el-icon><Download /></el-icon> 导出
          </el-button>
        </div>
      </template>
      <div ref="scatterChartRef" class="chart-container"></div>
    </el-card>

    <!-- 饼图：任务难度分布 -->
    <el-card shadow="hover" class="chart-card">
      <template #header>
        <div class="chart-header">
          <span>任务难度分布</span>
          <el-button link type="primary" @click="exportChart('pieChart')">
            <el-icon><Download /></el-icon> 导出
          </el-button>
        </div>
      </template>
      <div ref="pieChartRef" class="chart-container"></div>
    </el-card>

    <!-- 环形图：各阶段进度 -->
    <el-card shadow="hover" class="chart-card">
      <template #header>
        <div class="chart-header">
          <span>各阶段学习进度</span>
          <el-button link type="primary" @click="exportChart('progressChart')">
            <el-icon><Download /></el-icon> 导出
          </el-button>
        </div>
      </template>
      <div ref="progressChartRef" class="chart-container"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { Download } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  stageStats: {
    type: Array,
    default: () => []
  },
  completedTasksCount: {
    type: Number,
    default: 0
  }
})

// Refs for chart containers
const radarChartRef = ref(null)
const barChartRef = ref(null)
const lineChartRef = ref(null)
const scatterChartRef = ref(null)
const pieChartRef = ref(null)
const progressChartRef = ref(null)

// Chart instances
let radarChart = null
let barChart = null
let lineChart = null
let scatterChart = null
let pieChart = null
let progressChart = null

// Stage colors
const stageColors = {
  hardware: '#409eff',
  firmware: '#67c23a',
  'servo-config': '#e6a23c',
  'sdk-usage': '#909399',
  mujoco: '#f56c6c',
  ros2: '#9c27b0',
  'rl-training': '#00bcd4',
  sim2real: '#ff5722'
}

// 技能分类数据
const skillCategories = [
  { name: '硬件', skills: ['3D打印', '机械装配', '电子焊接'] },
  { name: '固件', skills: ['Arduino', 'ESP32', '串口通信'] },
  { name: 'SDK', skills: ['Python API', '异步编程', 'GUI使用'] },
  { name: '仿真', skills: ['MuJoCo', 'MJCF', 'JAX'] },
  { name: 'ROS2', skills: ['节点通信', '话题订阅', '服务调用'] },
  { name: 'RL', skills: ['PPO算法', '奖励设计', '策略优化'] },
  { name: 'Sim2Real', skills: ['域随机化', '策略部署', '系统调试'] }
]

// Initialize Radar Chart - 技能掌握程度
function initRadarChart() {
  if (!radarChartRef.value) return

  radarChart = echarts.init(radarChartRef.value)

  // 基于 stageStats 生成技能掌握数据
  const stageSkillMap = {
    hardware: [85, 70, 60],
    firmware: [40, 30, 20],
    'servo-config': [20, 15, 10],
    'sdk-usage': [10, 5, 5],
    mujoco: [5, 5, 5],
    ros2: [0, 0, 0],
    'rl-training': [0, 0, 0],
    sim2real: [0, 0, 0]
  }

  const radarOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ccc',
      borderWidth: 1,
      textStyle: { color: '#333' },
      formatter: (params) => {
        return `${params.name}<br/>完成度: ${params.value}%`
      }
    },
    legend: {
      data: ['当前掌握', '目标掌握'],
      bottom: 0
    },
    radar: {
      indicator: [
        { name: '硬件', max: 100 },
        { name: '固件', max: 100 },
        { name: 'SDK', max: 100 },
        { name: '仿真', max: 100 },
        { name: 'ROS2', max: 100 },
        { name: 'RL', max: 100 },
        { name: 'Sim2Real', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: '#666'
      },
      splitLine: {
        lineStyle: { color: '#e0e0e0' }
      },
      splitArea: {
        show: true,
        areaStyle: { color: ['#f8f8f8', '#fff'] }
      }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [85, 40, 20, 10, 0, 0, 0],
          name: '当前掌握',
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#409eff', width: 2 },
          areaStyle: { color: 'rgba(64, 158, 255, 0.3)' },
          itemStyle: { color: '#409eff' }
        },
        {
          value: [100, 100, 100, 100, 100, 100, 100],
          name: '目标掌握',
          symbol: 'circle',
          symbolSize: 4,
          lineStyle: { color: '#67c23a', width: 2, type: 'dashed' },
          areaStyle: { color: 'rgba(103, 194, 58, 0.1)' },
          itemStyle: { color: '#67c23a' }
        }
      ],
      animationDuration: 1500,
      animationEasing: 'cubicOut'
    }]
  }

  radarChart.setOption(radarOption)
}

// Initialize Bar Chart - 各阶段任务完成对比
function initBarChart() {
  if (!barChartRef.value) return

  barChart = echarts.init(barChartRef.value)

  // 使用传入的 stageStats 或默认数据
  const stageTitles = ['硬件准备', '固件烧录', '舵机配置', 'SDK使用', 'MuJoCo仿真', 'ROS2集成', 'RL训练', 'Sim2Real']
  const completedData = props.stageStats.length > 0
    ? props.stageStats.map(s => s.completedCount)
    : [2, 0, 0, 0, 0, 0, 0, 0]
  const totalData = props.stageStats.length > 0
    ? props.stageStats.map(s => s.totalCount)
    : [4, 5, 5, 4, 6, 4, 8, 7]

  const barOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ccc',
      textStyle: { color: '#333' },
      formatter: (params) => {
        const stage = params[0].name
        const completed = params[0].value
        const total = params[1].value
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0
        return `${stage}<br/>已完成: ${completed}/${total} (${percent}%)`
      }
    },
    legend: {
      data: ['已完成', '总计'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: stageTitles,
      axisLabel: {
        interval: 0,
        rotate: 30,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      name: '任务数',
      minInterval: 1
    },
    series: [
      {
        name: '已完成',
        type: 'bar',
        data: completedData,
        itemStyle: {
          color: (params) => stageColors[Object.keys(stageColors)[params.dataIndex]] || '#409eff',
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '35%',
        animationDuration: 1200,
        animationEasing: 'elasticOut'
      },
      {
        name: '总计',
        type: 'bar',
        data: totalData,
        itemStyle: {
          color: 'rgba(200, 200, 200, 0.5)',
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '35%',
        animationDuration: 1200,
        animationDelay: (params) => params.dataIndex * 100,
        animationEasing: 'elasticOut'
      }
    ]
  }

  barChart.setOption(barOption)
}

// Initialize Line Chart - 学习进度时间趋势
function initLineChart() {
  if (!lineChartRef.value) return

  lineChart = echarts.init(lineChartRef.value)

  // 模拟周学习数据
  const weeks = ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周']
  const hoursData = [2.5, 3.0, 1.5, 4.0, 3.5, 2.0, 4.5]
  const tasksData = [1, 2, 1, 3, 2, 1, 4]

  const lineOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ccc',
      textStyle: { color: '#333' },
      formatter: (params) => {
        const week = params[0].name
        let html = week + '<br/>'
        params.forEach(p => {
          const unit = p.seriesName === '学习时长' ? '小时' : '个'
          html += `${p.marker} ${p.seriesName}: ${p.value}${unit}<br/>`
        })
        return html
      }
    },
    legend: {
      data: ['学习时长(小时)', '完成任务数'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: weeks,
      axisLabel: { fontSize: 11 }
    },
    yAxis: [
      {
        type: 'value',
        name: '时长(小时)',
        min: 0
      },
      {
        type: 'value',
        name: '任务数',
        min: 0,
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '学习时长(小时)',
        type: 'line',
        data: hoursData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: '#409eff' },
        itemStyle: { color: '#409eff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.4)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        },
        animationDuration: 2000,
        animationEasing: 'cubicOut'
      },
      {
        name: '完成任务数',
        type: 'line',
        yAxisIndex: 1,
        data: tasksData,
        smooth: true,
        symbol: 'diamond',
        symbolSize: 8,
        lineStyle: { width: 3, color: '#67c23a' },
        itemStyle: { color: '#67c23a' },
        animationDuration: 2000,
        animationDelay: 500,
        animationEasing: 'cubicOut'
      }
    ]
  }

  lineChart.setOption(lineOption)
}

// Initialize Scatter Chart - 学习效率分析
function initScatterChart() {
  if (!scatterChartRef.value) return

  scatterChart = echarts.init(scatterChartRef.value)

  // 模拟散点数据：每个点代表一个任务，[学习时长(小时), 任务难度(1-5), 完成状态]
  const scatterData = [
    // 硬件阶段
    [3, 1, 1], [8, 2, 1], [5, 3, 1], [2, 2, 0],
    // 固件阶段
    [1, 1, 0], [0.5, 1, 0], [1, 2, 0], [0.5, 2, 0], [1, 2, 0],
    // 其他阶段
    [0, 3, 0], [0, 2, 0], [0, 4, 0], [0, 3, 0], [0, 4, 0]
  ]

  const completedData = scatterData.filter(d => d[2] === 1)
  const pendingData = scatterData.filter(d => d[2] === 0)

  const scatterOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ccc',
      textStyle: { color: '#333' },
      formatter: (params) => {
        const [hours, difficulty, status] = params.value
        const difficultyText = ['入门', '基础', '进阶', '高级', '专家'][difficulty - 1]
        const statusText = status === 1 ? '已完成' : '待完成'
        return `学习时长: ${hours}小时<br/>难度: ${difficultyText}<br/>状态: ${statusText}`
      }
    },
    legend: {
      data: ['已完成', '待完成'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '10%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '学习时长(小时)',
      min: 0,
      max: 10
    },
    yAxis: {
      type: 'value',
      name: '难度等级',
      min: 0,
      max: 5,
      interval: 1,
      axisLabel: {
        formatter: (value) => ['入门', '基础', '进阶', '高级', '专家'][value - 1] || ''
      }
    },
    series: [
      {
        name: '已完成',
        type: 'scatter',
        data: completedData,
        symbolSize: 14,
        itemStyle: {
          color: '#67c23a',
          shadowBlur: 5,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        },
        animationDuration: 1500,
        animationDelay: (params) => params.dataIndex * 100,
        animationEasing: 'bounceOut'
      },
      {
        name: '待完成',
        type: 'scatter',
        data: pendingData,
        symbolSize: 12,
        itemStyle: {
          color: '#909399',
          opacity: 0.6
        },
        animationDuration: 1500,
        animationDelay: (params) => params.dataIndex * 50 + 500,
        animationEasing: 'bounceOut'
      }
    ]
  }

  scatterChart.setOption(scatterOption)
}

// Initialize Pie Chart - 任务难度分布
function initPieChart() {
  if (!pieChartRef.value) return

  pieChart = echarts.init(pieChartRef.value)

  const difficultyData = [
    { value: 12, name: '入门', itemStyle: { color: '#67c23a' } },
    { value: 18, name: '基础', itemStyle: { color: '#409eff' } },
    { value: 15, name: '进阶', itemStyle: { color: '#e6a23c' } },
    { value: 10, name: '高级', itemStyle: { color: '#f56c6c' } }
  ]

  const pieOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ccc',
      textStyle: { color: '#333' },
      formatter: '{b}: {c}个 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      formatter: (name) => {
        const item = difficultyData.find(d => d.name === name)
        return `${name}: ${item ? item.value : 0}个`
      }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        fontSize: 12
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        },
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      data: difficultyData,
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDuration: 1200
    }]
  }

  pieChart.setOption(pieOption)
}

// Initialize Progress Chart - 各阶段进度环形图
function initProgressChart() {
  if (!progressChartRef.value) return

  progressChart = echarts.init(progressChartRef.value)

  const stageTitles = ['硬件', '固件', '舵机', 'SDK', '仿真', 'ROS2', 'RL', '部署']
  const progressData = props.stageStats.length > 0
    ? props.stageStats.map(s => s.progress)
    : [50, 0, 0, 0, 0, 0, 0, 0]

  const colors = Object.values(stageColors)

  const progressOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#ccc',
      textStyle: { color: '#333' },
      formatter: (params) => {
        return `${params.name}<br/>进度: ${params.value}%`
      }
    },
    legend: {
      orient: 'vertical',
      right: '2%',
      top: 'center',
      formatter: (name) => {
        const idx = stageTitles.indexOf(name)
        const value = idx >= 0 ? progressData[idx] : 0
        return `${name}: ${value}%`
      }
    },
    series: [{
      type: 'pie',
      radius: ['35%', '60%'],
      center: ['35%', '50%'],
      roseType: 'area',
      itemStyle: {
        borderRadius: 6
      },
      label: {
        show: true,
        formatter: '{b}',
        fontSize: 11
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 13,
          fontWeight: 'bold'
        }
      },
      data: stageTitles.map((title, index) => ({
        name: title,
        value: progressData[index],
        itemStyle: { color: colors[index] }
      })),
      animationDuration: 1500,
      animationEasing: 'cubicOut'
    }]
  }

  progressChart.setOption(progressOption)
}

// Export chart as image
function exportChart(chartName) {
  const chartMap = {
    radarChart,
    barChart,
    lineChart,
    scatterChart,
    pieChart,
    progressChart
  }

  const chart = chartMap[chartName]
  if (!chart) return

  const link = document.createElement('a')
  link.download = `${chartName}-${Date.now()}.png`
  link.href = chart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' })
  link.click()
}

// Resize all charts
function resizeCharts() {
  const charts = [radarChart, barChart, lineChart, scatterChart, pieChart, progressChart]
  charts.forEach(chart => {
    if (chart) chart.resize()
  })
}

// Watch for data changes
watch(() => props.stageStats, () => {
  initBarChart()
  initProgressChart()
}, { deep: true })

// Lifecycle
onMounted(() => {
  initRadarChart()
  initBarChart()
  initLineChart()
  initScatterChart()
  initPieChart()
  initProgressChart()

  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)

  const charts = [radarChart, barChart, lineChart, scatterChart, pieChart, progressChart]
  charts.forEach(chart => {
    if (chart) chart.dispose()
  })
})

// Expose methods
defineExpose({
  exportChart,
  resizeCharts
})
</script>

<style scoped>
.advanced-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 20px;
  padding: 0;
}

.chart-card {
  min-height: 380px;
}

.chart-card :deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
  width: 100%;
}

@media (max-width: 768px) {
  .advanced-charts {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 250px;
  }
}
</style>
