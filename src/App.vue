<template>
  <el-container class="app-container">
    <!-- 顶部导航栏 -->
    <el-header class="app-header" :class="{ 'header-scrolled': isScrolled }">
      <div class="header-left">
        <el-icon class="logo-icon" @click="goHome"><MagicStick /></el-icon>
        <h1 class="app-title">Aero Hand 智能学习伙伴</h1>
        <!-- 移动端菜单按钮 -->
        <el-button class="mobile-menu-btn" text @click="isMobileMenuOpen = !isMobileMenuOpen">
          <el-icon v-if="!isMobileMenuOpen"><Expand /></el-icon>
          <el-icon v-else><Fold /></el-icon>
        </el-button>
      </div>

      <!-- 导航标签 - 桌面端 -->
      <div class="header-nav desktop-nav">
        <router-link to="/" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><House /></el-icon>
            <span>首页</span>
          </div>
        </router-link>
        <router-link to="/learning" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><Odometer /></el-icon>
            <span>学习进度</span>
          </div>
        </router-link>
        <router-link to="/knowledge" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><Reading /></el-icon>
            <span>知识库</span>
          </div>
        </router-link>
        <router-link to="/hardware" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><Box /></el-icon>
            <span>硬件清单</span>
          </div>
        </router-link>
        <router-link to="/docs" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><Document /></el-icon>
            <span>官方文档</span>
          </div>
        </router-link>
        <router-link to="/structure" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><Files /></el-icon>
            <span>项目结构</span>
          </div>
        </router-link>
        <router-link to="/mindmap" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><Share /></el-icon>
            <span>知识图谱</span>
          </div>
        </router-link>
        <router-link to="/techdocs" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><Notebook /></el-icon>
            <span>技术文档</span>
          </div>
        </router-link>
        <router-link to="/joint-mapping" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><Operation /></el-icon>
            <span>关节映射</span>
          </div>
        </router-link>
        <router-link to="/flows" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><Connection /></el-icon>
            <span>技术流程</span>
          </div>
        </router-link>
      </div>

      <!-- 移动端导航菜单 -->
      <transition name="slide-down">
        <div v-if="isMobileMenuOpen" class="mobile-nav">
          <router-link to="/" custom v-slot="{ navigate, isActive }">
            <div :class="['mobile-nav-item', { active: isActive }]" @click="handleNavClick(navigate)">
              <el-icon><House /></el-icon>
              <span>首页</span>
            </div>
          </router-link>
          <router-link to="/learning" custom v-slot="{ navigate, isActive }">
            <div :class="['mobile-nav-item', { active: isActive }]" @click="handleNavClick(navigate)">
              <el-icon><Odometer /></el-icon>
              <span>学习进度</span>
            </div>
          </router-link>
          <router-link to="/knowledge" custom v-slot="{ navigate, isActive }">
            <div :class="['mobile-nav-item', { active: isActive }]" @click="handleNavClick(navigate)">
              <el-icon><Reading /></el-icon>
              <span>知识库</span>
            </div>
          </router-link>
          <router-link to="/hardware" custom v-slot="{ navigate, isActive }">
            <div :class="['mobile-nav-item', { active: isActive }]" @click="handleNavClick(navigate)">
              <el-icon><Box /></el-icon>
              <span>硬件清单</span>
            </div>
          </router-link>
          <router-link to="/docs" custom v-slot="{ navigate, isActive }">
            <div :class="['mobile-nav-item', { active: isActive }]" @click="handleNavClick(navigate)">
              <el-icon><Document /></el-icon>
              <span>官方文档</span>
            </div>
          </router-link>
          <router-link to="/structure" custom v-slot="{ navigate, isActive }">
            <div :class="['mobile-nav-item', { active: isActive }]" @click="handleNavClick(navigate)">
              <el-icon><Files /></el-icon>
              <span>项目结构</span>
            </div>
          </router-link>
          <router-link to="/mindmap" custom v-slot="{ navigate, isActive }">
            <div :class="['mobile-nav-item', { active: isActive }]" @click="handleNavClick(navigate)">
              <el-icon><Share /></el-icon>
              <span>知识图谱</span>
            </div>
          </router-link>
          <router-link to="/techdocs" custom v-slot="{ navigate, isActive }">
            <div :class="['mobile-nav-item', { active: isActive }]" @click="handleNavClick(navigate)">
              <el-icon><Notebook /></el-icon>
              <span>技术文档</span>
            </div>
          </router-link>
          <router-link to="/joint-mapping" custom v-slot="{ navigate, isActive }">
            <div :class="['mobile-nav-item', { active: isActive }]" @click="handleNavClick(navigate)">
              <el-icon><Operation /></el-icon>
              <span>关节映射</span>
            </div>
          </router-link>
          <router-link to="/flows" custom v-slot="{ navigate, isActive }">
            <div :class="['mobile-nav-item', { active: isActive }]" @click="handleNavClick(navigate)">
              <el-icon><Connection /></el-icon>
              <span>技术流程</span>
            </div>
          </router-link>
        </div>
      </transition>

      <div class="header-right">
        <!-- 通知按钮 -->
        <el-button text @click="openNotifications" class="notification-btn" title="通知中心">
          <el-badge :value="unreadNotificationCount" :hidden="unreadNotificationCount === 0" :max="99">
            <el-icon><Bell /></el-icon>
          </el-badge>
        </el-button>

        <!-- 设置按钮 -->
        <router-link to="/settings" custom v-slot="{ navigate }">
          <el-button text @click="navigate" class="settings-btn" title="设置">
            <el-icon><Setting /></el-icon>
          </el-button>
        </router-link>

        <!-- 快捷键提示按钮 -->
        <el-button text @click="showShortcuts = true" title="键盘快捷键">
          <el-icon><Keyboard /></el-icon>
        </el-button>

        <!-- 搜索按钮 -->
        <el-button text @click="openSearch" title="全局搜索 (Ctrl+K)">
          <el-icon><Search /></el-icon>
        </el-button>

        <!-- 主题切换 -->
        <el-button text @click="toggleTheme" :title="preferencesStore.isDarkMode ? '切换亮色模式' : '切换深色模式'">
          <el-icon v-if="preferencesStore.isDarkMode"><Sunny /></el-icon>
          <el-icon v-else><Moon /></el-icon>
        </el-button>

        <!-- 进度 -->
        <el-button text @click="showProgress" class="progress-btn">
          <el-icon><DataAnalysis /></el-icon>
          <span class="progress-text">{{ progressPercent }}%</span>
        </el-button>
        <el-button text @click="aiDrawerVisible = true" class="ai-btn">
          <el-icon><ChatDotRound /></el-icon>
          <span class="ai-text">AI助手</span>
        </el-button>
      </div>
    </el-header>

    <el-main class="app-main">
      <!-- 全局加载指示器 -->
      <div v-if="isLoading" class="global-loading">
        <div class="loading-spinner">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
      </div>
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </el-main>

    <!-- AI助手全局抽屉 -->
    <el-drawer
      v-model="aiDrawerVisible"
      :title="drawerTitle"
      direction="rtl"
      :size="aiDrawerSize"
      :with-header="true"
      class="ai-drawer"
    >
      <template #title>
        <span class="drawer-title">
          <el-icon><ChatDotRound /></el-icon>
          AI学习助手
        </span>
      </template>
      <AIAssistant :context="{ title: '全局', id: 'default' }" />
    </el-drawer>

    <!-- 学习进度对话框 -->
    <el-dialog
      v-model="progressDialogVisible"
      title="学习进度"
      width="500px"
      class="progress-dialog"
    >
      <div class="progress-detail">
        <div class="progress-main">
          <el-progress
            type="circle"
            :percentage="progressPercent"
            :stroke-width="12"
            :width="180"
            :color="progressColor"
          />
          <div class="progress-label">
            <h3>{{ progressPercent }}%</h3>
            <p>学习进度</p>
          </div>
        </div>
        <el-divider />
        <div class="progress-info">
          <p><el-icon><Collection /></el-icon> 当前阶段：{{ learningStore.currentStageData?.title }}</p>
          <p><el-icon><SuccessFilled /></el-icon> 已完成任务：{{ learningStore.completedTasks.size }} 个</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="progressDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="goToLearning">查看详情</el-button>
      </template>
    </el-dialog>

    <!-- 键盘快捷键面板 -->
    <el-dialog
      v-model="showShortcuts"
      title="键盘快捷键"
      width="450px"
      class="shortcuts-dialog"
    >
      <div class="shortcuts-list">
        <div class="shortcut-item">
          <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>K</kbd></span>
          <span class="shortcut-desc">打开全局搜索</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>D</kbd></span>
          <span class="shortcut-desc">切换深色/亮色模式</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>H</kbd></span>
          <span class="shortcut-desc">显示学习进度</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>A</kbd></span>
          <span class="shortcut-desc">打开AI助手</span>
        </div>
        <div class="shortcut-item">
          <span class="shortcut-keys"><kbd>Esc</kbd></span>
          <span class="shortcut-desc">关闭对话框/抽屉</span>
        </div>
      </div>
    </el-dialog>

    <!-- 全局搜索 -->
    <GlobalSearch ref="searchDialogRef" />

    <!-- 通知中心 -->
    <NotificationCenter ref="notificationCenterRef" />

    <!-- 新手教程引导 -->
    <TutorialGuide ref="tutorialGuideRef" @complete="onTutorialComplete" @skip="onTutorialComplete" />

    <!-- 新手引导蒙版 -->
    <OnboardingGuide
      v-model:visible="onboardingVisible"
      @close="onOnboardingClose"
      @complete="onOnboardingComplete"
    />

    <!-- 设置按钮 - 用于重新打开引导 -->
    <div class="settings-menu">
      <el-dropdown trigger="click" @command="handleSettingsCommand">
        <el-button text class="settings-btn" title="设置">
          <el-icon><Setting /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="restart-guide">
              <el-icon><RefreshRight /></el-icon>
              重新打开引导
            </el-dropdown-item>
            <el-dropdown-item command="restart-tutorial">
              <el-icon><MagicStick /></el-icon>
              查看新手教程
            </el-dropdown-item>
            <el-dropdown-item command="shortcuts" divided>
              <el-icon><Keyboard /></el-icon>
              键盘快捷键
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import { usePreferencesStore } from '@/stores/preferences'
import { useNotificationsStore } from '@/stores/notifications'
import {
  House, MagicStick, Odometer, Reading, Box, Document, Files, Share, Notebook,
  Operation, Connection, DataAnalysis, ChatDotRound, Search, Sunny, Moon,
  Keyboard, Expand, Fold, Collection, SuccessFilled, Loading, Setting,
  RefreshRight, Bell
} from '@element-plus/icons-vue'
import AIAssistant from '@/components/ai/AIAssistant.vue'
import GlobalSearch from '@/components/common/GlobalSearch.vue'
import TutorialGuide from '@/components/common/TutorialGuide.vue'
import OnboardingGuide from '@/components/common/OnboardingGuide.vue'
import NotificationCenter from '@/components/common/NotificationCenter.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const learningStore = useLearningStore()
const preferencesStore = usePreferencesStore()
const notificationsStore = useNotificationsStore()

// Refs
const notificationCenterRef = ref(null)

// 状态
const aiDrawerVisible = ref(false)
const progressDialogVisible = ref(false)
const searchDialogRef = ref(null)
const tutorialGuideRef = ref(null)
const showShortcuts = ref(false)
const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)
const isLoading = ref(false)
const onboardingVisible = ref(false)

// 计算属性
const progressPercent = computed(() => learningStore.progressPercent)
const unreadNotificationCount = computed(() => notificationsStore.unreadCount)

// 进度颜色
const progressColor = computed(() => {
  const percent = progressPercent.value
  if (percent < 30) return '#f56c6c'
  if (percent < 70) return '#e6a23c'
  return '#67c23a'
})

// AI抽屉尺寸（响应式）
const aiDrawerSize = computed(() => {
  return window.innerWidth < 768 ? '85%' : '420px'
})

// AI抽屉标题
const drawerTitle = computed(() => {
  return 'AI学习助手'
})

// 方法
const showProgress = () => {
  progressDialogVisible.value = true
}

const goToLearning = () => {
  progressDialogVisible.value = false
  router.push('/learning')
}

const goHome = () => {
  router.push('/')
}

// 移动端菜单点击处理
const handleNavClick = (navigate) => {
  navigate()
  isMobileMenuOpen.value = false
}

// 主题切换
const toggleTheme = () => {
  preferencesStore.toggleTheme()
  ElMessage({
    message: preferencesStore.isDarkMode ? '已切换到深色模式' : '已切换到亮色模式',
    type: 'success',
    duration: 2000,
    showClose: true
  })
}

// 全局搜索
const openSearch = () => {
  searchDialogRef.value?.open()
}

// 打开通知中心
const openNotifications = () => {
  notificationCenterRef.value?.open()
}

// 教程完成回调
const onTutorialComplete = () => {
  // 教程完成后发送通知
  notificationsStore.notifyTutorialComplete('新手教程')
  // 教程完成后显示引导蒙版
  setTimeout(() => {
    onboardingVisible.value = true
  }, 300)
}

// 引导关闭回调
const onOnboardingClose = () => {
  // 记录引导已完成
  localStorage.setItem('aero_hand_onboarding_completed', 'true')
  localStorage.setItem('aero_hand_onboarding_completed_at', new Date().toISOString())
}

// 引导完成回调
const onOnboardingComplete = () => {
  notificationsStore.notifyTutorialComplete('新手指引')
  ElMessage({
    message: '新手指引已完成，开始你的学习之旅吧！',
    type: 'success',
    duration: 3000,
    showClose: true
  })
}

// 设置菜单命令处理
const handleSettingsCommand = (command) => {
  switch (command) {
    case 'restart-guide':
      onboardingVisible.value = true
      break
    case 'restart-tutorial':
      tutorialGuideRef.value?.open()
      break
    case 'shortcuts':
      showShortcuts.value = true
      break
  }
}

// 检查是否首次访问
const checkFirstVisit = () => {
  const tutorialCompleted = localStorage.getItem('aero_hand_tutorial_completed') === 'true'
  const onboardingCompleted = localStorage.getItem('aero_hand_onboarding_completed') === 'true'

  // 如果都没有完成，显示教程
  if (!tutorialCompleted && !onboardingCompleted) {
    setTimeout(() => {
      tutorialGuideRef.value?.open()
    }, 500)
  }
}

// 关闭移动端菜单和对话框的函数
const closeDialogs = () => {
  aiDrawerVisible.value = false
  progressDialogVisible.value = false
  showShortcuts.value = false
  isMobileMenuOpen.value = false
}

// 键盘快捷键
const handleKeydown = (e) => {
  // Ctrl/Cmd + K: 打开搜索
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    openSearch()
  }
  // Ctrl/Cmd + D: 切换主题
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault()
    toggleTheme()
  }
  // Ctrl/Cmd + H: 显示进度
  if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
    e.preventDefault()
    showProgress()
  }
  // Ctrl/Cmd + A: 打开AI助手
  if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
    e.preventDefault()
    aiDrawerVisible.value = true
  }
  // Esc: 关闭对话框
  if (e.key === 'Escape') {
    closeDialogs()
  }
}

// 滚动监听
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

// 路由变化时关闭移动端菜单
watch(() => router.currentRoute.value, () => {
  isMobileMenuOpen.value = false
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', handleScroll)
  preferencesStore.applyTheme()
  // 检查首次访问
  checkFirstVisit()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: var(--bg-base);
  transition: background-color 0.3s ease;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  gap: 16px;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.app-header.header-scrolled {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.logo-icon:hover {
  transform: scale(1.1);
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  white-space: nowrap;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  color: white !important;
  font-size: 20px;
}

/* 桌面端导航 */
.desktop-nav {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 13px;
  white-space: nowrap;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.nav-item.active {
  background: white;
  color: #667eea;
  border-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 移动端导航菜单 */
.mobile-nav {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 999;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  font-size: 14px;
}

.mobile-nav-item:hover,
.mobile-nav-item.active {
  background: rgba(255, 255, 255, 0.2);
}

/* 移动端显示 */
@media (max-width: 1024px) {
  .desktop-nav {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .mobile-nav {
    display: flex;
    flex-direction: column;
  }

  .app-title {
    font-size: 16px;
  }

  .progress-text,
  .ai-text {
    display: none;
  }

  .app-header {
    padding: 0 16px;
  }
}

@media (max-width: 768px) {
  .header-right {
    gap: 4px;
  }

  .header-right .el-button {
    padding: 8px;
  }
}

/* 头部右侧按钮 */
.header-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.header-right .el-button {
  color: white !important;
  transition: all 0.25s ease;
}

.header-right .el-button:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: scale(1.05);
}

.notification-btn,
.settings-btn {
  position: relative;
}

.notification-btn :deep(.el-badge__content) {
  background-color: #f56c6c;
  border: none;
}

.progress-btn,
.ai-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 主内容区 */
.app-main {
  padding: 24px;
  min-height: calc(100vh - 60px);
  position: relative;
}

/* 全局加载指示器 */
.global-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 20px;
  text-align: center;
  z-index: 100;
}

.loading-spinner {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--el-color-primary);
  color: white;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.3);
}

/* 进度对话框 */
.progress-detail {
  text-align: center;
}

.progress-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  padding: 20px 0;
}

.progress-label h3 {
  margin: 0;
  font-size: 28px;
  color: var(--text-primary);
}

.progress-label p {
  margin: 8px 0 0 0;
  color: var(--text-secondary);
}

.progress-info {
  text-align: left;
  padding: 10px 20px;
}

.progress-info p {
  margin: 10px 0;
  color: var(--text-regular);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* AI抽屉样式 */
.drawer-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

/* 快捷键面板 */
.shortcuts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
}

.shortcut-item:last-child {
  border-bottom: none;
}

.shortcut-keys {
  display: flex;
  align-items: center;
  gap: 4px;
}

.shortcut-keys kbd {
  display: inline-block;
  padding: 4px 8px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.shortcut-desc {
  color: var(--text-secondary);
  font-size: 14px;
}

/* 路由切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 菜单滑动动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 设置菜单 */
.settings-menu {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.settings-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
  border: none;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transition: all 0.25s ease;
}

.settings-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.settings-menu :deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.settings-menu :deep(.el-dropdown-menu__item .el-icon) {
  font-size: 14px;
}

/* 移动端调整 */
@media (max-width: 768px) {
  .settings-menu {
    bottom: 16px;
    right: 16px;
  }

  .settings-btn {
    width: 40px;
    height: 40px;
  }
}
</style>

<!-- 全局样式 - 深色模式等 -->
<style>
/* CSS 变量定义 */
:root {
  /* 亮色模式颜色 */
  --bg-base: #f5f7fa;
  --bg-surface: #ffffff;
  --bg-hover: #f0f2f5;
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --border-color: #ebeef5;
  --shadow-color: rgba(0, 0, 0, 0.1);

  /* 主色调 */
  --primary-color: #667eea;
  --primary-light: #8fa4f0;
  --primary-dark: #5a7bd6;

  /* 成功/警告/危险色 */
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;

  /* 统一卡片阴影 */
  --card-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  --card-shadow-hover: 0 4px 20px rgba(0, 0, 0, 0.12);

  /* 统一圆角 */
  --border-radius: 8px;
  --border-radius-lg: 12px;
}

/* 深色模式变量 */
html.dark-mode {
  --bg-base: #1a1a2e;
  --bg-surface: #25253a;
  --bg-hover: #2d2d4a;
  --text-primary: #e8e8f0;
  --text-regular: #b8b8c8;
  --text-secondary: #8888a0;
  --border-color: #3a3a5a;
  --shadow-color: rgba(0, 0, 0, 0.3);

  --primary-color: #8fa4f0;
  --primary-light: #a8b8f5;
  --primary-dark: #667eea;

  --card-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  --card-shadow-hover: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* 全局过渡 */
* {
  transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease;
}

/* 全局深色模式样式 */
html.dark-mode .app-container {
  background-color: var(--bg-base);
}

html.dark-mode .app-header {
  background: linear-gradient(135deg, #4a4a6a 0%, #5a4a7a 100%);
}

html.dark-mode .el-card,
html.dark-mode .card {
  background-color: var(--bg-surface);
  color: var(--text-primary);
  border-color: var(--border-color);
  box-shadow: var(--card-shadow);
}

html.dark-mode .el-dialog {
  background-color: var(--bg-surface);
  border-color: var(--border-color);
}

html.dark-mode .el-drawer {
  background-color: var(--bg-surface);
}

html.dark-mode .el-table {
  background-color: var(--bg-surface);
  color: var(--text-primary);
  border-color: var(--border-color);
}

html.dark-mode .el-table th,
html.dark-mode .el-table tr {
  background-color: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-color);
}

html.dark-mode .el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: var(--bg-hover);
}

html.dark-mode .el-input__wrapper {
  background-color: var(--bg-hover);
  box-shadow: none;
  border-color: var(--border-color);
}

html.dark-mode .el-input__inner {
  color: var(--text-primary);
}

html.dark-mode .el-input__wrapper:hover {
  border-color: var(--primary-color);
}

html.dark-mode .el-input__wrapper.is-focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(143, 164, 240, 0.2);
}

html.dark-mode body {
  background-color: var(--bg-base);
  color: var(--text-primary);
}

html.dark-mode .el-main {
  background-color: var(--bg-base);
}

/* 统一按钮样式 */
html.dark-mode .el-button {
  background-color: var(--bg-surface);
  border-color: var(--border-color);
  color: var(--text-primary);
}

html.dark-mode .el-button:hover {
  background-color: var(--bg-hover);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

html.dark-mode .el-button--primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

html.dark-mode .el-button--primary:hover {
  background-color: var(--primary-light);
  border-color: var(--primary-light);
}

/* 统一输入框样式 */
html.dark-mode .el-input__wrapper {
  background-color: var(--bg-surface);
}

/* 统一进度条样式 */
html.dark-mode .el-progress-bar__outer {
  background-color: var(--bg-hover);
}

/* 深色模式下的快捷键面板 */
html.dark-mode .shortcuts-list .shortcut-item {
  border-color: var(--border-color);
}

html.dark-mode .shortcut-keys kbd {
  background-color: var(--bg-hover);
  border-color: var(--border-color);
}

html.dark-mode .shortcut-desc {
  color: var(--text-secondary);
}

/* 深色模式下的移动端菜单 */
html.dark-mode .mobile-nav {
  background: linear-gradient(135deg, #4a4a6a 0%, #5a4a7a 100%);
}

/* 深色模式下的搜索结果 */
html.dark-mode .result-item:hover,
html.dark-mode .result-item.highlighted {
  background: var(--bg-hover);
}

html.dark-mode .result-item.highlighted {
  background: rgba(143, 164, 240, 0.15);
  border-left-color: var(--primary-color);
}

/* 统一卡片悬停效果 */
html.dark-mode .el-card:hover,
html.dark-mode .card:hover {
  box-shadow: var(--card-shadow-hover);
}

/* 深色模式下的对话框底部 */
html.dark-mode .el-dialog__footer {
  border-top: 1px solid var(--border-color);
}

/* 深色模式下的分割线 */
html.dark-mode .el-divider {
  border-color: var(--border-color);
}

/* 深色模式下的标签 */
html.dark-mode .el-tag {
  background-color: var(--bg-hover);
  border-color: var(--border-color);
  color: var(--text-regular);
}

/* 过渡动画平滑 */
html.dark-mode,
html.dark-mode * {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}

/* 禁用某些元素的过渡以避免闪烁 */
el-input, el-select, el-button {
  transition: none;
}
</style>
