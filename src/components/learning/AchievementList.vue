<template>
  <div class="achievement-list-container">
    <!-- 头部统计 -->
    <div class="achievement-header">
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-value">{{ unlockedCount }}</span>
          <span class="stat-label">已解锁</span>
        </div>
        <div class="stat-item total">
          <span class="stat-value">/ {{ totalCount }}</span>
          <span class="stat-label">总成就</span>
        </div>
      </div>
      <div class="header-progress">
        <el-progress
          :percentage="progressPercent"
          :stroke-width="8"
          :format="formatPercent"
        />
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-radio-group v-model="filterCategory" size="small">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="progress">进度</el-radio-button>
        <el-radio-button label="dedication">坚持</el-radio-button>
        <el-radio-button label="challenge">挑战</el-radio-button>
        <el-radio-button label="master">大师</el-radio-button>
      </el-radio-group>

      <el-radio-group v-model="filterStatus" size="small">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="unlocked">已解锁</el-radio-button>
        <el-radio-button label="locked">未解锁</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 成就网格 -->
    <div class="achievement-grid">
      <div
        v-for="achievement in filteredAchievements"
        :key="achievement.id"
        :class="[
          'achievement-item',
          { 'achievement-unlocked': achievement.unlocked },
          { 'achievement-locked': !achievement.unlocked }
        ]"
        @click="handleAchievementClick(achievement)"
      >
        <!-- 解锁标记 -->
        <div v-if="achievement.unlocked" class="unlocked-mark">
          <span>✓</span>
        </div>

        <!-- 图标区域 -->
        <div class="achievement-icon">
          {{ achievement.icon }}
        </div>

        <!-- 进度条 -->
        <div v-if="achievement.target" class="achievement-progress">
          <el-progress
            :percentage="getAchievementProgress(achievement)"
            :stroke-width="4"
            :show-text="false"
            :status="getProgressStatus(achievement)"
          />
          <span class="progress-text">
            {{ achievement.progress || 0 }}/{{ achievement.target }}
          </span>
        </div>

        <!-- 内容 -->
        <div class="achievement-content">
          <h4 class="achievement-title">{{ achievement.title }}</h4>
          <p class="achievement-description">{{ achievement.description }}</p>
        </div>

        <!-- 类别标签 -->
        <div class="achievement-category">
          <span :class="['category-tag', `category-${achievement.category}`]">
            {{ getCategoryLabel(achievement.category) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty
      v-if="filteredAchievements.length === 0"
      description="没有找到符合条件的成就"
    />

    <!-- 成就详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      :title="selectedAchievement?.title"
      width="400px"
    >
      <div v-if="selectedAchievement" class="detail-content">
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
            {{ selectedAchievement.unlocked ? '✅ 已解锁' : '🔒 未解锁' }}
          </el-tag>
          <el-tag>
            {{ getCategoryLabel(selectedAchievement.category) }}
          </el-tag>
        </div>

        <div v-if="selectedAchievement.unlocked" class="detail-unlocked-info">
          <p>🎉 恭喜解锁此成就！</p>
        </div>
        <div v-else class="detail-locked-info">
          <p v-if="selectedAchievement.target">
            💪 继续加油，距离解锁还差 {{ selectedAchievement.target - (selectedAchievement.progress || 0) }}
          </p>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  achievements: {
    type: Array,
    required: true
  },
  unlockedCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['achievement-click'])

// 状态
const filterCategory = ref('all')
const filterStatus = ref('all')
const detailVisible = ref(false)
const selectedAchievement = ref(null)

// 计算属性
const progressPercent = computed(() => {
  if (props.totalCount === 0) return 0
  return Math.round((props.unlockedCount / props.totalCount) * 100)
})

const filteredAchievements = computed(() => {
  let result = props.achievements

  // 类别筛选
  if (filterCategory.value !== 'all') {
    result = result.filter(a => a.category === filterCategory.value)
  }

  // 状态筛选
  if (filterStatus.value === 'unlocked') {
    result = result.filter(a => a.unlocked)
  } else if (filterStatus.value === 'locked') {
    result = result.filter(a => !a.unlocked)
  }

  // 按解锁状态和进度排序
  return result.sort((a, b) => {
    // 已解锁的排在前面
    if (a.unlocked && !b.unlocked) return -1
    if (!a.unlocked && b.unlocked) return 1

    // 按进度排序（如果有）
    if (a.target && b.target) {
      const aProgress = (a.progress || 0) / a.target
      const bProgress = (b.progress || 0) / b.target
      return bProgress - aProgress
    }

    return 0
  })
})

// 方法
const formatPercent = (percentage) => `${percentage}%`

const formatDetailProgress = (percentage) => {
  const achievement = selectedAchievement.value
  if (!achievement) return `${percentage}%`
  return `${achievement.progress || 0}/${achievement.target}`
}

const getAchievementProgress = (achievement) => {
  if (!achievement.target || achievement.target === 0) return 0
  const progress = achievement.progress || 0
  return Math.min(100, Math.round((progress / achievement.target) * 100))
}

const getProgressStatus = (achievement) => {
  const progress = getAchievementProgress(achievement)
  if (progress >= 100) return 'success'
  if (progress >= 50) return 'warning'
  return undefined
}

const getCategoryLabel = (category) => {
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

const handleAchievementClick = (achievement) => {
  selectedAchievement.value = achievement
  detailVisible.value = true
  emit('achievement-click', achievement)
}
</script>

<style scoped>
.achievement-list-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* 头部统计 */
.achievement-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.header-stats {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-item .stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #67c23a;
}

.stat-item.total .stat-value {
  font-size: 20px;
  color: #909399;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.header-progress {
  flex: 1;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

/* 成就网格 */
.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

/* 成就项 */
.achievement-item {
  position: relative;
  background: #fafafa;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.achievement-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.achievement-unlocked {
  background: linear-gradient(135deg, #f0f9eb 0%, #e8f5e9 100%);
  border-color: #67c23a;
}

.achievement-locked {
  opacity: 0.7;
}

/* 解锁标记 */
.unlocked-mark {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: #67c23a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

/* 图标 */
.achievement-icon {
  font-size: 40px;
  text-align: center;
  margin-bottom: 12px;
}

.achievement-unlocked .achievement-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

/* 进度 */
.achievement-progress {
  margin-bottom: 12px;
}

.progress-text {
  display: block;
  text-align: center;
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
}

/* 内容 */
.achievement-content {
  text-align: center;
}

.achievement-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.achievement-description {
  margin: 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

/* 类别标签 */
.achievement-category {
  margin-top: 12px;
  text-align: center;
}

.category-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.category-progress {
  background: #ecf5ff;
  color: #409eff;
}

.category-dedication {
  background: #fdf6ec;
  color: #e6a23c;
}

.category-challenge {
  background: #fef0f0;
  color: #f56c6c;
}

.category-master {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.category-exploration {
  background: #f0f9eb;
  color: #67c23a;
}

.category-speed {
  background: #f4f4f5;
  color: #909399;
}

/* 详情弹窗 */
.detail-content {
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

.detail-unlocked-info {
  background: linear-gradient(135deg, #f0f9eb 0%, #e8f5e9 100%);
  padding: 12px;
  border-radius: 8px;
}

.detail-unlocked-info p {
  margin: 0;
  color: #67c23a;
  font-weight: 600;
}

.detail-locked-info {
  background: #fdf6ec;
  padding: 12px;
  border-radius: 8px;
}

.detail-locked-info p {
  margin: 0;
  color: #e6a23c;
}
</style>
