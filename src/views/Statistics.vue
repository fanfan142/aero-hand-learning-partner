<template>
  <div class="statistics-page">
    <!-- 页面标题 -->
    <div class="page-header card mb-3">
      <h2>📊 学习统计</h2>
      <p>追踪您的学习进度和数据</p>
    </div>

    <!-- 概览统计 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon streak">
            <el-icon><Sunny /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.streak }}</div>
            <div class="stat-label">连续学习天数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon time">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatTime(stats.totalTime) }}</div>
            <div class="stat-label">累计学习时间</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon tasks">
            <el-icon><Odometer /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.completedTasks }}</div>
            <div class="stat-label">完成任务数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon progress">
            <el-icon><DataLine /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.progress }}%</div>
            <div class="stat-label">总体进度</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20">
      <!-- 学习进度环形图 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>各阶段进度</span>
          </template>
          <div ref="progressChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 学习热力图 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>学习活动热力图</span>
          </template>
          <div ref="heatmapChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近活动 -->
    <el-card shadow="hover" class="recent-activity mt-3">
      <template #header>
        <span>最近活动</span>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in recentActivities"
          :key="index"
          :timestamp="activity.timestamp"
          :type="activity.type"
          :icon="activity.icon"
        >
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-desc">{{ activity.description }}</div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 学习成就 -->
    <el-card shadow="hover" class="achievements mt-3">
      <template #header>
        <span>学习成就</span>
      </template>
      <div class="achievements-grid">
        <div
          v-for="achievement in achievements"
          :key="achievement.id"
          :class="['achievement-item', { unlocked: achievement.unlocked }]"
        >
          <div class="achievement-icon">{{ achievement.icon }}</div>
          <div class="achievement-title">{{ achievement.title }}</div>
          <div class="achievement-desc">{{ achievement.description }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useLearningStore } from '@/stores/learning'
import * as echarts from 'echarts'
import {
  Sunny, Clock, Odometer, DataLine,
  Trophy, Medal, Star, CircleCheck
} from '@element-plus/icons-vue'

const learningStore = useLearningStore()

// Refs
const progressChartRef = ref(null)
const heatmapChartRef = ref(null)

// 统计数据（模拟）
const stats = reactive({
  streak: 7,
  totalTime: 12345, // 分钟
  completedTasks: 23,
  progress: 35
})

// 计算属性
const recentActivities = computed(() => [
  { timestamp: '2小时前', type: 'success', icon: CircleCheck, title: '完成任务', description: '完成 ESP32 固件烧录' },
  { timestamp: '1天前', type: 'primary', icon: CircleCheck, title: '开始学习', description: '开始学习 ROS2 集成' },
  { timestamp: '2天前', type: 'success', icon: CircleCheck, title: '完成任务', description: '完成 SDK 安装' },
  { timestamp: '3天前', type: 'primary', icon: CircleCheck, title: '开始学习', description: '开始学习硬件组装' },
  { timestamp: '5天前', type: 'info', icon: CircleCheck, title: '完成任务', description: '完成电子元件采购' }
])

// 成就数据
const achievements = reactive([
  { id: 1, icon: '🌱', title: '初学者', description: '完成第一个任务', unlocked: true },
  { id: 2, icon: '🔥', title: '坚持7天', description: '连续学习7天', unlocked: true },
  { id: 3, icon: '📚', title: '好学不倦', description: '完成10个任务', unlocked: true },
  { id: 4, icon: '⚡', title: '快速学习', description: '一天完成3个任务', unlocked: false },
  { id: 5, icon: '🏆', title: '学习达人', description: '完成所有硬件任务', unlocked: false },
  { id: 6, icon: '🚀', title: '坚持30天', description: '连续学习30天', unlocked: false }
])

// 方法
function formatTime(minutes) {
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours < 24) return `${hours}小时${mins}分`
  const days = Math.floor(hours / 24)
  return `${days}天${hours % 24}小时`
}

function initProgressChart() {
  if (!progressChartRef.value) return

  const chart = echarts.init(progressChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '学习进度',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {d}%'
        },
        data: [
          { value: 35, name: '硬件准备', itemStyle: { color: '#667eea' } },
          { value: 20, name: '组装调试', itemStyle: { color: '#764ba2' } },
          { value: 15, name: '固件烧录', itemStyle: { color: '#f093fb' } },
          { value: 10, name: 'SDK使用', itemStyle: { color: '#4facfe' } },
          { value: 20, name: '未开始', itemStyle: { color: '#e0e0e0' } }
        ]
      }
    ]
  }
  chart.setOption(option)
}

function initHeatmapChart() {
  if (!heatmapChartRef.value) return

  const chart = echarts.init(heatmapChartRef.value)

  // 模拟热力图数据
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const data = []

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 24; j++) {
      // 模拟学习活跃时间
      let value = Math.random() * 10
      if (j >= 9 && j <= 22) value = Math.random() * 30 + 10
      if (j >= 19 && j <= 21) value = Math.random() * 40 + 30
      data.push([j, i, Math.floor(value)])
    }
  }

  const option = {
    tooltip: {
      position: 'top',
      formatter: (params) => `${days[params.value[1]]} ${hours[params.value[0]]}<br/>学习时长: ${params.value[2]}分钟`
    },
    grid: {
      left: 50,
      right: 20,
      top: 20,
      bottom: 40
    },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: { show: true }
    },
    yAxis: {
      type: 'category',
      data: days,
      splitArea: { show: true }
    },
    visualMap: {
      min: 0,
      max: 60,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: {
        color: ['#e0e0e0', '#c6e48b', '#7bccc4', '#2f4554']
      }
    },
    series: [{
      name: '学习时长',
      type: 'heatmap',
      data: data,
      label: { show: false },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  chart.setOption(option)
}

onMounted(() => {
  initProgressChart()
  initHeatmapChart()

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    if (progressChartRef.value) {
      echarts.getInstanceByDom(progressChartRef.value)?.resize()
    }
    if (heatmapChartRef.value) {
      echarts.getInstanceByDom(heatmapChartRef.value)?.resize()
    }
  })
})
</script>

<style scoped>
.statistics-page {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-overview {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 28px;
  color: white;
}

.stat-icon.streak { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.time { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.stat-icon.tasks { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.progress { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.activity-content {
  padding: 4px 0;
}

.activity-title {
  font-weight: 600;
  color: #303133;
}

.activity-desc {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.achievement-item {
  padding: 20px;
  border-radius: 12px;
  background: #f5f7fa;
  text-align: center;
  opacity: 0.5;
  transition: all 0.3s;
}

.achievement-item.unlocked {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  opacity: 1;
}

.achievement-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.achievement-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.achievement-desc {
  font-size: 12px;
}

.mt-3 {
  margin-top: 24px;
}
</style>
