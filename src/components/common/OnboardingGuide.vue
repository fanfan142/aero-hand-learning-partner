<template>
  <!-- 引导蒙版层 -->
  <teleport to="body">
    <transition name="fade">
      <div v-if="visible && currentStep < steps.length" class="onboarding-overlay">
        <!-- 遮罩层 -->
        <div class="mask-layer" :style="maskStyle"></div>

        <!-- 高亮区域 -->
        <div
          v-if="currentTarget"
          class="highlight-area"
          :style="highlightStyle"
          @click="handleStepClick"
        >
          <!-- 箭头指示器 -->
          <div
            v-if="currentStep < steps.length - 1"
            class="arrow-indicator"
            :class="arrowPosition"
            :style="arrowStyle"
          >
            <el-icon><ArrowRight v-if="arrowPosition === 'right'" /><ArrowLeft v-else-if="arrowPosition === 'left'" /><ArrowUp v-else-if="arrowPosition === 'top'" /><ArrowDown v-else /></el-icon>
          </div>
        </div>

        <!-- 引导卡片 -->
        <div
          v-if="currentStep < steps.length"
          class="guide-card"
          :class="cardPosition"
          :style="cardStyle"
        >
          <div class="guide-card-header">
            <div class="step-badge">步骤 {{ currentStep + 1 }}/{{ steps.length }}</div>
            <el-button
              text
              class="close-btn"
              @click="handleClose"
              :icon="Close"
            />
          </div>

          <div class="guide-card-content">
            <div class="guide-icon" :class="steps[currentStep].theme">
              <el-icon :size="28"><component :is="steps[currentStep].icon" /></el-icon>
            </div>
            <h4 class="guide-title">{{ steps[currentStep].title }}</h4>
            <p class="guide-description">{{ steps[currentStep].description }}</p>

            <!-- 额外提示 -->
            <div v-if="steps[currentStep].tip" class="guide-tip">
              <el-icon><InfoFilled /></el-icon>
              <span>{{ steps[currentStep].tip }}</span>
            </div>
          </div>

          <div class="guide-card-footer">
            <!-- 步骤点 -->
            <div class="step-dots">
              <span
                v-for="(_, index) in steps"
                :key="index"
                :class="['dot', { active: index === currentStep, completed: index < currentStep }]"
              ></span>
            </div>

            <!-- 按钮 -->
            <div class="guide-buttons">
              <el-button
                v-if="currentStep > 0"
                text
                size="small"
                @click="prevStep"
              >
                上一步
              </el-button>
              <el-button
                v-if="currentStep < steps.length - 1"
                type="primary"
                size="small"
                @click="nextStep"
              >
                下一步
              </el-button>
              <el-button
                v-else
                type="primary"
                size="small"
                @click="finishGuide"
              >
                完成
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  House, Odometer, Reading, Box, Document, Files, Share, Notebook,
  Operation, Connection, MagicStick, ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  InfoFilled, Close, Check, Promotion
} from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'update:visible', 'complete', 'stepChange'])

// 引导步骤配置
const steps = [
  {
    id: 'welcome',
    title: '欢迎使用 Aero Hand 学习伙伴',
    description: '这是你的个人学习助手，帮助你快速掌握 Aero Hand 机械手的开发技能。',
    icon: MagicStick,
    theme: 'welcome',
    target: null,
    position: 'center',
    tip: '点击任意位置或按方向键继续'
  },
  {
    id: 'home',
    title: '首页概览',
    description: '首页展示系统概览、快速入口和最近活动。从这里可以快速了解整体学习状态。',
    icon: House,
    theme: 'home',
    target: '.app-header',
    position: 'bottom',
    offset: { x: 0, y: 10 }
  },
  {
    id: 'learning',
    title: '学习进度追踪',
    description: '追踪你的学习进度，完成阶段性任务，获得成就徽章。系统化学习更高效。',
    icon: Odometer,
    theme: 'learning',
    target: 'a[href="/learning"]',
    position: 'bottom',
    offset: { x: 0, y: 10 }
  },
  {
    id: 'knowledge',
    title: '知识库',
    description: '整合了固件开发、舵机控制、通信协议等全方位技术文档，随时查阅。',
    icon: Reading,
    theme: 'knowledge',
    target: 'a[href="/knowledge"]',
    position: 'bottom',
    offset: { x: 0, y: 10 }
  },
  {
    id: 'hardware',
    title: '硬件清单',
    description: '查看完整的硬件清单，包括元器件规格、采购链接和组装指南。',
    icon: Box,
    theme: 'hardware',
    target: 'a[href="/hardware"]',
    position: 'bottom',
    offset: { x: 0, y: 10 }
  },
  {
    id: 'docs',
    title: '官方文档',
    description: '访问官方技术文档，获取最权威的开发参考资料和 API 文档。',
    icon: Document,
    theme: 'docs',
    target: 'a[href="/docs"]',
    position: 'bottom',
    offset: { x: 0, y: 10 }
  },
  {
    id: 'ai-assistant',
    title: 'AI 学习助手',
    description: '遇到问题？随时使用 AI 助手获得帮助。它可以回答技术问题，解释概念。',
    icon: Promotion,
    theme: 'ai',
    target: '.ai-btn',
    position: 'left',
    offset: { x: -20, y: 0 }
  },
  {
    id: 'complete',
    title: '新手指引完成',
    description: '恭喜你完成了新手指引！现在你已经了解了主要功能，可以开始学习了。',
    icon: Check,
    theme: 'complete',
    target: null,
    position: 'center',
    tip: '之后可以在设置中重新打开引导'
  }
]

// 状态
const currentStep = ref(0)
const currentTarget = ref(null)
const targetRect = ref(null)
const scrollContainer = ref(null)

// 计算属性
const maskStyle = computed(() => {
  if (!targetRect.value) {
    return {
      mask: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 675\' preserveAspectRatio=\'none\'%3E%3Crect width=\'1200\' height=\'675\' fill=\'black\' fill-opacity=\'0.7\'/%3E%3C/svg%3E") 0 0 / cover no-repeat',
      WebkitMask: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 675\' preserveAspectRatio=\'none\'%3E%3Crect width=\'1200\' height=\'675\' fill=\'black\' fill-opacity=\'0.7\'/%3E%3C/svg%3E") 0 0 / cover no-repeat'
    }
  }

  const rect = targetRect.value
  const padding = 8
  const w = window.innerWidth
  const h = window.innerHeight

  // 创建带有透明圆孔的 SVG mask
  const x1 = Math.max(0, rect.left - padding)
  const y1 = Math.max(0, rect.top - padding)
  const x2 = Math.min(w, rect.right + padding)
  const y2 = Math.min(h, rect.bottom + padding)

  const maskSVG = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' preserveAspectRatio='none'>
      <rect width='${w}' height='${h}' fill='black' fill-opacity='0.7'/>
      <rect x='${x1}' y='${y1}' width='${x2 - x1}' height='${y2 - y1}' fill='white' fill-opacity='1' rx='8'/>
    </svg>
  `

  const maskImage = `url("data:image/svg+xml,${encodeURIComponent(maskSVG)}")`

  return {
    mask: `${maskImage} 0 0 / ${w}px ${h}px no-repeat`,
    WebkitMask: `${maskImage} 0 0 / ${w}px ${h}px no-repeat`
  }
})

const highlightStyle = computed(() => {
  if (!targetRect.value) return {}
  const rect = targetRect.value
  const padding = 8

  return {
    left: `${rect.left - padding}px`,
    top: `${rect.top - padding}px`,
    width: `${rect.width + padding * 2}px`,
    height: `${rect.height + padding * 2}px`
  }
})

const arrowPosition = computed(() => {
  if (!targetRect.value) return 'bottom'
  const rect = targetRect.value
  const cardHeight = 220
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  if (spaceBelow > cardHeight + 50) return 'top'
  if (spaceAbove > cardHeight + 50) return 'bottom'
  if (rect.left > window.innerWidth / 2) return 'left'
  return 'right'
})

const arrowStyle = computed(() => {
  if (!targetRect.value) return {}
  const rect = targetRect.value

  if (arrowPosition.value === 'top') {
    return {
      top: `${rect.bottom + 8}px`,
      left: `${rect.left + rect.width / 2}px`,
      transform: 'translateX(-50%)'
    }
  } else if (arrowPosition.value === 'bottom') {
    return {
      bottom: `${window.innerHeight - rect.top + 8}px`,
      left: `${rect.left + rect.width / 2}px`,
      transform: 'translateX(-50%) rotate(180deg)'
    }
  } else if (arrowPosition.value === 'left') {
    return {
      left: `${rect.right + 8}px`,
      top: `${rect.top + rect.height / 2}px`,
      transform: 'translateY(-50%) rotate(-90deg)'
    }
  } else {
    return {
      right: `${window.innerWidth - rect.left + 8}px`,
      top: `${rect.top + rect.height / 2}px`,
      transform: 'translateY(-50%) rotate(90deg)'
    }
  }
})

const cardPosition = computed(() => {
  if (!targetRect.value) return 'center'
  return steps[currentStep.value]?.position || 'bottom'
})

const cardStyle = computed(() => {
  if (!targetRect.value) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
  }

  const rect = targetRect.value
  const cardWidth = 340
  const cardHeight = 220
  const padding = 12

  const position = steps[currentStep.value]?.position || 'bottom'
  const offset = steps[currentStep.value]?.offset || { x: 0, y: 0 }

  let style = {}

  if (position === 'bottom') {
    const top = Math.min(rect.bottom + padding + offset.y, window.innerHeight - cardHeight - 20)
    style = {
      top: `${top}px`,
      left: `${Math.max(20, Math.min(rect.left + rect.width / 2 - cardWidth / 2 + offset.x, window.innerWidth - cardWidth - 20))}px`
    }
  } else if (position === 'top') {
    const top = Math.max(rect.top - cardHeight - padding + offset.y, 20)
    style = {
      bottom: `${window.innerHeight - top}px`,
      left: `${Math.max(20, Math.min(rect.left + rect.width / 2 - cardWidth / 2 + offset.x, window.innerWidth - cardWidth - 20))}px`
    }
  } else if (position === 'left') {
    const left = Math.max(20, rect.left - cardWidth - padding + offset.x)
    style = {
      top: `${Math.max(20, Math.min(rect.top + rect.height / 2 - cardHeight / 2 + offset.y, window.innerHeight - cardHeight - 20))}px`,
      left: `${left}px`
    }
  } else if (position === 'right') {
    const left = Math.min(rect.right + padding - offset.x, window.innerWidth - cardWidth - 20)
    style = {
      top: `${Math.max(20, Math.min(rect.top + rect.height / 2 - cardHeight / 2 + offset.y, window.innerHeight - cardHeight - 20))}px`,
      left: `${left}px`
    }
  }

  return style
})

// 方法
const updateTargetRect = () => {
  const step = steps[currentStep.value]
  if (!step || !step.target) {
    currentTarget.value = null
    targetRect.value = null
    return
  }

  // 查找目标元素
  const targetEl = document.querySelector(step.target)
  if (targetEl) {
    currentTarget.value = step.target
    targetRect.value = targetEl.getBoundingClientRect()

    // 如果目标不在视口内，滚动到可见位置
    if (targetRect.value.top < 0 || targetRect.value.bottom > window.innerHeight) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // 等待滚动完成后更新位置
      setTimeout(() => {
        targetRect.value = targetEl.getBoundingClientRect()
      }, 300)
    }
  } else {
    currentTarget.value = null
    targetRect.value = null
  }
}

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
    emit('stepChange', currentStep.value)
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    emit('stepChange', currentStep.value)
  }
}

const handleStepClick = () => {
  // 点击高亮区域继续下一步
  nextStep()
}

const handleClose = () => {
  emit('close')
  emit('update:visible', false)
}

const finishGuide = () => {
  // 保存引导完成状态
  localStorage.setItem('aero_hand_onboarding_completed', 'true')
  localStorage.setItem('aero_hand_onboarding_completed_at', new Date().toISOString())
  emit('complete')
  emit('update:visible', false)
}

const restartGuide = () => {
  currentStep.value = 0
  localStorage.removeItem('aero_hand_onboarding_completed')
  localStorage.removeItem('aero_hand_onboarding_completed_at')
  emit('update:visible', true)
}

// 监听步骤变化
watch(currentStep, () => {
  nextTick(() => {
    updateTargetRect()
  })
})

// 监听可见性变化
watch(() => props.visible, (val) => {
  if (val) {
    currentStep.value = 0
    nextTick(() => {
      updateTargetRect()
    })
  }
})

// 窗口大小变化时重新计算
const handleResize = () => {
  if (props.visible) {
    updateTargetRect()
  }
}

// 键盘事件
const handleKeydown = (e) => {
  if (!props.visible) return

  switch (e.key) {
    case 'ArrowRight':
    case 'Enter':
      nextStep()
      break
    case 'ArrowLeft':
      prevStep()
      break
    case 'Escape':
      handleClose()
      break
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
})

// 暴露方法
defineExpose({
  restart: restartGuide,
  isCompleted: () => localStorage.getItem('aero_hand_onboarding_completed') === 'true'
})
</script>

<style scoped>
/* 蒙版层 */
.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  pointer-events: none;
}

.mask-layer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: auto;
}

/* 高亮区域 */
.highlight-area {
  position: fixed;
  border-radius: 12px;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.6), 0 0 20px rgba(102, 126, 234, 0.3);
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 箭头指示器 */
.arrow-indicator {
  position: fixed;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  animation: bounce 1s ease infinite;
  z-index: 10001;
}

.arrow-indicator.top {
  transform: translateX(-50%);
}

.arrow-indicator.bottom {
  transform: translateX(-50%) rotate(180deg);
}

.arrow-indicator.left {
  transform: translateY(-50%) rotate(90deg);
}

.arrow-indicator.right {
  transform: translateY(-50%) rotate(-90deg);
}

@keyframes bounce {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-5px);
  }
}

.arrow-indicator.left,
.arrow-indicator.right {
  animation: bounceHorizontal 1s ease infinite;
}

@keyframes bounceHorizontal {
  0%, 100% {
    transform: translateY(-50%) rotate(90deg) translateX(0);
  }
  50% {
    transform: translateY(-50%) rotate(90deg) translateX(5px);
  }
}

/* 引导卡片 */
.guide-card {
  position: fixed;
  width: 340px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  pointer-events: auto;
  z-index: 10000;
  transition: all 0.3s ease;
}

.guide-card.center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

:deep(html.dark-mode) .guide-card {
  background: #25253a;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
}

:deep(html.dark-mode) .guide-card-header {
  background: #2d2d4a;
  border-bottom-color: #3a3a5a;
}

:deep(html.dark-mode) .guide-card-content {
  background: #25253a;
}

:deep(html.dark-mode) .guide-card-footer {
  background: #2d2d4a;
  border-top-color: #3a3a5a;
}

:deep(html.dark-mode) .guide-title {
  color: #e8e8f0;
}

:deep(html.dark-mode) .guide-description {
  color: #b8b8c8;
}

.guide-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.step-badge {
  font-size: 12px;
  font-weight: 600;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
}

.close-btn {
  font-size: 16px;
  color: #909399;
  padding: 4px;
}

.close-btn:hover {
  color: #606266;
}

.guide-card-content {
  padding: 20px;
  background: white;
}

.guide-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto 14px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.guide-icon.welcome {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.guide-icon.home {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
}

.guide-icon.learning {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.guide-icon.knowledge {
  background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
}

.guide-icon.hardware {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
}

.guide-icon.docs {
  background: linear-gradient(135deg, #909399 0%, #a6a9ad 100%);
}

.guide-icon.ai {
  background: linear-gradient(135deg, #cc5de8 0%, #da77f2 100%);
}

.guide-icon.complete {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.guide-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  text-align: center;
}

.guide-description {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #606266;
  text-align: center;
}

.guide-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(64, 158, 255, 0.08);
  border-radius: 8px;
  font-size: 12px;
  color: #409eff;
}

.guide-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-top: 1px solid #ebeef5;
}

.step-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dcdfe6;
  transition: all 0.3s ease;
}

.dot.active {
  width: 20px;
  border-radius: 4px;
  background: #667eea;
}

.dot.completed {
  background: #67c23a;
}

.guide-buttons {
  display: flex;
  gap: 8px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
