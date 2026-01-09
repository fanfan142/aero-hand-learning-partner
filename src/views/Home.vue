<template>
  <div class="home-page">
    <!-- 欢迎介绍 -->
    <div class="welcome-intro card mb-3">
      <div class="intro-header">
        <h1>🎓 欢迎使用 Aero Hand 智能学习伙伴</h1>
        <p class="intro-subtitle">系统学习肌腱驱动灵巧机械手项目</p>
      </div>

      <el-divider />

      <div class="intro-content">
        <div class="intro-section">
          <h3>📖 什么是 Aero Hand？</h3>
          <p>Aero Hand Open 是一个<strong>开源的肌腱驱动灵巧机械手项目</strong>，由 TetherIA 设计开发。与昂贵的专有解决方案不同，该项目专注于<strong>简单性</strong>、<strong>可靠性</strong>和<strong>可访问性</strong>，使用标准3D打印和现成的电子元件。</p>
        </div>

        <el-row :gutter="20" class="mt-4">
          <el-col :span="12">
            <div class="feature-box">
              <h4>🎯 这个网站能做什么？</h4>
              <ul class="feature-list">
                <li>✅ 追踪你的学习进度</li>
                <li>✅ 提供完整的技术知识库</li>
                <li>✅ 列出详细的硬件清单</li>
                <li>✅ 解读项目文件结构</li>
                <li>✅ AI助手随时答疑</li>
              </ul>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="feature-box">
              <h4>🛠️ 涵盖的技术栈</h4>
              <ul class="tech-list">
                <li>🔧 硬件：ESP32-S3、HLS3606M舵机、3D打印</li>
                <li>💻 固件：Arduino框架、串口协议</li>
                <li>🐍 SDK：Python控制接口</li>
                <li>🎮 仿真：MuJoCo物理引擎</li>
                <li>🤖 AI：PPO强化学习算法</li>
                <li>🔄 Sim2Real：从仿真到实物</li>
              </ul>
            </div>
          </el-col>
        </el-row>

        <el-alert
          type="info"
          :closable="false"
          class="mt-4 storage-notice"
        >
          <template #title>
            <div class="notice-content">
              <strong>💾 数据存储说明：</strong>
              <span>学习进度和AI配置保存在<strong>浏览器本地</strong>，每个设备独立存储。换设备或清除浏览器数据会丢失进度，请注意备份！</span>
            </div>
          </template>
        </el-alert>
      </div>
    </div>

    <!-- 进度概览 -->
    <div class="progress-overview card mb-3">
      <div class="overview-header">
        <h2>📍 我的学习之旅</h2>
        <div class="progress-info">
          <span class="current-stage">当前阶段：{{ currentStageData?.title }}</span>
          <el-progress
            :percentage="progressPercent"
            :color="progressColor"
            :stroke-width="20"
          />
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <el-row :gutter="20">
      <!-- 左侧：学习路线图 -->
      <el-col :span="10">
        <div class="learning-path-map card">
          <h3>🗺️ 学习路线</h3>
          <div class="path-container">
            <div
              v-for="(stage, index) in stages"
              :key="stage.id"
              :class="['path-stage', getStageClass(stage)]"
              @click="handleStageClick(stage)"
            >
              <div class="stage-icon">
                <el-icon v-if="stage.completed"><CircleCheck /></el-icon>
                <el-icon v-else-if="stage.current"><Location /></el-icon>
                <el-icon v-else><Clock /></el-icon>
              </div>
              <div class="stage-content">
                <div class="stage-title">{{ stage.title }}</div>
                <div class="stage-progress">
                  {{ getStageProgress(stage) }}
                </div>
              </div>
              <div v-if="index < stages.length - 1" class="stage-arrow">
                <el-icon><ArrowDown /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 右侧：当前阶段详情 -->
      <el-col :span="14">
        <div class="current-stage-detail card">
          <h3>{{ currentStageData?.title }}</h3>

          <!-- 任务列表 -->
          <div class="tasks-list">
            <div
              v-for="task in currentStageData?.tasks"
              :key="task.id"
              :class="['task-item', getTaskClass(task)]"
              @click="handleTaskClick(task)"
            >
              <div class="task-checkbox">
                <el-checkbox
                  :model-value="isTaskCompleted(task.id)"
                  @change="(val) => handleTaskCheck(task.id, val)"
                  :disabled="task.blocked"
                >
                  {{ task.title }}
                </el-checkbox>
              </div>
              <div class="task-meta">
                <el-tag v-if="task.completed" type="success" size="small">已完成</el-tag>
                <el-tag v-else-if="task.blocked" type="warning" size="small">
                  阻塞：{{ task.reason }}
                </el-tag>
                <el-tag v-else-if="task.current" type="primary" size="small">进行中</el-tag>
                <el-tag v-else type="info" size="small">待开始</el-tag>
              </div>
            </div>
          </div>

          <!-- 任务详情 -->
          <div v-if="selectedTask" class="task-detail mt-3">
            <el-divider>{{ selectedTask.title }}</el-divider>

            <!-- 描述 -->
            <div v-if="selectedTask.description" class="task-description">
              <p><strong>说明：</strong>{{ selectedTask.description }}</p>
            </div>

            <!-- 步骤 -->
            <div v-if="selectedTask.steps" class="task-steps mt-2">
              <p><strong>操作步骤：</strong></p>
              <el-steps direction="vertical" :active="selectedTask.completed ? 1 : 0">
                <el-step v-for="(step, i) in selectedTask.steps" :key="i" :title="step" />
              </el-steps>
            </div>

            <!-- 命令 -->
            <div v-if="selectedTask.commands" class="task-commands mt-2">
              <p><strong>命令：</strong></p>
              <div v-for="(cmd, i) in selectedTask.commands" :key="i" class="command-box">
                <el-text code>{{ cmd }}</el-text>
                <el-button
                  size="small"
                  @click="copyCommand(cmd)"
                  style="margin-left: 8px"
                >
                  复制
                </el-button>
              </div>
            </div>

            <!-- 预期效果 -->
            <div v-if="selectedTask.expected" class="task-expected mt-2">
              <p><strong>预期效果：</strong></p>
              <el-alert type="success" :closable="false">
                {{ selectedTask.expected }}
              </el-alert>
            </div>
          </div>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLearningStore } from '@/stores/learning'
import { ElMessage } from 'element-plus'

const learningStore = useLearningStore()

// 数据
const aiDrawerVisible = ref(false)
const selectedTask = ref(null)

// 计算属性
const stages = computed(() => learningStore.stages)
const currentStageData = computed(() => learningStore.currentStageData)
const progressPercent = computed(() => learningStore.progressPercent)

const progressColor = computed(() => {
  const pct = progressPercent.value
  if (pct < 30) return '#f56c6c'
  if (pct < 70) return '#e6a23c'
  return '#67c23a'
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

const isTaskCompleted = (taskId) => {
  return learningStore.completedTasks.has(taskId)
}

const handleStageClick = (stage) => {
  // ✅ 允许自由点击任何阶段
  // 已完成/当前/未来阶段都可以查看
  learningStore.goToStage(stage.id)
}

const handleTaskClick = (task) => {
  if (task.blocked) {
    ElMessage.warning(`任务被阻塞：${task.reason}`)
    return
  }
  selectedTask.value = task
}

const handleTaskCheck = (taskId, val) => {
  if (val) {
    learningStore.markTaskComplete(taskId)
    ElMessage.success('任务完成！')
  }
}

const copyCommand = (cmd) => {
  navigator.clipboard.writeText(cmd)
  ElMessage.success('命令已复制到剪贴板')
}
</script>

<style scoped>
.home-page {
  max-width: 1600px;
  margin: 0 auto;
}

.welcome-intro {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.intro-header {
  text-align: center;
  margin-bottom: 20px;
}

.intro-header h1 {
  margin: 0 0 10px 0;
  font-size: 32px;
  color: #303133;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.intro-subtitle {
  margin: 0;
  font-size: 16px;
  color: #909399;
}

.intro-content {
  margin-top: 20px;
}

.intro-section h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: #303133;
}

.intro-section p {
  margin: 0;
  font-size: 15px;
  line-height: 1.8;
  color: #606266;
}

.feature-box {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  height: 100%;
}

.feature-box h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #303133;
}

.feature-list, .tech-list {
  margin: 0;
  padding-left: 20px;
}

.feature-list li, .tech-list li {
  margin-bottom: 8px;
  line-height: 1.6;
  color: #606266;
}

.storage-notice {
  border-radius: 8px;
}

.notice-content {
  line-height: 1.6;
}

.notice-content strong {
  color: #409eff;
}

.mt-4 {
  margin-top: 16px;
}

.progress-overview {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.overview-header h2 {
  margin: 0 0 15px 0;
  font-size: 24px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.current-stage {
  font-size: 16px;
  font-weight: 500;
}

.learning-path-map h3,
.current-stage-detail h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.path-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.path-stage {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.path-stage:hover {
  background: #f5f7fa;
}

.stage-completed {
  opacity: 0.7;
}

.stage-current {
  background: #ecf5ff;
  border: 2px solid #409eff;
}

.stage-icon {
  font-size: 24px;
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
}

.stage-progress {
  font-size: 12px;
  color: #666;
}

.stage-arrow {
  color: #ccc;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.3s;
}

.task-item:hover {
  border-color: #409eff;
  background: #f5f7fa;
}

.task-completed {
  background: #f0f9ff;
  border-color: #67c23a;
}

.task-current {
  background: #ecf5ff;
  border-color: #409eff;
}

.task-blocked {
  background: #fdf6ec;
  border-color: #e6a23c;
  cursor: not-allowed;
}

.task-detail {
  padding: 20px;
  background: #f9fafc;
  border-radius: 8px;
}

.command-box {
  display: flex;
  align-items: center;
  margin: 8px 0;
  padding: 8px;
  background: #1e1e1e;
  border-radius: 4px;
}
</style>
