<template>
  <div class="learning-path-container">
    <!-- 路径头部 -->
    <div class="path-header">
      <h3 class="path-title">
        <span class="title-icon">🗺️</span>
        学习路径
      </h3>
      <div class="path-stats">
        <span class="stat-item">
          <span class="stat-value">{{ completedStages }}/{{ totalStages }}</span>
          <span class="stat-label">阶段完成</span>
        </span>
        <span class="stat-divider">|</span>
        <span class="stat-item">
          <span class="stat-value">{{ totalHours }}</span>
          <span class="stat-label">预估学时</span>
        </span>
      </div>
    </div>

    <!-- 路径线 -->
    <div class="path-line">
      <div
        class="path-line-progress"
        :style="{ height: lineProgressHeight }"
      ></div>
    </div>

    <!-- 阶段列表 -->
    <div class="path-stages">
      <div
        v-for="(stage, index) in stages"
        :key="stage.id"
        :class="['stage-item', getStageClass(stage, index)]"
        @click="handleStageClick(stage)"
      >
        <!-- 阶段节点 -->
        <div class="stage-node">
          <div class="node-circle">
            <span v-if="stage.completed" class="node-icon">✓</span>
            <span v-else-if="stage.current" class="node-icon">▶</span>
            <span v-else class="node-number">{{ index + 1 }}</span>
          </div>
          <div
            class="node-connector"
            v-if="index < stages.length - 1"
          ></div>
        </div>

        <!-- 阶段内容 -->
        <div class="stage-content">
          <div class="stage-header">
            <span class="stage-icon">{{ getStageIcon(stage) }}</span>
            <h4 class="stage-title">{{ stage.title }}</h4>
            <span
              v-if="stage.difficulty"
              class="difficulty-badge"
              :style="{ backgroundColor: getDifficultyColor(stage.difficulty) }"
            >
              {{ stage.difficulty }}
            </span>
          </div>

          <div class="stage-meta">
            <span class="meta-item">
              <span class="meta-icon">⏱️</span>
              {{ stage.estimatedTime || '未知' }}
            </span>
            <span class="meta-item">
              <span class="meta-icon">📋</span>
              {{ stage.tasks?.length || 0 }} 任务
            </span>
          </div>

          <!-- 阶段进度条 -->
          <div class="stage-progress">
            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{ width: getStageProgress(stage) + '%' }"
                :class="getProgressClass(stage)"
              ></div>
            </div>
            <span class="progress-label">{{ getStageProgress(stage) }}%</span>
          </div>

          <!-- 技能标签 -->
          <div class="skill-tags" v-if="stage.skills?.length">
            <span
              v-for="skill in stage.skills.slice(0, 3)"
              :key="skill"
              class="skill-tag"
            >
              {{ skill }}
            </span>
            <span v-if="stage.skills.length > 3" class="skill-more">
              +{{ stage.skills.length - 3 }}
            </span>
          </div>

          <!-- 状态标签 -->
          <div class="stage-status">
            <el-tag
              v-if="stage.completed"
              type="success"
              size="small"
              effect="dark"
            >
              ✅ 已完成
            </el-tag>
            <el-tag
              v-else-if="stage.current"
              type="primary"
              size="small"
              effect="dark"
            >
              🔄 进行中
            </el-tag>
            <el-tag
              v-else
              type="info"
              size="small"
            >
              ⏳ 待开始
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="path-legend">
      <div class="legend-item">
        <span class="legend-dot completed"></span>
        <span class="legend-text">已完成</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot current"></span>
        <span class="legend-text">进行中</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot pending"></span>
        <span class="legend-text">待开始</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stages: {
    type: Array,
    required: true
  },
  currentStageId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['stage-click'])

// 计算属性
const completedStages = computed(() =>
  props.stages.filter(s => s.completed).length
)

const totalStages = computed(() => props.stages.length)

const totalHours = computed(() => {
  return props.stages.reduce((sum, stage) => {
    const hours = parseFloat(stage.estimatedHours || 0)
    return sum + hours
  }, 0)
})

const lineProgressHeight = computed(() => {
  if (totalStages.value === 0) return '0%'
  const percent = (completedStages.value / totalStages.value) * 100
  return `${percent}%`
})

// 方法
const getStageClass = (stage, index) => {
  const classes = ['stage-item']
  if (stage.completed) classes.push('stage-completed')
  else if (stage.current) classes.push('stage-current')
  else classes.push('stage-pending')

  // 添加奇偶样式
  if (index % 2 === 0) classes.push('stage-even')
  else classes.push('stage-odd')

  return classes.join(' ')
}

const getStageIcon = (stage) => {
  const icons = {
    'hardware': '🔧',
    'firmware': '💾',
    'servo-config': '⚙️',
    'sdk-usage': '📦',
    'mujoco': '🔬',
    'ros2': '🔗',
    'rl-training': '🤖',
    'sim2real': '🚀'
  }
  return icons[stage.id] || '📚'
}

const getStageProgress = (stage) => {
  if (!stage.tasks || stage.tasks.length === 0) return 0
  const completed = stage.tasks.filter(t => t.completed).length
  return Math.round((completed / stage.tasks.length) * 100)
}

const getProgressClass = (stage) => {
  const progress = getStageProgress(stage)
  if (progress >= 100) return 'progress-complete'
  if (progress >= 50) return 'progress-medium'
  return 'progress-low'
}

const getDifficultyColor = (difficulty) => {
  const colors = {
    '入门': '#67c23a',
    '基础': '#409eff',
    '进阶': '#e6a23c',
    '高级': '#f56c6c'
  }
  return colors[difficulty] || '#909399'
}

const handleStageClick = (stage) => {
  emit('stage-click', stage)
}
</script>

<style scoped>
.learning-path-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* 路径头部 */
.path-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.path-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 24px;
}

.path-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-divider {
  color: #dcdfe6;
  font-size: 20px;
}

/* 路径线 */
.path-line {
  position: absolute;
  left: 50px;
  top: 140px;
  bottom: 100px;
  width: 4px;
  background: #e4e7ed;
  border-radius: 2px;
}

.path-line-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(180deg, #67c23a 0%, #409eff 100%);
  border-radius: 2px;
  transition: height 0.5s ease;
}

/* 阶段列表 */
.path-stages {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-left: 30px;
}

.stage-item {
  position: relative;
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.stage-item:hover {
  background: #f5f7fa;
  transform: translateX(4px);
}

.stage-current {
  background: linear-gradient(135deg, #ecf5ff 0%, #f0f9ff 100%);
  border: 2px solid #409eff;
}

.stage-completed {
  background: linear-gradient(135deg, #f0f9eb 0%, #e8f5e9 100%);
  opacity: 0.85;
}

.stage-pending {
  opacity: 0.7;
}

/* 阶段节点 */
.stage-node {
  position: relative;
  flex-shrink: 0;
  z-index: 2;
}

.node-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  transition: all 0.3s ease;
}

.stage-current .node-circle {
  background: #409eff;
  color: white;
  box-shadow: 0 0 12px rgba(64, 158, 255, 0.5);
}

.stage-completed .node-circle {
  background: #67c23a;
  color: white;
}

.node-icon {
  font-size: 16px;
}

.node-number {
  font-size: 14px;
}

.node-connector {
  position: absolute;
  top: 36px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 48px;
  background: #e4e7ed;
}

.stage-completed .node-connector {
  background: #67c23a;
}

/* 阶段内容 */
.stage-content {
  flex: 1;
  min-width: 0;
}

.stage-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.stage-icon {
  font-size: 20px;
}

.stage-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.difficulty-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  color: white;
}

/* 阶段元信息 */
.stage-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.meta-icon {
  font-size: 12px;
}

/* 进度条 */
.stage-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.progress-track {
  flex: 1;
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
  background: #f56c6c;
}

.progress-medium {
  background: #e6a23c;
}

.progress-complete {
  background: #67c23a;
}

.progress-label {
  font-size: 11px;
  color: #909399;
  min-width: 32px;
  text-align: right;
}

/* 技能标签 */
.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.skill-tag {
  padding: 2px 6px;
  background: #f4f4f5;
  border-radius: 4px;
  font-size: 10px;
  color: #606266;
}

.skill-more {
  padding: 2px 6px;
  background: #ecf5ff;
  border-radius: 4px;
  font-size: 10px;
  color: #409eff;
}

/* 状态标签 */
.stage-status {
  margin-top: 8px;
}

/* 图例 */
.path-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
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
}

.legend-dot.completed {
  background: #67c23a;
}

.legend-dot.current {
  background: #409eff;
}

.legend-dot.pending {
  background: #e4e7ed;
}

.legend-text {
  font-size: 12px;
  color: #606266;
}
</style>
