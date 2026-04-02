<template>
  <div class="welcome-page">
    <!-- Hero 区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-icon">🎉</span>
          <span>开源项目 · 持续更新</span>
        </div>
        <h1 class="hero-title">
          Aero Hand Open
          <span class="title-highlight">学习伙伴</span>
        </h1>
        <p class="hero-subtitle">
          探索开源肌腱驱动灵巧机械手的完整技术栈<br/>
          从硬件设计到强化学习，踏上机器人技术的学习之旅
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" class="primary-action" @click="goToDocs">
            <el-icon><Reading /></el-icon>
            开始探索
          </el-button>
          <el-button size="large" class="secondary-action" @click="scrollToFeatures">
            <el-icon><InfoFilled /></el-icon>
            了解更多
          </el-button>
        </div>
      </div>
      <div class="hero-visual">
        <div class="visual-ring ring-1"></div>
        <div class="visual-ring ring-2"></div>
        <div class="visual-ring ring-3"></div>
        <div class="hand-icon">🤖</div>
      </div>
    </section>

    <!-- 核心特性展示 -->
    <section id="features" class="features-section">
      <div class="section-header">
        <h2 class="section-title">为什么选择 Aero Hand Open？</h2>
        <p class="section-desc">专为研究者和开发者设计的开放平台</p>
      </div>
      <el-row :gutter="24" class="features-grid">
        <el-col :xs="24" :sm="12" :md="6" v-for="feature in features" :key="feature.id">
          <div class="feature-card" :class="`feature-${feature.id}`">
            <div class="feature-icon-wrapper">
              <span class="feature-icon">{{ feature.icon }}</span>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
            <ul class="feature-list">
              <li v-for="item in feature.items" :key="item">{{ item }}</li>
            </ul>
          </div>
        </el-col>
      </el-row>
    </section>

    <!-- 系统架构 -->
    <section class="architecture-section">
      <div class="section-header">
        <h2 class="section-title">系统架构</h2>
        <p class="section-desc">从底层硬件到上层算法的完整技术栈</p>
      </div>
      <div class="architecture-diagram">
        <div class="arch-layer" v-for="(layer, idx) in architecture" :key="idx">
          <div class="arch-layer-label">{{ layer.label }}</div>
          <div class="arch-layer-items">
            <div
              v-for="item in layer.items"
              :key="item.name"
              class="arch-item"
              @mouseenter="activeArchItem = item.name"
              @mouseleave="activeArchItem = null"
            >
              <span class="arch-item-icon">{{ item.icon }}</span>
              <span class="arch-item-name">{{ item.name }}</span>
              <div class="arch-item-detail" v-if="activeArchItem === item.name">
                {{ item.detail }}
              </div>
            </div>
          </div>
          <div class="arch-connector" v-if="idx < architecture.length - 1">
            <div class="connector-line"></div>
            <div class="connector-arrow">▼</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 快速开始 -->
    <section class="quickstart-section">
      <div class="section-header">
        <h2 class="section-title">快速开始</h2>
        <p class="section-desc">按照以下步骤，开启你的学习之旅</p>
      </div>
      <el-card class="quickstart-card">
        <el-steps :active="currentStep" finish-status="success" align-center>
          <el-step
            v-for="(step, idx) in quickStartSteps"
            :key="idx"
            :title="step.title"
            :description="step.desc"
            @click="currentStep = idx"
          />
        </el-steps>
        <div class="quickstart-content">
          <transition name="fade-slide" mode="out-in">
            <div :key="currentStep" class="step-detail">
              <h4>{{ quickStartSteps[currentStep].title }}</h4>
              <p>{{ quickStartSteps[currentStep].content }}</p>
              <el-button
                v-if="quickStartSteps[currentStep].action"
                type="primary"
                @click="handleStepAction(quickStartSteps[currentStep].action)"
              >
                {{ quickStartSteps[currentStep].actionText }}
              </el-button>
            </div>
          </transition>
        </div>
        <div class="step-navigation">
          <el-button
            :disabled="currentStep === 0"
            @click="currentStep--"
          >
            <el-icon><ArrowLeft /></el-icon>
            上一步
          </el-button>
          <el-button
            :disabled="currentStep === quickStartSteps.length - 1"
            type="primary"
            @click="currentStep++"
          >
            下一步
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </el-card>
    </section>

    <!-- 学习路径 -->
    <section class="roadmap-section">
      <div class="section-header">
        <h2 class="section-title">学习路径</h2>
        <p class="section-desc">8 个阶段，循序渐进掌握完整技术栈</p>
      </div>
      <div class="roadmap-container">
        <div class="roadmap-track">
          <div
            class="roadmap-progress"
            :style="{ width: learningProgress + '%' }"
          ></div>
        </div>
        <div class="roadmap-stages">
          <div
            v-for="(stage, idx) in stages"
            :key="stage.id"
            class="roadmap-stage-card"
            :class="{ active: isStageActive(idx), completed: isStageCompleted(idx) }"
            @click="goToLearning"
          >
            <div class="stage-marker">
              <el-icon v-if="isStageCompleted(idx)"><Check /></el-icon>
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <div class="stage-content">
              <h4>{{ stage.title }}</h4>
              <p>{{ stage.tasks.length }} 个任务</p>
            </div>
          </div>
        </div>
      </div>
      <div class="roadmap-cta">
        <el-button type="primary" size="large" @click="goToLearning">
          <el-icon><Location /></el-icon>
          {{ hasLearningProgress ? '继续学习' : '开始学习' }}
        </el-button>
      </div>
    </section>

    <!-- 官方资源 -->
    <section class="resources-section">
      <div class="section-header">
        <h2 class="section-title">官方资源</h2>
        <p class="section-desc">获取最新的项目文档和源代码</p>
      </div>
      <el-row :gutter="24">
        <el-col :xs="24" :md="12">
          <a
            href="https://tetheria.github.io/aero-hand-open/"
            target="_blank"
            class="resource-card"
          >
            <div class="resource-icon">📖</div>
            <div class="resource-info">
              <h3>官方文档</h3>
              <p>完整的技术文档、装配指南和使用说明</p>
              <span class="resource-url">tetheria.github.io/aero-hand-open</span>
            </div>
            <el-icon class="resource-arrow"><Right /></el-icon>
          </a>
        </el-col>
        <el-col :xs="24" :md="12">
          <a
            href="https://github.com/tetheria/aero-hand-open"
            target="_blank"
            class="resource-card"
          >
            <div class="resource-icon">💾</div>
            <div class="resource-info">
              <h3>源代码仓库</h3>
              <p>硬件设计、固件、SDK、ROS2 全部开源</p>
              <span class="resource-url">github.com/tetheria/aero-hand-open</span>
            </div>
            <el-icon class="resource-arrow"><Right /></el-icon>
          </a>
        </el-col>
      </el-row>
    </section>

    <!-- 底部提示 -->
    <section class="tips-section">
      <el-alert type="info" :closable="false" show-icon>
        <template #title>
          <div class="tips-content">
            <strong>💡 提示：</strong>
            学习进度和 AI 配置保存在浏览器本地存储中，换设备需要重新开始。建议定期备份重要内容。
          </div>
        </template>
      </el-alert>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import {
  Link, TopRight, DocumentCopy, Location, Reading, Box, Odometer,
  InfoFilled, ArrowLeft, ArrowRight, Right, Check
} from '@element-plus/icons-vue'

const router = useRouter()
const learningStore = useLearningStore()
const stages = learningStore.stages
const currentStep = ref(0)
const activeArchItem = ref(null)

const features = [
  {
    id: 1,
    icon: '🎯',
    title: '肌腱驱动设计',
    desc: '仿生学设计，通过肌腱线实现平滑自然的关节运动',
    items: ['轻量紧凑', '高灵活性', '成本可控']
  },
  {
    id: 2,
    icon: '🖐️',
    title: '7 自由度',
    desc: '完整的灵巧手结构，支持复杂手势和操作',
    items: ['3 指 + 1 拇指', '独立关节控制', '多角度运动']
  },
  {
    id: 3,
    icon: '⚡',
    title: '智能舵机控制',
    desc: 'Feetech 智能舵机，支持精确位置和力矩控制',
    items: ['串口通信', '角度反馈', '过载保护']
  },
  {
    id: 4,
    icon: '🔄',
    title: 'Sim2Real',
    desc: '从仿真到实物，实现强化学习策略的无缝迁移',
    items: ['MuJoCo 仿真', 'PPO 算法', '域随机化']
  }
]

const architecture = [
  {
    label: '应用层',
    items: [
      { name: '强化学习', icon: '🤖', detail: 'PPO/DDPG 算法训练控制策略' },
      { name: 'ROS2', icon: '🔄', detail: '机器人操作系统集成与通信' },
      { name: 'SDK', icon: '🐍', detail: 'Python 控制接口与 GUI 工具' }
    ]
  },
  {
    label: '控制层',
    items: [
      { name: '固件', icon: '💻', detail: 'ESP32-S3 Arduino 固件，舵机控制' },
      { name: '协议', icon: '📡', detail: '16 字节串口协议，操作码 0x01-0x32' }
    ]
  },
  {
    label: '执行层',
    items: [
      { name: '舵机', icon: '⚙️', detail: 'Feetech SCS 系列，支持位置/速度/力矩' },
      { name: '舵机驱动板', icon: '🔌', detail: '自定义 PCB，集成供电与通信' }
    ]
  },
  {
    label: '机械层',
    items: [
      { name: '3D 打印', icon: '🖨️', detail: 'PLA/TPU 材料，关节限位设计' },
      { name: '肌腱驱动', icon: '🔗', detail: '渔线传动，弹簧回位' }
    ]
  }
]

const quickStartSteps = [
  {
    title: '了解项目背景',
    desc: '阅读官方文档',
    content: 'Aero Hand Open 是由 TetherIA 设计的开源肌腱驱动灵巧机械手项目。肌腱驱动是一种仿生设计，通过柔性传动介质（肌腱）连接电机和关节，实现轻量、紧凑且灵活的运动。',
    action: 'docs',
    actionText: '查看官方文档'
  },
  {
    title: '准备硬件',
    desc: '确认零件清单',
    content: '项目需要 3D 打印结构件、Feetech 智能舵机、ESP32-S3 主控板等组件。详细清单包括 PCB 板、螺丝、螺母、舵机 cables 等。所有零件都可通过标准渠道采购。',
    action: 'hardware',
    actionText: '查看硬件清单'
  },
  {
    title: '组装机械手',
    desc: '按照指南装配',
    content: '参考官方装配指南，按顺序安装关节、舵机、肌腱线。关键点：确保关节活动顺畅、肌腱张力适中、限位器正确安装。建议先完成单指测试再整体组装。',
    action: null,
    actionText: ''
  },
  {
    title: '烧录固件',
    desc: '配置 ESP32-S3',
    content: '使用 PlatformIO 或 Arduino IDE 编译并烧录固件到 ESP32-S3。固件支持串口协议，可控制舵机角度、速度、力矩。波特率默认 921600。',
    action: null,
    actionText: ''
  },
  {
    title: '安装 SDK',
    desc: 'Python 控制接口',
    content: '通过 pip 安装 aero-open-sdk：pip install aero-open-sdk。SDK 提供 AeroHand 类封装所有控制功能，支持关节位置控制、轨迹规划和状态读取。',
    action: null,
    actionText: ''
  },
  {
    title: '开始学习',
    desc: '理论与实践结合',
    content: '使用本学习伙伴系统地学习：阅读文档、完成课后习题、编写控制代码、运行仿真实验。完成所有阶段后，你将具备独立开发和扩展的能力。',
    action: 'learning',
    actionText: '进入学习系统'
  }
]

const learningProgress = computed(() => {
  if (!stages || stages.length === 0) return 0
  const completed = stages.filter(s => s.completed).length
  return Math.round((completed / stages.length) * 100)
})

const hasLearningProgress = computed(() => {
  return stages && stages.some(s => s.completed)
})

const isStageActive = (idx) => {
  if (hasLearningProgress.value) {
    const firstIncomplete = stages.findIndex(s => !s.completed)
    return idx === firstIncomplete
  }
  return idx === 0
}

const isStageCompleted = (idx) => {
  return stages[idx]?.completed
}

const goToLearning = () => {
  router.push('/learning')
}

const goToDocs = () => {
  router.push('/docs')
}

const goToHardware = () => {
  router.push('/hardware')
}

const scrollToFeatures = () => {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}

const handleStepAction = (action) => {
  if (action === 'docs') goToDocs()
  else if (action === 'hardware') goToHardware()
  else if (action === 'learning') goToLearning()
}
</script>

<style scoped>
.welcome-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

/* Hero 区域 */
.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60px 40px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 24px;
  margin-bottom: 48px;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.hero-content {
  flex: 1;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.4);
  border-radius: 50px;
  padding: 8px 16px;
  margin-bottom: 24px;
  font-size: 14px;
  color: #a8b4fc;
  animation: fadeInDown 0.6s ease-out;
}

.badge-icon {
  font-size: 16px;
}

.hero-title {
  font-size: 56px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 16px 0;
  line-height: 1.2;
  animation: fadeInUp 0.6s ease-out;
}

.title-highlight {
  display: block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 18px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 32px 0;
  animation: fadeInUp 0.6s ease-out 0.1s both;
}

.hero-actions {
  display: flex;
  gap: 16px;
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.primary-action {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-weight: 600;
  padding: 12px 32px;
  height: auto;
  transition: all 0.3s;
}

.primary-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.secondary-action {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 12px 32px;
  height: auto;
  transition: all 0.3s;
}

.secondary-action:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.hero-visual {
  position: relative;
  width: 280px;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.8s ease-out 0.3s both;
}

.visual-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(102, 126, 234, 0.3);
  animation: pulse-ring 3s ease-in-out infinite;
}

.ring-1 {
  width: 200px;
  height: 200px;
  animation-delay: 0s;
}

.ring-2 {
  width: 240px;
  height: 240px;
  animation-delay: 0.5s;
}

.ring-3 {
  width: 280px;
  height: 280px;
  animation-delay: 1s;
}

.hand-icon {
  font-size: 80px;
  z-index: 1;
  animation: float 3s ease-in-out infinite;
}

/* 通用 Section 样式 */
.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-title {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 12px 0;
}

.section-desc {
  font-size: 16px;
  color: #666;
  margin: 0;
}

/* 特性展示 */
.features-section {
  margin-bottom: 64px;
}

.features-grid {
  gap: 24px !important;
}

.feature-card {
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  height: 100%;
  border: 1px solid #f0f0f0;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

.feature-icon-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.feature-icon {
  font-size: 32px;
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 12px 0;
}

.feature-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.feature-list li {
  background: #f5f7fa;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: #667eea;
}

/* 系统架构 */
.architecture-section {
  margin-bottom: 64px;
  padding: 40px;
  background: #f8f9fc;
  border-radius: 24px;
}

.architecture-diagram {
  max-width: 900px;
  margin: 0 auto;
}

.arch-layer {
  position: relative;
}

.arch-layer-label {
  font-size: 12px;
  font-weight: 600;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
  text-align: center;
}

.arch-layer-items {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.arch-item {
  background: #fff;
  border: 1px solid #e8ecf4;
  border-radius: 12px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  min-width: 140px;
}

.arch-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
  transform: scale(1.05);
}

.arch-item-icon {
  font-size: 24px;
}

.arch-item-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}

.arch-item-detail {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a2e;
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
  animation: fadeIn 0.2s ease-out;
}

.arch-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
}

.connector-line {
  width: 2px;
  height: 24px;
  background: linear-gradient(to bottom, #667eea, #764ba2);
}

.connector-arrow {
  color: #667eea;
  font-size: 12px;
}

/* 快速开始 */
.quickstart-section {
  margin-bottom: 64px;
}

.quickstart-card {
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.quickstart-content {
  margin: 40px 0;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-detail {
  text-align: center;
  max-width: 600px;
}

.step-detail h4 {
  font-size: 24px;
  color: #1a1a2e;
  margin: 0 0 16px 0;
}

.step-detail p {
  font-size: 16px;
  color: #666;
  line-height: 1.8;
  margin: 0 0 24px 0;
}

.step-navigation {
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* 学习路径 */
.roadmap-section {
  margin-bottom: 64px;
}

.roadmap-container {
  position: relative;
  padding: 20px 0;
}

.roadmap-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background: #e8ecf4;
  border-radius: 2px;
  transform: translateY(-50%);
  z-index: 0;
}

.roadmap-progress {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  transition: width 0.5s ease-out;
}

.roadmap-stages {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  gap: 12px;
}

.roadmap-stage-card {
  background: #fff;
  border: 2px solid #e8ecf4;
  border-radius: 16px;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
  max-width: 160px;
}

.roadmap-stage-card:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.roadmap-stage-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.roadmap-stage-card.completed {
  border-color: #52c41a;
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.05) 0%, rgba(82, 196, 26, 0.02) 100%);
}

.roadmap-stage-card.completed .stage-marker {
  background: #52c41a;
}

.stage-marker {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.3s;
}

.stage-content h4 {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.stage-content p {
  font-size: 11px;
  color: #999;
  margin: 0;
}

.roadmap-cta {
  text-align: center;
  margin-top: 32px;
}

.roadmap-cta .el-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 14px 40px;
  font-weight: 600;
}

/* 官方资源 */
.resources-section {
  margin-bottom: 48px;
}

.resource-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #fff;
  border: 1px solid #e8ecf4;
  border-radius: 16px;
  padding: 24px;
  text-decoration: none;
  transition: all 0.3s;
}

.resource-card:hover {
  border-color: #667eea;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
  transform: translateX(8px);
}

.resource-icon {
  font-size: 40px;
  flex-shrink: 0;
}

.resource-info {
  flex: 1;
}

.resource-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 6px 0;
}

.resource-info p {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
}

.resource-url {
  font-size: 12px;
  color: #667eea;
}

.resource-arrow {
  font-size: 24px;
  color: #667eea;
  transition: transform 0.3s;
}

.resource-card:hover .resource-arrow {
  transform: translateX(4px);
}

/* 提示区域 */
.tips-section {
  margin-bottom: 24px;
}

.tips-content {
  line-height: 1.8;
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-ring {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 响应式 */
@media (max-width: 1024px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 40px 24px;
  }

  .hero-visual {
    margin-top: 32px;
  }

  .hero-title {
    font-size: 40px;
  }

  .hero-actions {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .section-title {
    font-size: 28px;
  }

  .architecture-section {
    padding: 24px 16px;
  }

  .arch-layer-items {
    gap: 8px;
  }

  .arch-item {
    padding: 12px 16px;
    min-width: 120px;
  }

  .arch-item-detail {
    display: none;
  }

  .roadmap-stages {
    flex-wrap: wrap;
  }

  .roadmap-stage-card {
    max-width: none;
    flex-basis: calc(25% - 12px);
  }

  .resource-card {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .hero-actions {
    flex-direction: column;
  }

  .feature-card {
    padding: 24px 16px;
  }

  .roadmap-stage-card {
    flex-basis: calc(50% - 12px);
  }
}
</style>
