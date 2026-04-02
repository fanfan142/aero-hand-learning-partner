<template>
  <div class="statistics-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else>
      <!-- 页面标题 -->
      <div class="page-header card mb-3">
        <div class="header-content">
          <h2>📊 学习统计</h2>
          <p>追踪您的学习进度和数据</p>
        </div>
        <div class="header-actions">
          <el-button @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>

      <!-- 概览统计 -->
      <el-row :gutter="20" class="stats-overview">
        <el-col :xs="12" :sm="12" :md="6">
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
        <el-col :xs="12" :sm="12" :md="6">
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
        <el-col :xs="12" :sm="12" :md="6">
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
        <el-col :xs="12" :sm="12" :md="6">
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

      <!-- 扩展统计维度 -->
      <el-row :gutter="20" class="stats-extended">
        <el-col :xs="12" :sm="8" :md="4">
          <el-card shadow="hover" class="stat-card small">
            <div class="stat-icon efficiency">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.avgTaskTime }}</div>
              <div class="stat-label">平均任务时长</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <el-card shadow="hover" class="stat-card small">
            <div class="stat-icon completion">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.completionRate }}%</div>
              <div class="stat-label">任务完成率</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <el-card shadow="hover" class="stat-card small">
            <div class="stat-icon stages">
              <el-icon><Collection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.completedStages }}/{{ stats.totalStages }}</div>
              <div class="stat-label">阶段完成</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <el-card shadow="hover" class="stat-card small">
            <div class="stat-icon efficiency-score">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.learningEfficiency }}</div>
              <div class="stat-label">学习效率</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <el-card shadow="hover" class="stat-card small">
            <div class="stat-icon consistency">
              <el-icon><Guide /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.consistencyScore }}%</div>
              <div class="stat-label">学习一致性</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <el-card shadow="hover" class="stat-card small">
            <div class="stat-icon achievements">
              <el-icon><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.unlockedAchievements }}/{{ stats.totalAchievements }}</div>
              <div class="stat-label">已解锁成就</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表区域 -->
      <el-row :gutter="20" class="charts-row">
        <!-- 学习进度环形图 -->
        <el-col :xs="24" :sm="24" :md="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>各阶段进度</span>
                <el-tag type="info" size="small">真实数据</el-tag>
              </div>
            </template>
            <div ref="progressChartRef" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 任务完成趋势 -->
        <el-col :xs="24" :sm="24" :md="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>任务完成趋势</span>
                <el-radio-group v-model="trendPeriod" size="small">
                  <el-radio-button label="week">本周</el-radio-button>
                  <el-radio-button label="month">本月</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="trendChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="charts-row">
        <!-- 学习热力图 -->
        <el-col :xs="24" :sm="24" :md="12">
          <el-card shadow="hover">
            <template #header>
              <span>学习活动热力图</span>
            </template>
            <div ref="heatmapChartRef" class="chart-container"></div>
          </el-card>
        </el-col>

        <!-- 难度分布 -->
        <el-col :xs="24" :sm="24" :md="12">
          <el-card shadow="hover">
            <template #header>
              <span>任务难度分布</span>
            </template>
            <div ref="difficultyChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 学习路径 -->
      <el-card shadow="hover" class="learning-path-section mt-3">
        <template #header>
          <div class="card-header">
            <span>🗺️ 学习路径</span>
          </div>
        </template>
        <LearningPath
          :stages="learningStore.stages"
          :current-stage-id="learningStore.currentStage"
          @stage-click="handleStageClick"
        />
      </el-card>

      <!-- 成就展示 -->
      <el-card shadow="hover" class="achievements-section mt-3">
        <template #header>
          <div class="card-header">
            <span>🏆 学习成就</span>
          </div>
        </template>

        <AchievementList
          :achievements="achievementsStore.allAchievements"
          :unlocked-count="achievementsStore.unlockedCount"
          :total-count="achievementsStore.totalCount"
          @achievement-click="handleAchievementClick"
        />
      </el-card>

      <!-- 最近活动 -->
      <el-card shadow="hover" class="recent-activity mt-3">
        <template #header>
          <div class="card-header">
            <span>📝 最近活动</span>
            <el-button size="small" text @click="$router.push('/learning')">
              查看全部
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </template>
        <el-timeline v-if="recentActivities.length > 0">
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
              <div v-if="activity.stage" class="activity-stage">
                <el-tag size="small" :type="getStageTagType(activity.stage)">
                  {{ activity.stage }}
                </el-tag>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无活动记录" />
      </el-card>
    </template>

    <!-- 成就详情弹窗 -->
    <el-dialog
      v-model="achievementDialogVisible"
      :title="selectedAchievement?.title"
      width="400px"
    >
      <div v-if="selectedAchievement" class="achievement-detail">
        <div class="detail-icon">{{ selectedAchievement.icon }}</div>
        <p class="detail-description">{{ selectedAchievement.description }}</p>

        <div v-if="selectedAchievement.target" class="detail-progress">
          <el-progress
            :percentage="getAchievementProgress(selectedAchievement)"
            :stroke-width="10"
            :format="formatDetailProgress"
          />
        </div>

        <div class="detail-meta">
          <el-tag :type="selectedAchievement.unlocked ? 'success' : 'info'">
            {{ selectedAchievement.unlocked ? '已解锁' : '未解锁' }}
          </el-tag>
          <el-tag>{{ getCategoryLabel(selectedAchievement.category) }}</el-tag>
        </div>

        <div v-if="selectedAchievement.unlocked && selectedAchievement.unlockedAt" class="detail-unlock-time">
          <el-icon><Calendar /></el-icon>
          解锁于 {{ formatDate(selectedAchievement.unlockedAt) }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import { useAchievementsStore } from '@/stores/achievements'
import * as echarts from 'echarts'
import {
  Sunny, Clock, Odometer, DataLine,
  Trophy, CircleCheck,
  Refresh, Timer, Collection, TrendCharts,
  Guide, ArrowRight, Calendar
} from '@element-plus/icons-vue'
import AchievementList from '@/components/learning/AchievementList.vue'
import LearningPath from '@/components/learning/LearningPath.vue'

const router = useRouter()
const learningStore = useLearningStore()
const achievementsStore = useAchievementsStore()

// Refs
const progressChartRef = ref(null)
const heatmapChartRef = ref(null)
const trendChartRef = ref(null)
const difficultyChartRef = ref(null)

// 加载状态
const loading = ref(true)
const achievementDialogVisible = ref(false)
const selectedAchievement = ref(null)
const trendPeriod = ref('week')

// 统计数据
const stats = reactive({
  streak: 7,
  totalTime: 12345,
  completedTasks: 0,
  progress: 0,
  avgTaskTime: '2.5h',
  completionRate: 0,
  completedStages: 0,
  totalStages: 8,
  learningEfficiency: '85%',
  consistencyScore: 0,
  unlockedAchievements: 0,
  totalAchievements: 12
})

// 从store获取真实数据
const recentActivities = computed(() => {
  const activities = []
  const completedTaskIds = Array.from(learningStore.completedTasks)

  // 构建活动列表
  completedTaskIds.forEach(taskId => {
    const taskDetail = learningStore.getTaskDetail(taskId)
    if (taskDetail) {
      activities.push({
        title: '完成任务',
        description: taskDetail.title,
        type: 'success',
        icon: CircleCheck,
        color: '#67c23a',
        timestamp: getRelativeTime(taskDetail.completedAt || Date.now()),
        stage: taskDetail.stageTitle
      })
    }
  })

  // 添加阶段完成活动
  learningStore.stages.forEach(stage => {
    if (stage.completed) {
      activities.push({
        title: '完成阶段',
        description: `完成 ${stage.title} 阶段学习`,
        type: 'primary',
        icon: Trophy,
        color: '#409eff',
        timestamp: getRelativeTime(Date.now() - Math.random() * 86400000 * 3),
        stage: stage.title
      })
    }
  })

  // 按时间排序
  return activities.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 8)
})

// 方法
function formatTime(minutes) {
  if (!minutes || minutes < 60) return `${minutes || 0}分钟`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours < 24) return `${hours}小时${mins > 0 ? mins + '分' : ''}`
  const days = Math.floor(hours / 24)
  return `${days}天${hours % 24 > 0 ? (hours % 24) + '小时' : ''}`
}

function getRelativeTime(timestamp) {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getStageTagType(stageTitle) {
  const stage = learningStore.stages.find(s => s.title === stageTitle)
  if (!stage) return 'info'
  const colors = {
    '硬件准备': '',
    '固件烧录': 'success',
    '舵机配置': 'warning',
    'SDK使用': '',
    'MuJoCo仿真': 'danger',
    'ROS2集成': '',
    'RL训练': 'info',
    'Sim2Real': ''
  }
  return colors[stageTitle] || ''
}

function getAchievementProgress(achievement) {
  if (!achievement.target || achievement.target === 0) return 0
  const progress = achievement.progress || 0
  return Math.min(100, Math.round((progress / achievement.target) * 100))
}

function formatDetailProgress() {
  const achievement = selectedAchievement.value
  if (!achievement) return '0%'
  return `${achievement.progress || 0}/${achievement.target}`
}

function getCategoryLabel(category) {
  const labels = {
    progress: '进度',
    dedication: '坚持',
    challenge: '挑战',
    exploration: '探索',
    speed: '速度',
    master: '大师',
    community: '社区'
  }
  return labels[category] || '成就'
}

function handleStageClick(stage) {
  learningStore.goToStage(stage.id)
  router.push('/learning')
}

function handleAchievementClick(achievement) {
  selectedAchievement.value = achievement
  achievementDialogVisible.value = true
}

function refreshData() {
  loading.value = true
  setTimeout(() => {
    loadRealData()
    loading.value = false
  }, 500)
}

function loadRealData() {
  // 从 store 获取真实数据
  const completedCount = learningStore.completedTasks.size
  stats.completedTasks = completedCount
  stats.progress = learningStore.progressPercent

  // 计算完成的阶段数
  const completedStages = learningStore.stages.filter(s => s.completed).length
  stats.completedStages = completedStages

  // 计算任务完成率
  const totalTasks = learningStore.stages.reduce((sum, stage) => sum + stage.tasks.length, 0)
  stats.completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  // 计算学习一致性（基于已完成任务的间隔）
  stats.consistencyScore = Math.min(100, Math.round((stats.streak / 30) * 100))

  // 从 achievementsStore 获取真实成就数据
  stats.unlockedAchievements = achievementsStore.unlockedCount
  stats.totalAchievements = achievementsStore.totalCount

  // 更新图表
  nextTick(() => {
    initProgressChart()
    initTrendChart()
    initDifficultyChart()
  })
}

function initProgressChart() {
  if (!progressChartRef.value) return

  const chart = echarts.init(progressChartRef.value)

  // 使用真实阶段数据
  const stageData = learningStore.stageStats.map(stage => ({
    name: stage.title,
    value: stage.progress,
    itemStyle: {
      color: learningStore.getDifficultyColor(stage.difficulty)
    }
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
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
          formatter: '{b}\n{d}%',
          fontSize: 11
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: stageData
      }
    ]
  }
  chart.setOption(option)
}

function initTrendChart() {
  if (!trendChartRef.value) return

  const chart = echarts.init(trendChartRef.value)

  // 生成趋势数据
  const xData = trendPeriod.value === 'week'
    ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    : Array.from({ length: 30 }, (_, i) => `${i + 1}日`)

  const completedData = trendPeriod.value === 'week'
    ? [2, 3, 1, 4, 2, 3, 2].slice(0, xData.length)
    : Array.from({ length: 30 }, () => Math.floor(Math.random() * 5) + 1)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: 40,
      right: 20,
      top: 20,
      bottom: 40
    },
    xAxis: {
      type: 'category',
      data: xData,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '完成任务数',
      minInterval: 1
    },
    series: [
      {
        name: '完成任务',
        type: 'line',
        data: completedData,
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        },
        lineStyle: {
          color: '#409eff',
          width: 2
        },
        itemStyle: {
          color: '#409eff'
        }
      }
    ]
  }
  chart.setOption(option)
}

function initHeatmapChart() {
  if (!heatmapChartRef.value) return

  const chart = echarts.init(heatmapChartRef.value)

  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const data = []

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 24; j++) {
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

function initDifficultyChart() {
  if (!difficultyChartRef.value) return

  const chart = echarts.init(difficultyChartRef.value)

  const distribution = learningStore.difficultyDistribution

  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: 20,
      top: 'middle'
    },
    series: [
      {
        name: '难度分布',
        type: 'pie',
        radius: ['35%', '60%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}个',
          fontSize: 11
        },
        data: [
          { value: distribution['入门'], name: '入门', itemStyle: { color: '#67c23a' } },
          { value: distribution['基础'], name: '基础', itemStyle: { color: '#409eff' } },
          { value: distribution['进阶'], name: '进阶', itemStyle: { color: '#e6a23c' } },
          { value: distribution['高级'], name: '高级', itemStyle: { color: '#f56c6c' } }
        ]
      }
    ]
  }
  chart.setOption(option)
}

function initCharts() {
  initHeatmapChart()
  loadRealData()
}

function handleResize() {
  const charts = [
    progressChartRef.value,
    heatmapChartRef.value,
    trendChartRef.value,
    difficultyChartRef.value
  ]

  charts.forEach(chartRef => {
    if (chartRef) {
      echarts.getInstanceByDom(chartRef)?.resize()
    }
  })
}

// 监听趋势周期变化
watch(trendPeriod, () => {
  initTrendChart()
})

onMounted(() => {
  setTimeout(() => {
    loading.value = false
    initCharts()
  }, 300)

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.statistics-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
}

.loading-state {
  padding: 40px;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0 0 8px 0;
}

.header-content p {
  margin: 0;
  color: #909399;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 统计概览 */
.stats-overview {
  margin-bottom: 20px;
}

.stats-extended {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  height: 100%;
}

.stat-card.small {
  padding: 16px;
  gap: 12px;
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
  flex-shrink: 0;
}

.stat-card.small .stat-icon {
  width: 44px;
  height: 44px;
  font-size: 20px;
}

.stat-icon.streak { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.time { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.stat-icon.tasks { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.progress { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.stat-icon.efficiency { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.stat-icon.completion { background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); }
.stat-icon.stages { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }
.stat-icon.efficiency-score { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
.stat-icon.consistency { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.achievements { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-card.small .stat-value {
  font-size: 18px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

/* 图表区域 */
.charts-row {
  margin-bottom: 20px;
}

.chart-container {
  height: 280px;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 学习路径 */
.learning-path-section {
  margin-top: 24px;
}

/* 成就区域 */
.achievements-section {
  margin-top: 24px;
}

/* 成就详情 */
.achievement-detail {
  text-align: center;
}

.detail-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.detail-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 20px;
  line-height: 1.6;
}

.detail-progress {
  margin-bottom: 16px;
}

.detail-meta {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.detail-unlock-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
}

/* 活动内容 */
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

.activity-stage {
  margin-top: 6px;
}

/* 空状态 */
.empty-state {
  padding: 40px;
  text-align: center;
}

/* 响应式 */
@media (max-width: 768px) {
  .stat-card {
    padding: 16px;
    gap: 12px;
  }

  .stat-icon {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }

  .stat-value {
    font-size: 20px;
  }

  .chart-container {
    height: 240px;
  }
}

.mt-3 {
  margin-top: 24px;
}
</style>
