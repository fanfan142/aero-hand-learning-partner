<template>
  <el-dialog
    v-model="visible"
    :title="taskTitle"
    width="600px"
    :close-on-click-modal="false"
    class="task-detail-modal"
    @close="handleClose"
  >
    <template #header>
      <div class="modal-header">
        <div class="header-icon">{{ taskIcon }}</div>
        <div class="header-content">
          <h3 class="header-title">{{ task?.title }}</h3>
          <div class="header-meta">
            <el-tag
              v-if="task?.difficulty"
              :type="getDifficultyType(task.difficulty)"
              size="small"
              effect="dark"
            >
              {{ task.difficulty }}
            </el-tag>
            <el-tag v-if="task?.estimatedTime" type="info" size="small">
              ⏱️ {{ task.estimatedTime }}
            </el-tag>
            <el-tag v-if="task?.stageTitle" type="primary" size="small">
              {{ task.stageTitle }}
            </el-tag>
          </div>
        </div>
      </div>
    </template>

    <div class="modal-body">
      <!-- 任务描述 -->
      <div v-if="task?.description" class="section description-section">
        <h4 class="section-title">
          <span class="section-icon">📝</span>
          任务说明
        </h4>
        <p class="description-text">{{ task.description }}</p>
      </div>

      <!-- 阻塞原因 -->
      <el-alert
        v-if="task?.blocked"
        type="warning"
        :closable="false"
        show-icon
        class="blocked-alert"
      >
        <template #title>
          <span>🔒 此任务被阻塞：{{ task.reason }}</span>
        </template>
      </el-alert>

      <!-- 操作步骤 -->
      <div v-if="task?.steps?.length" class="section steps-section">
        <h4 class="section-title">
          <span class="section-icon">📌</span>
          操作步骤
        </h4>
        <el-steps direction="vertical" :active="completedSteps" finish-status="success">
          <el-step
            v-for="(step, index) in task.steps"
            :key="index"
            :title="step"
            :status="isStepCompleted(index) ? 'success' : 'wait'"
          />
        </el-steps>
      </div>

      <!-- 命令代码 -->
      <div v-if="task?.commands?.length" class="section commands-section">
        <h4 class="section-title">
          <span class="section-icon">💻</span>
          常用命令
        </h4>
        <div class="commands-list">
          <div v-for="(cmd, index) in task.commands" :key="index" class="command-item">
            <el-text class="command-text" tag="code">{{ cmd }}</el-text>
            <el-button
              size="small"
              type="primary"
              plain
              @click="copyCommand(cmd)"
            >
              📋 复制
            </el-button>
          </div>
        </div>
      </div>

      <!-- 预期效果 -->
      <div v-if="task?.expected" class="section expected-section">
        <h4 class="section-title">
          <span class="section-icon">✨</span>
          预期效果
        </h4>
        <el-alert type="success" :closable="false" show-icon>
          {{ task.expected }}
        </el-alert>
      </div>

      <!-- 提示 -->
      <div v-if="task?.tips?.length" class="section tips-section">
        <h4 class="section-title">
          <span class="section-icon">💡</span>
          实用提示
        </h4>
        <el-alert type="warning" :closable="false" show-icon>
          <template #default>
            <ul class="tips-list">
              <li v-for="(tip, index) in task.tips" :key="index">{{ tip }}</li>
            </ul>
          </template>
        </el-alert>
      </div>

      <!-- 推荐资源 -->
      <div v-if="recommendedResources.length" class="section resources-section">
        <h4 class="section-title">
          <span class="section-icon">📚</span>
          推荐资源
        </h4>
        <div class="resources-list">
          <div
            v-for="resource in recommendedResources"
            :key="resource.url"
            class="resource-item"
            @click="openResource(resource)"
          >
            <span class="resource-icon">{{ getResourceIcon(resource.type) }}</span>
            <div class="resource-info">
              <div class="resource-title">{{ resource.title }}</div>
              <div class="resource-type">{{ getResourceTypeName(resource.type) }}</div>
            </div>
            <el-tag size="small" :type="getResourceTagType(resource.type)">
              {{ resource.type === 'video' ? '视频' : resource.type === 'doc' ? '文档' : '链接' }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 难度评分 -->
      <div v-if="task?.difficultyScore" class="section difficulty-section">
        <h4 class="section-title">
          <span class="section-icon">📊</span>
          难度评分
        </h4>
        <div class="difficulty-display">
          <el-rate
            v-model="task.difficultyScore"
            disabled
            :max="5"
            :allow-half="true"
          />
          <span class="difficulty-text">{{ task.difficultyScore }} / 5</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <div class="footer-left">
          <el-tag v-if="isCompleted" type="success" effect="dark" size="large">
            ✅ 已完成
          </el-tag>
          <el-tag v-else-if="task?.blocked" type="warning" effect="dark" size="large">
            🔒 被阻塞
          </el-tag>
          <el-tag v-else type="info" size="large">
            ⏳ 待完成
          </el-tag>
        </div>
        <div class="footer-right">
          <el-button @click="handleClose">关闭</el-button>
          <el-button
            v-if="!isCompleted && !task?.blocked"
            type="primary"
            @click="handleComplete"
          >
            标记完成
          </el-button>
          <el-button
            v-if="isCompleted"
            type="warning"
            plain
            @click="handleUncomplete"
          >
            取消完成
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  task: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'complete', 'uncomplete'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const taskTitle = computed(() => props.task?.title || '任务详情')

const taskIcon = computed(() => {
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
  return icons[props.task?.stageId] || '📋'
})

const isCompleted = computed(() => props.task?.completed || false)

const completedSteps = computed(() => {
  if (!props.task?.steps) return 0
  return isCompleted.value ? props.task.steps.length : 0
})

const recommendedResources = computed(() => {
  return props.task?.resources || []
})

// 方法
const isStepCompleted = (index) => {
  return isCompleted.value
}

const getDifficultyType = (difficulty) => {
  const types = {
    '入门': 'success',
    '基础': 'info',
    '进阶': 'warning',
    '高级': 'danger'
  }
  return types[difficulty] || 'info'
}

const getResourceIcon = (type) => {
  const icons = {
    'video': '📺',
    'doc': '📄',
    'official': '🌐',
    'course': '🎓',
    'paper': '📑'
  }
  return icons[type] || '🔗'
}

const getResourceTypeName = (type) => {
  const names = {
    'video': '视频教程',
    'doc': '技术文档',
    'official': '官方文档',
    'course': '在线课程',
    'paper': '学术论文'
  }
  return names[type] || '外部链接'
}

const getResourceTagType = (type) => {
  const types = {
    'video': 'danger',
    'doc': 'primary',
    'official': 'success',
    'course': 'warning',
    'paper': 'info'
  }
  return types[type] || 'info'
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

const handleClose = () => {
  visible.value = false
}

const handleComplete = () => {
  emit('complete', props.task?.id)
  ElMessage.success('🎉 任务完成！继续保持！')
}

const handleUncomplete = () => {
  emit('uncomplete', props.task?.id)
  ElMessage.info('任务已取消完成')
}

// 监听任务变化
watch(() => props.task, (newTask) => {
  if (newTask) {
    // 可以在这里添加额外的处理逻辑
  }
})
</script>

<style scoped>
/* Modal Header */
.modal-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
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

.header-icon {
  font-size: 32px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.header-icon:hover {
  transform: scale(1.1) rotate(5deg);
}

.header-content {
  flex: 1;
}

.header-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Modal Body */
.modal-body {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 4px;
}

/* Sections */
.section {
  margin-bottom: 20px;
  animation: fadeInUp 0.4s ease-out;
  animation-fill-mode: both;
}

.section:nth-child(1) { animation-delay: 0.05s; }
.section:nth-child(2) { animation-delay: 0.1s; }
.section:nth-child(3) { animation-delay: 0.15s; }
.section:nth-child(4) { animation-delay: 0.2s; }
.section:nth-child(5) { animation-delay: 0.25s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-icon {
  font-size: 16px;
}

/* Description */
.description-text {
  margin: 0;
  color: #606266;
  line-height: 1.8;
}

/* Blocked Alert */
.blocked-alert {
  margin-bottom: 20px;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}

/* Steps */
.steps-section :deep(.el-steps) {
  padding-left: 8px;
}

/* Commands */
.commands-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.command-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #e6f3ff 0%, #f0f9ff 100%);
  border: 1px solid #b3d9ff;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.command-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.command-text {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: #1a1a1a;
  background: transparent;
}

/* Expected */
.expected-section :deep(.el-alert) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.expected-section :deep(.el-alert:hover) {
  transform: scale(1.01);
}

/* Tips */
.tips-list {
  margin: 0;
  padding-left: 20px;
}

.tips-list li {
  margin: 4px 0;
}

/* Resources */
.resources-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.resource-item:hover {
  background: #f0f1f2;
  transform: translateX(6px);
  border-color: rgba(64, 158, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.resource-icon {
  font-size: 24px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.resource-item:hover .resource-icon {
  transform: scale(1.15) rotate(5deg);
}

.resource-info {
  flex: 1;
  min-width: 0;
}

.resource-title {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  margin-bottom: 2px;
}

.resource-type {
  font-size: 12px;
  color: #909399;
}

/* Difficulty */
.difficulty-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.difficulty-text {
  font-size: 14px;
  color: #606266;
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-right {
  display: flex;
  gap: 8px;
}
</style>

<style>
/* 全局样式覆盖 */
.task-detail-modal .el-dialog__header {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.task-detail-modal .el-dialog__body {
  padding: 20px;
}

.task-detail-modal .el-dialog__footer {
  padding: 16px 20px;
  border-top: 1px solid #ebeef5;
}
</style>
