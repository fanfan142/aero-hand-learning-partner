<template>
  <div
    :class="[
      'achievement-card',
      { 'achievement-unlocked': achievement.unlocked },
      { 'achievement-locked': !achievement.unlocked },
      { 'achievement-new': isNew }
    ]"
    @click="handleClick"
  >
    <!-- 解锁状态 -->
    <div v-if="achievement.unlocked" class="unlocked-badge">
      <span class="check-icon">✓</span>
    </div>

    <!-- 图标 -->
    <div class="achievement-icon">
      {{ achievement.icon }}
    </div>

    <!-- 进度条（如果有） -->
    <div v-if="showProgress && achievement.target" class="progress-bar-container">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: progressPercent + '%' }"
          :class="progressClass"
        ></div>
      </div>
      <span class="progress-text">{{ achievement.progress }}/{{ achievement.target }}</span>
    </div>

    <!-- 内容 -->
    <div class="achievement-content">
      <h4 class="achievement-title">{{ achievement.title }}</h4>
      <p class="achievement-description">{{ achievement.description }}</p>
    </div>

    <!-- 类别标签 -->
    <div class="achievement-category">
      <span :class="['category-tag', `category-${achievement.category}`]">
        {{ categoryLabel }}
      </span>
    </div>

    <!-- 锁定遮罩 -->
    <div v-if="!achievement.unlocked" class="locked-overlay">
      <span class="lock-icon">🔒</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'

const props = defineProps({
  achievement: {
    type: Object,
    required: true
  },
  showProgress: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click'])

const isNew = ref(false)

onMounted(() => {
  // 检查是否是新解锁的成就（24小时内解锁）
  if (props.achievement.unlocked && props.achievement.unlockedAt) {
    const unlockedTime = new Date(props.achievement.unlockedAt).getTime()
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000
    isNew.value = now - unlockedTime < oneDay
  }
})

const progressPercent = computed(() => {
  if (!props.achievement.target || props.achievement.target === 0) return 0
  const progress = props.achievement.progress || 0
  return Math.min(100, Math.round((progress / props.achievement.target) * 100))
})

const progressClass = computed(() => {
  const percent = progressPercent.value
  if (percent >= 100) return 'progress-complete'
  if (percent >= 50) return 'progress-medium'
  return 'progress-low'
})

const categoryLabel = computed(() => {
  const labels = {
    progress: '进度',
    dedication: '坚持',
    challenge: '挑战',
    exploration: '探索',
    speed: '速度',
    master: '大师',
    community: '社区'
  }
  return labels[props.achievement.category] || '成就'
})

const handleClick = () => {
  emit('click', props.achievement)
}
</script>

<style scoped>
.achievement-card {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  border: 2px solid transparent;
}

.achievement-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 解锁状态 */
.achievement-unlocked {
  border-color: #67c23a;
  background: linear-gradient(135deg, #f0f9ff 0%, #e8f5e9 100%);
}

.achievement-unlocked:hover {
  border-color: #85ce61;
}

.achievement-locked {
  opacity: 0.7;
}

/* 新解锁动画 */
.achievement-new {
  animation: newAchievement 0.5s ease-out;
}

@keyframes newAchievement {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 解锁徽章 */
.unlocked-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 28px;
  height: 28px;
  background: #67c23a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.4);
}

/* 图标 */
.achievement-icon {
  font-size: 48px;
  margin-bottom: 12px;
  text-align: center;
}

.achievement-unlocked .achievement-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

/* 进度条 */
.progress-bar-container {
  margin-bottom: 12px;
}

.progress-bar {
  height: 6px;
  background: #e4e7ed;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-low {
  background: linear-gradient(90deg, #f56c6c 0%, #e6a23c 100%);
}

.progress-medium {
  background: linear-gradient(90deg, #e6a23c 0%, #67c23a 100%);
}

.progress-complete {
  background: linear-gradient(90deg, #67c23a 0%, #409eff 100%);
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

.category-exploration {
  background: #f0f9eb;
  color: #67c23a;
}

.category-speed {
  background: #f4f4f5;
  color: #909399;
}

.category-master {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.category-community {
  background: #f0f0f0;
  color: #606266;
}

/* 锁定遮罩 */
.locked-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
  opacity: 0.3;
}

.lock-icon {
  font-size: 16px;
}
</style>
