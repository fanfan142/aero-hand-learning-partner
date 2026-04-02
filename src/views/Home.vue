<template>
  <div class="home-page">
    <!-- 顶部统计卡片区 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="stat-card gradient-blue">
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <div class="stat-value">{{ completedTasksCount }}</div>
            <div class="stat-label">已完成任务</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card gradient-purple">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <div class="stat-value">{{ currentStageData?.tasks?.length || 0 }}</div>
            <div class="stat-label">当前阶段任务</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card gradient-green">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalEstimatedTime }}</div>
            <div class="stat-label">预估学习时间</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card gradient-orange">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <div class="stat-value">{{ streakDays }}</div>
            <div class="stat-label">连续学习天数</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 进度概览 -->
    <div class="progress-overview card mb-3">
      <div class="overview-content">
        <div class="overview-left">
          <div class="circular-progress">
            <svg viewBox="0 0 100 100">
              <circle
                class="progress-bg"
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke-width="8"
              />
              <circle
                class="progress-bar"
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke-width="8"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="progressOffset"
                :stroke="progressColor"
              />
            </svg>
            <div class="progress-text">
              <span class="progress-percent">{{ progressPercent }}%</span>
              <span class="progress-label">总进度</span>
            </div>
          </div>
        </div>
        <div class="overview-right">
          <h2>🚀 我的学习之旅</h2>
          <p class="current-stage-text">
            <span class="label-tag">当前阶段</span>
            <span class="stage-name">{{ currentStageData?.title }}</span>
          </p>
          <div class="stage-description" v-if="currentStageData?.description">
            {{ currentStageData.description }}
          </div>
          <div class="stage-badges">
            <el-tag v-if="currentStageData?.difficulty" type="warning" effect="dark" size="small">
              {{ currentStageData.difficulty }}
            </el-tag>
            <el-tag v-if="currentStageData?.estimatedTime" type="info" effect="plain" size="small">
              {{ currentStageData.estimatedTime }}
            </el-tag>
            <el-tag v-if="currentStageData?.outcomes?.length" type="success" effect="plain" size="small">
              {{ currentStageData.outcomes.length }} 个学习成果
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选栏 -->
    <div class="filter-bar card mb-3">
      <el-row :gutter="16" align="middle">
        <el-col :span="8">
          <el-input
            v-model="searchQuery"
            placeholder="🔍 搜索任务..."
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
        </el-col>
        <el-col :span="14">
          <div class="filter-tags">
            <span class="filter-label">筛选：</span>
            <el-check-tag
              :checked="filterStatus === 'all'"
              @change="handleFilterChange('all')"
              class="filter-tag"
            >全部</el-check-tag>
            <el-check-tag
              :checked="filterStatus === 'completed'"
              @change="handleFilterChange('completed')"
              class="filter-tag"
            >✅ 已完成</el-check-tag>
            <el-check-tag
              :checked="filterStatus === 'in-progress'"
              @change="handleFilterChange('in-progress')"
              class="filter-tag"
            >🔄 进行中</el-check-tag>
            <el-check-tag
              :checked="filterStatus === 'pending'"
              @change="handleFilterChange('pending')"
              class="filter-tag"
            >⏳ 待开始</el-check-tag>
          </div>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="aiDrawerVisible = true" circle>
            💬
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 主内容区 -->
    <el-row :gutter="20">
      <!-- 左侧：学习路线图 + 时间线 -->
      <el-col :span="10">
        <!-- 学习路线 -->
        <div class="learning-path-map card mb-3">
          <LearningPath
            :stages="stages"
            :current-stage-id="currentStage"
            @stage-click="handleStageClick"
          />
        </div>

        <!-- 学习时间线 -->
        <div class="learning-timeline card">
          <div class="section-header">
            <h3>📅 学习历程</h3>
          </div>
          <el-timeline>
            <el-timeline-item
              v-for="(entry, index) in learningHistory"
              :key="index"
              :type="entry.type"
              :icon="entry.icon"
              :timestamp="entry.timestamp"
              placement="top"
            >
              <div class="timeline-content">
                <div class="timeline-title">{{ entry.title }}</div>
                <div class="timeline-desc" v-if="entry.description">{{ entry.description }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- 学习资源 -->
        <div class="learning-resources-section card mt-3">
          <LearningResources
            :tutorials="learningStore.tutorials"
            :videos="learningStore.videos"
            :projects="learningStore.practiceProjects"
            @open-resource="openResource"
            @select-project="selectProject"
          />
        </div>
      </el-col>

      <!-- 右侧：当前阶段详情 -->
      <el-col :span="14">
        <div class="current-stage-detail card">
          <div class="section-header">
            <h3>📋 {{ currentStageData?.title }}</h3>
            <el-button
              v-if="currentStageData?.resources?.length"
              type="primary" plain size="small"
              @click="showResources = !showResources"
            >
              📚 {{ showResources ? '收起' : '展开' }}学习资源
            </el-button>
          </div>

          <!-- 学习资源 -->
          <div v-if="showResources && currentStageData?.resources" class="resources-panel">
            <div
              v-for="resource in currentStageData.resources"
              :key="resource.url"
              class="resource-item"
              @click="openResource(resource)"
            >
              <span class="resource-icon">{{ resource.icon || '📖' }}</span>
              <div class="resource-info">
                <div class="resource-title">{{ resource.title }}</div>
                <div class="resource-desc">{{ resource.description }}</div>
              </div>
              <el-tag size="small" :type="resource.type || 'info'">
                {{ resource.type === 'video' ? '视频' : resource.type === 'doc' ? '文档' : '链接' }}
              </el-tag>
            </div>
          </div>

          <!-- 学习成果 -->
          <div v-if="currentStageData?.outcomes?.length" class="outcomes-panel">
            <div class="panel-title">🎯 学习成果</div>
            <div class="outcomes-list">
              <div
                v-for="(outcome, idx) in currentStageData.outcomes"
                :key="idx"
                class="outcome-item"
                :class="{ 'outcome-achieved': outcome.achieved }"
              >
                <span class="outcome-icon">{{ outcome.achieved ? '✅' : '⬜' }}</span>
                <span class="outcome-text">{{ outcome.text }}</span>
              </div>
            </div>
          </div>

          <!-- 任务列表 -->
          <div class="tasks-list">
            <div
              v-for="task in filteredTasks"
              :key="task.id"
              :class="['task-item', getTaskClass(task), { 'task-expanded': expandedTaskId === task.id }]"
              @click="handleTaskClick(task)"
            >
              <div class="task-main">
                <div class="task-checkbox" @click.stop>
                  <el-checkbox
                    :model-value="isTaskCompleted(task.id)"
                    @change="(val) => handleTaskCheck(task.id, val)"
                    :disabled="task.blocked"
                  />
                </div>
                <div class="task-info">
                  <div class="task-title">{{ task.title }}</div>
                  <div class="task-tags">
                    <el-tag v-if="task.difficulty" size="small" :type="getDifficultyType(task.difficulty)">
                      {{ task.difficulty }}
                    </el-tag>
                    <el-tag v-if="task.estimatedTime" size="small" type="info">
                      ⏱️ {{ task.estimatedTime }}
                    </el-tag>
                  </div>
                </div>
                <div class="task-status">
                  <el-tag v-if="task.completed || learningStore.completedTasks.has(task.id)" type="success" size="small" effect="dark">
                    ✅ 完成
                  </el-tag>
                  <el-tag v-else-if="task.blocked" type="warning" size="small">
                    🔒 阻塞
                  </el-tag>
                  <el-tag v-else-if="task.current" type="primary" size="small" effect="dark">
                    🔄 进行中
                  </el-tag>
                  <el-tag v-else type="info" size="small">
                    ⏳ 待开始
                  </el-tag>
                </div>
                <div class="task-expand" @click.stop="handleTaskExpand(task)">
                  <el-icon v-if="expandedTaskId === task.id"><ArrowUp /></el-icon>
                  <el-icon v-else><ArrowDown /></el-icon>
                </div>
              </div>

              <!-- 任务详情展开 -->
              <div v-if="expandedTaskId === task.id" class="task-detail-expanded">
                <!-- 描述 -->
                <div v-if="task.description" class="task-description">
                  <p><strong>📝 说明：</strong></p>
                  <p class="description-text">{{ task.description }}</p>
                </div>

                <!-- 步骤 -->
                <div v-if="task.steps?.length" class="task-steps">
                  <p><strong>📌 操作步骤：</strong></p>
                  <el-steps direction="vertical" :active="task.completed || learningStore.completedTasks.has(task.id) ? task.steps.length : 0">
                    <el-step v-for="(step, i) in task.steps" :key="i" :title="step" />
                  </el-steps>
                </div>

                <!-- 命令 -->
                <div v-if="task.commands?.length" class="task-commands">
                  <p><strong>💻 命令：</strong></p>
                  <div v-for="(cmd, i) in task.commands" :key="i" class="command-box">
                    <el-text code>{{ cmd }}</el-text>
                    <el-button
                      size="small"
                      type="primary"
                      @click="copyCommand(cmd)"
                      style="margin-left: 8px"
                    >
                      📋 复制
                    </el-button>
                  </div>
                </div>

                <!-- 预期效果 -->
                <div v-if="task.expected" class="task-expected">
                  <p><strong>✨ 预期效果：</strong></p>
                  <el-alert type="success" :closable="false" show-icon>
                    {{ task.expected }}
                  </el-alert>
                </div>

                <!-- 提示 -->
                <div v-if="task.tips?.length" class="task-tips">
                  <p><strong>💡 提示：</strong></p>
                  <el-alert type="warning" :closable="false" show-icon>
                    <ul class="tips-list">
                      <li v-for="(tip, i) in task.tips" :key="i">{{ tip }}</li>
                    </ul>
                  </el-alert>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <el-empty
            v-if="filteredTasks.length === 0"
            description="没有找到匹配的任务"
          >
            <el-button type="primary" @click="resetFilters">重置筛选</el-button>
          </el-empty>
        </div>
      </el-col>
    </el-row>

    <!-- AI助手对话框 -->
    <el-drawer
      v-model="aiDrawerVisible"
      title="💬 AI学习助手"
      direction="rtl"
      size="40%"
    >
      <AIAssistant :context="currentStageData" />
    </el-drawer>

    <!-- 任务详情弹窗 -->
    <TaskDetailModal
      v-model="taskDetailVisible"
      :task="selectedTask"
      @complete="handleTaskCheck"
      @uncomplete="handleTaskUncomplete"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLearningStore } from '@/stores/learning'
import { useAchievementsStore } from '@/stores/achievements'
import { ElMessage } from 'element-plus'
import { Search, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { LearningPath, LearningResources, TaskDetailModal } from '@/components/learning'
import AIAssistant from '@/components/ai/AIAssistant.vue'

const learningStore = useLearningStore()
const achievementsStore = useAchievementsStore()

// 数据
const aiDrawerVisible = ref(false)
const selectedTask = ref(null)
const expandedTaskId = ref(null)
const searchQuery = ref('')
const filterStatus = ref('all')
const showResources = ref(false)
const taskDetailVisible = ref(false)

// 模拟学习历史数据（实际项目中应从store获取）
const learningHistory = ref([
  { title: '开始学习之旅', description: '完成了学习路线规划', timestamp: '2024-01-15', type: 'primary', icon: '🚀' },
  { title: '完成第一阶段', description: '环境配置与基础概念', timestamp: '2024-01-18', type: 'success', icon: '🎉' },
  { title: '深入学习第二阶段', description: '完成了核心模块学习', timestamp: '2024-01-22', type: 'warning', icon: '📚' },
])

// 模拟连续学习天数（实际项目中应从store获取）
const streakDays = ref(7)

// 模拟预估总时间
const totalEstimatedTime = computed(() => {
  return '约 12 小时'
})

// 计算属性
const stages = computed(() => learningStore.stages)
const currentStageData = computed(() => learningStore.currentStageData)
const progressPercent = computed(() => learningStore.progressPercent)

const completedTasksCount = computed(() => {
  let count = 0
  stages.value.forEach(stage => {
    stage.tasks.forEach(task => {
      if (task.completed || learningStore.completedTasks.has(task.id)) {
        count++
      }
    })
  })
  return count
})

// 环形进度计算
const circumference = 2 * Math.PI * 45
const progressOffset = computed(() => {
  return circumference - (progressPercent.value / 100) * circumference
})

const progressColor = computed(() => {
  const pct = progressPercent.value
  if (pct < 30) return '#f56c6c'
  if (pct < 70) return '#e6a23c'
  return '#67c23a'
})

// 筛选后的任务
const filteredTasks = computed(() => {
  if (!currentStageData.value?.tasks) return []

  let tasks = currentStageData.value.tasks

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    tasks = tasks.filter(task =>
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query)
    )
  }

  // 状态过滤
  if (filterStatus.value !== 'all') {
    tasks = tasks.filter(task => {
      const isCompleted = task.completed || learningStore.completedTasks.has(task.id)
      switch (filterStatus.value) {
        case 'completed':
          return isCompleted
        case 'in-progress':
          return task.current && !isCompleted
        case 'pending':
          return !task.current && !isCompleted && !task.blocked
        default:
          return true
      }
    })
  }

  return tasks
})

// 方法
const getStageClass = (stage) => {
  if (stage.completed) return 'stage-completed'
  if (stage.current) return 'stage-current'
  return 'stage-pending'
}

const getStageProgress = (stage) => {
  const completed = stage.tasks.filter(t => t.completed || learningStore.completedTasks.has(t.id)).length
  const total = stage.tasks.length
  return `${completed}/${total}`
}

const getTaskClass = (task) => {
  if (task.completed || learningStore.completedTasks.has(task.id)) return 'task-completed'
  if (task.current) return 'task-current'
  if (task.blocked) return 'task-blocked'
  return 'task-pending'
}

const getDifficultyType = (difficulty) => {
  const map = {
    '入门': 'success',
    '基础': 'info',
    '进阶': 'warning',
    '高级': 'danger'
  }
  return map[difficulty] || 'info'
}

const isTaskCompleted = (taskId) => {
  return learningStore.completedTasks.has(taskId)
}

const handleStageClick = (stage) => {
  learningStore.goToStage(stage.id)
}

const handleTaskClick = (task) => {
  if (task.blocked) {
    ElMessage.warning(`任务被阻塞：${task.reason}`)
    return
  }
  // 如果是双击或者特定操作，打开详情弹窗
  selectedTask.value = task
  taskDetailVisible.value = true
}

const handleTaskExpand = (task) => {
  if (task.blocked) {
    ElMessage.warning(`任务被阻塞：${task.reason}`)
    return
  }
  // 切换展开状态
  expandedTaskId.value = expandedTaskId.value === task.id ? null : task.id
}

const handleTaskCheck = (taskId, val) => {
  learningStore.toggleTaskComplete(taskId, val)
  if (val) {
    ElMessage.success('🎉 任务完成！继续保持！')
  } else {
    ElMessage.info('任务已取消完成')
  }
}

const handleTaskUncomplete = (taskId) => {
  learningStore.toggleTaskComplete(taskId, false)
  ElMessage.info('任务已取消完成')
}

const handleSearch = () => {
  // 搜索会在 computed 中自动处理
}

const handleFilterChange = (status) => {
  filterStatus.value = status
}

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'all'
}

const copyCommand = (cmd) => {
  navigator.clipboard.writeText(cmd)
  ElMessage.success('命令已复制到剪贴板')
}

const openResource = (resource) => {
  if (resource.url) {
    window.open(resource.url, '_blank')
  }
}

const selectProject = (project) => {
  ElMessage.info(`已选择项目: ${project.title}`)
  // 可以导航到项目详情或打开项目任务
}
</script>

<style scoped>
.home-page {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  z-index: 1;
}

/* 页面进入动画 */
.home-page-enter-active {
  animation: pageEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 16px;
  color: white;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
}

.stat-card:active {
  transform: translateY(-2px) scale(0.99);
}

.stat-icon {
  font-size: 40px;
  margin-right: 16px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.15) rotate(5deg);
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.gradient-blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-purple {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.gradient-green {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.gradient-orange {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* 卡片顶部装饰线 */
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:hover::before {
  opacity: 1;
}

.card:hover {
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
  transform: translateY(-4px);
}

.mb-3 {
  margin-bottom: 20px;
}

.mt-3 {
  margin-top: 20px;
}

/* 进度概览 */
.progress-overview {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

/* 进度概览背景装饰 */
.progress-overview::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: floatBg 6s ease-in-out infinite;
}

@keyframes floatBg {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

.overview-content {
  display: flex;
  align-items: center;
  gap: 40px;
}

.overview-left {
  flex-shrink: 0;
}

.circular-progress {
  position: relative;
  width: 140px;
  height: 140px;
}

.circular-progress svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.progress-bg {
  stroke: rgba(255, 255, 255, 0.2);
}

.progress-bar {
  stroke-linecap: round;
  transition: stroke-dashoffset 0.8s ease-out;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-percent {
  display: block;
  font-size: 32px;
  font-weight: bold;
}

.progress-label {
  font-size: 12px;
  opacity: 0.8;
}

.overview-right {
  flex: 1;
}

.overview-right h2 {
  margin: 0 0 16px 0;
  font-size: 26px;
}

.current-stage-text {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.label-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.stage-name {
  font-size: 18px;
  font-weight: 600;
}

.stage-description {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 12px;
  line-height: 1.6;
}

.stage-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 筛选栏 */
.filter-bar {
  padding: 16px 24px;
  transition: all 0.3s ease;
}

.filter-bar:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.filter-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}

.filter-tag {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
}

.filter-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 区块标题 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

/* 学习路线 */
.path-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.path-stage {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.path-stage:hover {
  background: #f5f7fa;
  transform: translateX(4px);
}

.stage-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e4e7ed;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.stage-current .stage-number {
  background: #409eff;
  color: white;
}

.stage-completed .stage-number {
  background: #67c23a;
  color: white;
}

.stage-icon {
  font-size: 20px;
}

.stage-current .stage-icon {
  color: #409eff;
}

.stage-completed .stage-icon {
  color: #67c23a;
}

.stage-content {
  flex: 1;
}

.stage-title {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 15px;
}

.stage-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stage-progress-badge {
  font-size: 12px;
  color: #666;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 10px;
}

.stage-arrow {
  color: #dcdfe6;
}

.stage-completed {
  opacity: 0.75;
}

.stage-current {
  background: linear-gradient(135deg, #ecf5ff 0%, #f0f9ff 100%);
  border: 2px solid #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
}

/* 时间线 */
.learning-timeline {
  padding: 20px 24px;
}

.timeline-content {
  padding: 4px 0;
}

.timeline-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.timeline-desc {
  font-size: 13px;
  color: #666;
}

/* 资源面板 */
.resources-panel {
  background: #f9fafc;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.resource-item:hover {
  background: white;
}

.resource-icon {
  font-size: 24px;
}

.resource-info {
  flex: 1;
}

.resource-title {
  font-weight: 600;
  font-size: 14px;
}

.resource-desc {
  font-size: 12px;
  color: #666;
}

/* 成果面板 */
.outcomes-panel {
  background: linear-gradient(135deg, #f0f9ff 0%, #ecf5ff 100%);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
}

.panel-title {
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 15px;
}

.outcomes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.outcome-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  transition: all 0.3s;
}

.outcome-achieved {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
}

.outcome-icon {
  font-size: 16px;
}

.outcome-text {
  font-size: 14px;
}

/* 任务列表 */
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
  background: white;
}

.task-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.1) 0%, transparent 100%);
  transition: width 0.3s ease;
}

.task-item:hover::before {
  width: 100%;
}

.task-item:hover {
  border-color: #409eff;
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.15);
  transform: translateX(4px);
}

.task-item:active {
  transform: translateX(2px) scale(0.99);
}

.task-main {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  gap: 12px;
}

.task-checkbox {
  flex-shrink: 0;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 15px;
}

.task-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.task-status {
  flex-shrink: 0;
}

.task-expand {
  flex-shrink: 0;
  color: #c0c4cc;
  transition: transform 0.3s;
}

.task-expanded .task-expand {
  transform: rotate(180deg);
}

.task-completed {
  background: linear-gradient(135deg, #f0f9ff 0%, #e8f5e9 100%);
  border-color: #67c23a;
}

.task-current {
  background: linear-gradient(135deg, #ecf5ff 0%, #f0f9ff 100%);
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
}

.task-blocked {
  background: #fdf6ec;
  border-color: #e6a23c;
  cursor: not-allowed;
  opacity: 0.7;
}

.task-pending {
  background: white;
}

/* 任务详情展开 */
.task-detail-expanded {
  padding: 0 16px 16px 48px;
  border-top: 1px dashed #e4e7ed;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.task-description {
  margin-top: 16px;
}

.task-description p {
  margin: 0 0 8px 0;
}

.description-text {
  color: #666;
  line-height: 1.8;
  font-size: 14px;
}

.task-steps,
.task-commands,
.task-expected,
.task-tips {
  margin-top: 16px;
}

.task-steps p,
.task-commands p,
.task-expected p,
.task-tips p {
  margin: 0 0 8px 0;
}

.command-box {
  display: flex;
  align-items: center;
  margin: 8px 0;
  padding: 10px 14px;
  background: linear-gradient(135deg, #e6f3ff 0%, #f0f9ff 100%);
  border: 1px solid #b3d9ff;
  border-radius: 6px;
  color: #1a1a1a;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
}

.tips-list li {
  margin: 4px 0;
}

/* 空状态 */
.el-empty {
  padding: 40px 0;
}

/* 进度条样式覆盖 */
:deep(.el-progress-bar__outer) {
  background: rgba(255, 255, 255, 0.3);
}

:deep(.el-progress__text) {
  color: white;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .overview-content {
    flex-direction: column;
    text-align: center;
  }

  .current-stage-text {
    justify-content: center;
  }

  .stage-badges {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .stats-row .el-col {
    margin-bottom: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    font-size: 28px;
  }

  .stat-value {
    font-size: 22px;
  }
}
</style>
