<template>
  <div class="dashboard-page">
    <!-- 页面标题和控制区 -->
    <div class="page-header card mb-3">
      <div class="header-content">
        <div class="header-left">
          <h2>学习数据看板</h2>
          <p>全面了解您的学习进度和效率</p>
        </div>
        <div class="header-right">
          <el-button @click="refreshData" :loading="refreshing">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
          <el-button type="primary" @click="exportAllCharts">
            <el-icon><Download /></el-icon>
            导出所有图表
          </el-button>
        </div>
      </div>
    </div>

    <!-- 概览统计卡片 -->
    <el-row :gutter="20" class="stats-overview">
      <el-col :xs="12" :sm="8" :md="6">
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
      <el-col :xs="12" :sm="8" :md="6">
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
      <el-col :xs="12" :sm="8" :md="6">
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
      <el-col :xs="12" :sm="8" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon progress">
            <el-icon><DataLine /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ progressPercent }}%</div>
            <div class="stat-label">总体进度</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 高级图表区域 -->
    <div class="charts-section">
      <AdvancedCharts
        ref="advancedChartsRef"
        :stage-stats="stageStats"
        :completed-tasks-count="completedTasksCount"
      />
    </div>

    <!-- 学习效率详情 -->
    <el-card shadow="hover" class="efficiency-details mt-3">
      <template #header>
        <span>学习效率详情</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="日均学习时长">
          {{ efficiencyStats.dailyAvgHours.toFixed(1) }} 小时
        </el-descriptions-item>
        <el-descriptions-item label="任务完成率">
          {{ efficiencyStats.taskCompletionRate }}%
        </el-descriptions-item>
        <el-descriptions-item label="预计剩余时间">
          {{ formatRemainingTime(efficiencyStats.estimatedRemainingHours) }}
        </el-descriptions-item>
        <el-descriptions-item label="学习效率评级">
          <el-tag :type="efficiencyStats.efficiencyLevel === '高' ? 'success' : efficiencyStats.efficiencyLevel === '中' ? 'warning' : 'info'">
            {{ efficiencyStats.efficiencyLevel }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 最近活动时间线 -->
    <el-card shadow="hover" class="recent-activity mt-3">
      <template #header>
        <span>学习活动</span>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in recentActivities"
          :key="index"
          :timestamp="activity.timestamp"
          :type="activity.type"
          :icon="activity.icon"
          :color="activity.color"
        >
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-desc">{{ activity.description }}</div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useLearningStore } from '@/stores/learning'
import AdvancedCharts from '@/components/common/AdvancedCharts.vue'
import {
  Sunny, Clock, Odometer, DataLine,
  Refresh, Download, CircleCheck, VideoPlay, Document, Star
} from '@element-plus/icons-vue'

const learningStore = useLearningStore()
const advancedChartsRef = ref(null)
const refreshing = ref(false)

// 从 store 获取数据
const stageStats = computed(() => learningStore.stageStats)
const completedTasksCount = computed(() => learningStore.completedTasks.size)
const progressPercent = computed(() => learningStore.progressPercent)

// 统计数据（结合 store 和模拟数据）
const stats = reactive({
  streak: 7,
  totalTime: 12345,
  completedTasks: computed(() => completedTasksCount.value).value,
  progress: computed(() => progressPercent.value).value
})

// 计算效率统计
const efficiencyStats = computed(() => {
  const totalHours = 48 // 模拟总学习时间
  const completedCount = completedTasksCount.value
  const totalTasks = stageStats.value.reduce((sum, s) => sum + s.totalCount, 0)
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0
  const remainingHours = (totalTasks - completedCount) * 2 // 假设每任务平均2小时
  const dailyAvg = stats.streak > 0 ? (totalHours / stats.streak) : 0

  let level = '低'
  if (dailyAvg >= 3) level = '高'
  else if (dailyAvg >= 1.5) level = '中'

  return {
    dailyAvgHours: dailyAvg,
    taskCompletionRate: completionRate,
    estimatedRemainingHours: remainingHours,
    efficiencyLevel: level
  }
})

// 最近活动
const recentActivities = computed(() => [
  {
    timestamp: '2小时前',
    type: 'success',
    icon: CircleCheck,
    color: '#67c23a',
    title: '完成任务',
    description: '完成 ESP32 固件烧录 - 硬件组装'
  },
  {
    timestamp: '1天前',
    type: 'primary',
    icon: VideoPlay,
    color: '#409eff',
    title: '观看教程',
    description: '学习 ROS2 节点通信基础'
  },
  {
    timestamp: '2天前',
    type: 'success',
    icon: CircleCheck,
    color: '#67c23a',
    title: '完成任务',
    description: '完成 SDK 安装配置'
  },
  {
    timestamp: '3天前',
    type: 'primary',
    icon: Document,
    color: '#409eff',
    title: '学习文档',
    description: '阅读 MuJoCo 仿真教程'
  },
  {
    timestamp: '5天前',
    type: 'success',
    icon: CircleCheck,
    color: '#67c23a',
    title: '完成任务',
    description: '完成电子元件采购'
  }
])

// 方法
function formatTime(minutes) {
  if (!minutes) return '0分钟'
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours < 24) return `${hours}小时${mins > 0 ? mins + '分' : ''}`
  const days = Math.floor(hours / 24)
  return `${days}天${hours % 24 > 0 ? (hours % 24) + '小时' : ''}`
}

function formatRemainingTime(hours) {
  if (hours <= 0) return '已完成'
  if (hours < 24) return `约${Math.ceil(hours)}小时`
  const days = Math.floor(hours / 24)
  return `约${days}天`
}

async function refreshData() {
  refreshing.value = true
  try {
    // 模拟刷新延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    learningStore.loadFromLocalStorage()
  } finally {
    refreshing.value = false
  }
}

function exportAllCharts() {
  if (advancedChartsRef.value) {
    const chartTypes = ['radarChart', 'barChart', 'lineChart', 'scatterChart', 'pieChart', 'progressChart']
    chartTypes.forEach((chartName, index) => {
      setTimeout(() => {
        advancedChartsRef.value.exportChart(chartName)
      }, index * 300)
    })
  }
}

// 自动刷新（可选，每5分钟）
let autoRefreshTimer = null

onMounted(() => {
  // 启动自动刷新
  autoRefreshTimer = setInterval(() => {
    learningStore.loadFromLocalStorage()
  }, 5 * 60 * 1000)
})

// 清理定时器
onUnmounted(() => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
  }
})
</script>

<style scoped>
.dashboard-page {
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  padding: 20px 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left h2 {
  margin: 0 0 4px 0;
  font-size: 24px;
}

.header-left p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.header-right {
  display: flex;
  gap: 12px;
}

.stats-overview {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 26px;
  color: white;
}

.stat-icon.streak { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.time { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.stat-icon.tasks { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.progress { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 2px;
}

.charts-section {
  margin-bottom: 24px;
}

.efficiency-details {
  margin-bottom: 24px;
}

.mt-3 {
  margin-top: 24px;
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

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
    justify-content: flex-end;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 22px;
  }

  .stat-value {
    font-size: 22px;
  }
}
</style>
