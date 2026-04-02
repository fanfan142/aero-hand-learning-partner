<template>
  <el-dialog
    v-model="dialogVisible"
    :show-close="false"
    :close-on-click-modal="false"
    width="680px"
    class="tutorial-guide-dialog"
    @keydown="handleKeydown"
    destroy-on-close
  >
    <!-- 头部：Logo 和标题 -->
    <template #header>
      <div class="tutorial-header">
        <div class="tutorial-logo">
          <el-icon :size="48"><MagicStick /></el-icon>
        </div>
        <h2 class="tutorial-title">欢迎使用 Aero Hand 智能学习伙伴</h2>
        <p class="tutorial-subtitle">让学习变得简单而有趣</p>
      </div>
    </template>

    <!-- 步骤指示器 -->
    <div class="steps-indicator">
      <div
        v-for="(step, index) in tutorialSteps"
        :key="index"
        :class="['step-dot', {
          active: currentStep === index,
          completed: currentStep > index
        }]"
        @click="goToStep(index)"
      >
        <el-icon v-if="currentStep > index"><Check /></el-icon>
        <span v-else>{{ index + 1 }}</span>
      </div>
      <div class="step-line">
        <div
          class="step-line-progress"
          :style="{ width: `${(currentStep / (tutorialSteps.length - 1)) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- 步骤内容 -->
    <div class="tutorial-content">
      <transition name="slide-fade" mode="out-in">
        <div :key="currentStep" class="step-content">
          <!-- 步骤 0：欢迎页面介绍 -->
          <div v-if="currentStep === 0" class="step-panel">
            <div class="step-icon-wrapper welcome">
              <el-icon :size="64"><House /></el-icon>
            </div>
            <h3 class="step-title">{{ tutorialSteps[0].title }}</h3>
            <p class="step-description">{{ tutorialSteps[0].description }}</p>
            <div class="feature-cards">
              <div class="feature-card">
                <el-icon><Reading /></el-icon>
                <span>交互式学习</span>
              </div>
              <div class="feature-card">
                <el-icon><Odometer /></el-icon>
                <span>进度追踪</span>
              </div>
              <div class="feature-card">
                <el-icon><ChatDotRound /></el-icon>
                <span>AI 助手</span>
              </div>
              <div class="feature-card">
                <el-icon><Box /></el-icon>
                <span>硬件指南</span>
              </div>
            </div>
          </div>

          <!-- 步骤 1：导航功能说明 -->
          <div v-else-if="currentStep === 1" class="step-panel">
            <div class="step-icon-wrapper navigation">
              <el-icon :size="64"><Guide /></el-icon>
            </div>
            <h3 class="step-title">{{ tutorialSteps[1].title }}</h3>
            <p class="step-description">{{ tutorialSteps[1].description }}</p>
            <div class="nav-preview">
              <div class="nav-item-preview">
                <el-icon><House /></el-icon>
                <span>首页</span>
              </div>
              <div class="nav-item-preview">
                <el-icon><Odometer /></el-icon>
                <span>学习进度</span>
              </div>
              <div class="nav-item-preview">
                <el-icon><Reading /></el-icon>
                <span>知识库</span>
              </div>
              <div class="nav-item-preview">
                <el-icon><Box /></el-icon>
                <span>硬件清单</span>
              </div>
              <div class="nav-item-preview">
                <el-icon><Document /></el-icon>
                <span>官方文档</span>
              </div>
            </div>
            <div class="tip-box">
              <el-icon><InfoFilled /></el-icon>
              <span>顶部导航栏提供快速访问所有功能入口</span>
            </div>
          </div>

          <!-- 步骤 2：学习进度页面说明 -->
          <div v-else-if="currentStep === 2" class="step-panel">
            <div class="step-icon-wrapper learning">
              <el-icon :size="64"><TrendCharts /></el-icon>
            </div>
            <h3 class="step-title">{{ tutorialSteps[2].title }}</h3>
            <p class="step-description">{{ tutorialSteps[2].description }}</p>
            <div class="learning-features">
              <div class="learning-feature">
                <div class="feature-badge">8</div>
                <div class="feature-info">
                  <strong>学习阶段</strong>
                  <span>从入门到精通</span>
                </div>
              </div>
              <div class="learning-feature">
                <div class="feature-badge">50+</div>
                <div class="feature-info">
                  <strong>学习任务</strong>
                  <span>循序渐进的实践</span>
                </div>
              </div>
              <div class="learning-feature">
                <div class="feature-badge">3</div>
                <div class="feature-info">
                  <strong>成就徽章</strong>
                  <span>激励持续学习</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤 3：知识库使用说明 -->
          <div v-else-if="currentStep === 3" class="step-panel">
            <div class="step-icon-wrapper knowledge">
              <el-icon :size="64"><Notebook /></el-icon>
            </div>
            <h3 class="step-title">{{ tutorialSteps[3].title }}</h3>
            <p class="step-description">{{ tutorialSteps[3].description }}</p>
            <div class="knowledge-categories">
              <div class="category-item">
                <el-icon><Cpu /></el-icon>
                <span>固件开发</span>
              </div>
              <div class="category-item">
                <el-icon><Setting /></el-icon>
                <span>舵机控制</span>
              </div>
              <div class="category-item">
                <el-icon><Connection /></el-icon>
                <span>通信协议</span>
              </div>
              <div class="category-item">
                <el-icon><Promotion /></el-icon>
                <span>强化学习</span>
              </div>
              <div class="category-item">
                <el-icon><Grid /></el-icon>
                <span>仿真环境</span>
              </div>
              <div class="category-item">
                <el-icon><Box /></el-icon>
                <span>硬件结构</span>
              </div>
            </div>
          </div>

          <!-- 步骤 4：硬件清单说明 -->
          <div v-else-if="currentStep === 4" class="step-panel">
            <div class="step-icon-wrapper hardware">
              <el-icon :size="64"><Box /></el-icon>
            </div>
            <h3 class="step-title">{{ tutorialSteps[4].title }}</h3>
            <p class="step-description">{{ tutorialSteps[4].description }}</p>
            <div class="hardware-list">
              <div class="hardware-item">
                <el-icon><Cpu /></el-icon>
                <div class="hardware-info">
                  <strong>ESP32-S3</strong>
                  <span>主控制器</span>
                </div>
              </div>
              <div class="hardware-item">
                <el-icon><Setting /></el-icon>
                <div class="hardware-info">
                  <strong>HLS3606M</strong>
                  <span>智能舵机 x 11</span>
                </div>
              </div>
              <div class="hardware-item">
                <el-icon><Connection /></el-icon>
                <div class="hardware-info">
                  <strong>连接线缆</strong>
                  <span>舵机延长线</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤 5：恭喜完成 -->
          <div v-else-if="currentStep === 5" class="step-panel">
            <div class="step-icon-wrapper complete">
              <el-icon :size="64"><CircleCheck /></el-icon>
            </div>
            <h3 class="step-title">{{ tutorialSteps[5].title }}</h3>
            <p class="step-description">{{ tutorialSteps[5].description }}</p>
            <div class="complete-actions">
              <el-button type="primary" size="large" @click="startLearning">
                <el-icon><Promotion /></el-icon>
                开始学习
              </el-button>
              <el-button size="large" @click="openSettings">
                <el-icon><Setting /></el-icon>
                引导设置
              </el-button>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="tutorial-footer">
        <div class="footer-left">
          <el-button v-if="currentStep > 0" text @click="skipTutorial">
            跳过教程
          </el-button>
        </div>
        <div class="footer-right">
          <el-button v-if="currentStep > 0" @click="prevStep">
            <el-icon><ArrowLeft /></el-icon>
            上一步
          </el-button>
          <el-button v-if="currentStep < tutorialSteps.length - 1" type="primary" @click="nextStep">
            下一步
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button v-else type="primary" @click="finishTutorial">
            完成
            <el-icon><Check /></el-icon>
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import {
  MagicStick, House, Odometer, Reading, Box, Document, Guide, Check,
  ArrowLeft, ArrowRight, InfoFilled, TrendCharts, Notebook, Cpu,
  Setting, Connection, Promotion, Grid, CircleCheck, ChatDotRound
} from '@element-plus/icons-vue'

const emit = defineEmits(['complete', 'skip', 'restart'])

// 教程步骤
const tutorialSteps = [
  {
    title: '欢迎来到 Aero Hand 学习伙伴',
    description: '这是一个专为 Aero Hand 机械手设计的交互式学习平台，帮助你从零开始掌握硬件、固件和强化学习知识。'
  },
  {
    title: '探索导航功能',
    description: '使用顶部导航栏快速访问各个功能模块。每个选项都经过精心设计，让你轻松找到需要的内容。'
  },
  {
    title: '追踪学习进度',
    description: '学习进度页面展示你的学习轨迹、已完成的任务和获得的成就。系统化学习，效率更高。'
  },
  {
    title: '浏览知识库',
    description: '知识库整合了固件开发、舵机控制、通信协议、强化学习和硬件结构等全方位的技术文档。'
  },
  {
    title: '查看硬件清单',
    description: '在这里你可以找到完整的硬件清单，包括 ESP32-S3 控制器、HLS3606M 舵机和所有必需的连接部件。'
  },
  {
    title: '教程完成！',
    description: '恭喜你完成了新手指引！现在你可以开始探索 Aero Hand 的精彩世界了。'
  }
]

// 状态
const dialogVisible = ref(false)
const currentStep = ref(0)

// 计算属性
const isLastStep = computed(() => currentStep.value === tutorialSteps.length - 1)
const isFirstStep = computed(() => currentStep.value === 0)

// 方法
const open = () => {
  currentStep.value = 0
  dialogVisible.value = true
}

const close = () => {
  dialogVisible.value = false
}

const nextStep = () => {
  if (currentStep.value < tutorialSteps.length - 1) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const goToStep = (index) => {
  if (index >= 0 && index < tutorialSteps.length) {
    currentStep.value = index
  }
}

const finishTutorial = () => {
  // 标记教程已完成
  localStorage.setItem('aero_hand_tutorial_completed', 'true')
  localStorage.setItem('aero_hand_tutorial_completed_at', new Date().toISOString())
  dialogVisible.value = false
  emit('complete')
}

const skipTutorial = () => {
  localStorage.setItem('aero_hand_tutorial_completed', 'true')
  localStorage.setItem('aero_hand_tutorial_completed_at', new Date().toISOString())
  dialogVisible.value = false
  emit('skip')
}

const restartTutorial = () => {
  localStorage.removeItem('aero_hand_tutorial_completed')
  localStorage.removeItem('aero_hand_tutorial_completed_at')
  currentStep.value = 0
  dialogVisible.value = true
  emit('restart')
}

const startLearning = () => {
  finishTutorial()
}

const openSettings = () => {
  finishTutorial()
}

const handleKeydown = (e) => {
  if (e.key === 'ArrowRight' && !isLastStep.value) {
    nextStep()
  } else if (e.key === 'ArrowLeft' && !isFirstStep.value) {
    prevStep()
  } else if (e.key === 'Escape') {
    skipTutorial()
  }
}

// 监听对话框打开
watch(dialogVisible, (val) => {
  if (val) {
    currentStep.value = 0
    nextTick(() => {
      document.querySelector('.tutorial-guide-dialog')?.focus()
    })
  }
})

// 暴露方法给外部调用
defineExpose({
  open,
  close,
  restart: restartTutorial,
  isCompleted: () => localStorage.getItem('aero_hand_tutorial_completed') === 'true'
})
</script>

<style scoped>
/* 头部样式 */
.tutorial-header {
  text-align: center;
  padding: 20px 0 10px;
}

.tutorial-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.tutorial-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}

.tutorial-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary, #909399);
}

/* 步骤指示器 */
.steps-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 20px 40px;
  position: relative;
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  background: var(--bg-hover, #f5f7fa);
  color: var(--text-secondary, #909399);
  border: 2px solid var(--border-color, #ebeef5);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1;
}

.step-dot.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.step-dot.completed {
  background: #67c23a;
  color: white;
  border-color: #67c23a;
}

.step-dot:hover {
  transform: scale(1.1);
}

.step-line {
  position: absolute;
  left: 50px;
  right: 50px;
  height: 3px;
  background: var(--border-color, #ebeef5);
  border-radius: 2px;
}

.step-line-progress {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  transition: width 0.4s ease;
}

/* 步骤内容 */
.tutorial-content {
  min-height: 320px;
  padding: 10px 20px;
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.step-panel {
  text-align: center;
}

.step-icon-wrapper {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.step-icon-wrapper.welcome {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.step-icon-wrapper.navigation {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
}

.step-icon-wrapper.learning {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.step-icon-wrapper.knowledge {
  background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
}

.step-icon-wrapper.hardware {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
}

.step-icon-wrapper.complete {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.step-title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}

.step-description {
  margin: 0 0 24px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-regular, #606266);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

/* 特性卡片 */
.feature-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  max-width: 480px;
  margin: 0 auto;
}

.feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: var(--bg-hover, #f5f7fa);
  border-radius: 12px;
  font-size: 12px;
  color: var(--text-regular, #606266);
  transition: all 0.2s ease;
}

.feature-card .el-icon {
  font-size: 24px;
  color: var(--primary-color, #667eea);
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 导航预览 */
.nav-preview {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.nav-item-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: var(--bg-hover, #f5f7fa);
  border-radius: 10px;
  font-size: 11px;
  color: var(--text-regular, #606266);
  min-width: 70px;
}

.nav-item-preview .el-icon {
  font-size: 20px;
  color: var(--primary-color, #667eea);
}

.tip-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 8px;
  font-size: 13px;
  color: #409eff;
}

.tip-box .el-icon {
  flex-shrink: 0;
}

/* 学习特性 */
.learning-features {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.learning-feature {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--bg-hover, #f5f7fa);
  border-radius: 12px;
  text-align: left;
}

.feature-badge {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.feature-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.feature-info strong {
  font-size: 14px;
  color: var(--text-primary, #303133);
}

.feature-info span {
  font-size: 12px;
  color: var(--text-secondary, #909399);
}

/* 知识分类 */
.knowledge-categories {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  max-width: 400px;
  margin: 0 auto;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: var(--bg-hover, #f5f7fa);
  border-radius: 10px;
  font-size: 13px;
  color: var(--text-regular, #606266);
  transition: all 0.2s ease;
}

.category-item .el-icon {
  font-size: 18px;
  color: var(--primary-color, #667eea);
}

.category-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 硬件列表 */
.hardware-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 360px;
  margin: 0 auto;
}

.hardware-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: var(--bg-hover, #f5f7fa);
  border-radius: 12px;
  text-align: left;
}

.hardware-item .el-icon {
  font-size: 24px;
  color: var(--primary-color, #667eea);
}

.hardware-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hardware-info strong {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #303133);
}

.hardware-info span {
  font-size: 12px;
  color: var(--text-secondary, #909399);
}

/* 完成操作 */
.complete-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.complete-actions .el-button {
  padding: 14px 28px;
  font-size: 15px;
  border-radius: 10px;
}

.complete-actions .el-button .el-icon {
  margin-right: 6px;
}

/* 底部按钮 */
.tutorial-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left,
.footer-right {
  display: flex;
  gap: 8px;
}

.footer-right .el-button .el-icon {
  margin: 0 2px;
}

/* 过渡动画 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 对话框样式 */
:deep(.tutorial-guide-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.tutorial-guide-dialog .el-dialog__header) {
  padding: 0;
  margin: 0;
}

:deep(.tutorial-guide-dialog .el-dialog__body) {
  padding: 0 24px 20px;
}

:deep(.tutorial-guide-dialog .el-dialog__footer) {
  padding: 16px 24px 20px;
  border-top: 1px solid var(--border-color, #ebeef5);
}
</style>
