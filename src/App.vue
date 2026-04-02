<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-left">
        <el-icon class="logo-icon"><MagicStick /></el-icon>
        <h1>Aero Hand 智能学习伙伴</h1>
      </div>

      <!-- 导航标签 -->
      <div class="header-nav">
        <router-link to="/" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><House /></el-icon>
            首页
          </div>
        </router-link>
        <router-link to="/learning" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><Odometer /></el-icon>
            学习进度
          </div>
        </router-link>
        <router-link to="/knowledge" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><Reading /></el-icon>
            知识库
          </div>
        </router-link>
        <router-link to="/hardware" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><Box /></el-icon>
            硬件清单
          </div>
        </router-link>
        <router-link to="/docs" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><Document /></el-icon>
            官方文档
          </div>
        </router-link>
        <router-link to="/structure" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><Files /></el-icon>
            项目结构
          </div>
        </router-link>
        <router-link to="/mindmap" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><Share /></el-icon>
            知识图谱
          </div>
        </router-link>
        <router-link to="/techdocs" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><Notebook /></el-icon>
            技术文档
          </div>
        </router-link>
        <router-link to="/joint-mapping" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><Operation /></el-icon>
            关节映射
          </div>
        </router-link>
        <router-link to="/flows" custom v-slot="{ navigate, isActive }">
          <div
            :class="['nav-item', { active: isActive }]"
            @click="navigate"
          >
            <el-icon><Connection /></el-icon>
            技术流程
          </div>
        </router-link>
      </div>

      <div class="header-right">
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
        <el-button text @click="showProgress">
          <el-icon><DataAnalysis /></el-icon>
          {{ progressPercent }}%
        </el-button>
        <el-button text @click="aiDrawerVisible = true">
          <el-icon><ChatDotRound /></el-icon>
          AI助手
        </el-button>
      </div>
    </el-header>

    <el-main class="app-main">
      <router-view />
    </el-main>

    <!-- AI助手全局抽屉 -->
    <el-drawer
      v-model="aiDrawerVisible"
      title="💬 AI学习助手"
      direction="rtl"
      size="40%"
    >
      <AIAssistant :context="{ title: '全局', id: 'default' }" />
    </el-drawer>

    <!-- 学习进度对话框 -->
    <el-dialog
      v-model="progressDialogVisible"
      title="📊 学习进度"
      width="500px"
    >
      <div class="progress-detail">
        <div class="progress-main">
          <el-progress
            type="circle"
            :percentage="progressPercent"
            :stroke-width="12"
            :width="180"
          />
          <div class="progress-label">
            <h3>{{ progressPercent }}%</h3>
            <p>学习进度</p>
          </div>
        </div>
        <el-divider />
        <div class="progress-info">
          <p>当前阶段：{{ learningStore.currentStageData?.title }}</p>
          <p>已完成任务：{{ learningStore.completedTasks.size }} 个</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="progressDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="goToLearning">查看详情</el-button>
      </template>
    </el-dialog>

    <!-- 全局搜索 -->
    <GlobalSearch ref="searchDialogRef" />
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLearningStore } from '@/stores/learning'
import { usePreferencesStore } from '@/stores/preferences'
import { House, MagicStick, Odometer, Reading, Box, Document, Files, Share, Notebook, Operation, Connection, DataAnalysis, ChatDotRound, Search, Sunny, Moon } from '@element-plus/icons-vue'
import AIAssistant from '@/components/ai/AIAssistant.vue'
import GlobalSearch from '@/components/common/GlobalSearch.vue'
import { ElMessage } from 'element-plus'

const learningStore = useLearningStore()
const preferencesStore = usePreferencesStore()
const aiDrawerVisible = ref(false)
const progressDialogVisible = ref(false)
const searchDialogRef = ref(null)

const progressPercent = computed(() => learningStore.progressPercent)

const showProgress = () => {
  progressDialogVisible.value = true
}

const goToLearning = () => {
  progressDialogVisible.value = false
  window.location.hash = '#/learning'
}

// 主题切换
const toggleTheme = () => {
  preferencesStore.toggleTheme()
  ElMessage.success(preferencesStore.isDarkMode ? '已切换到深色模式' : '已切换到亮色模式')
}

// 全局搜索
const openSearch = () => {
  searchDialogRef.value?.open()
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
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  preferencesStore.applyTheme()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  gap: 20px;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-icon {
  font-size: 32px;
}

.header-left h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.header-nav {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 14px;
  white-space: nowrap;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.nav-item.active {
  background: white;
  color: #667eea;
}

.header-right {
  display: flex;
  gap: 10px;
}

.header-right .el-button {
  color: white !important;
}

.app-main {
  padding: 30px;
}

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
  color: #303133;
}

.progress-label p {
  margin: 8px 0 0 0;
  color: #909399;
}

.progress-info {
  text-align: left;
  padding: 10px 20px;
}

.progress-info p {
  margin: 8px 0;
  color: #606266;
}
</style>

<!-- 全局深色模式样式 -->
<style>
/* 深色模式 */
html.dark-mode {
  background-color: #1a1a1a;
  color: #e0e0e0;
}

html.dark-mode .app-container {
  background-color: #1a1a1a;
}

html.dark-mode .app-header {
  background: linear-gradient(135deg, #4a4a6a 0%, #5a4a7a 100%);
}

html.dark-mode .card {
  background-color: #2d2d2d;
  color: #e0e0e0;
}

html.dark-mode .el-card {
  background-color: #2d2d2d;
  color: #e0e0e0;
  border-color: #404040;
}

html.dark-mode .el-dialog {
  background-color: #2d2d2d;
}

html.dark-mode .el-drawer {
  background-color: #2d2d2d;
}

html.dark-mode .el-table {
  background-color: #2d2d2d;
  color: #e0e0e0;
}

html.dark-mode .el-table th,
html.dark-mode .el-table tr {
  background-color: #3d3d3d;
  color: #e0e0e0;
}

html.dark-mode .el-input__wrapper {
  background-color: #3d3d3d;
}

html.dark-mode .el-input__inner {
  color: #e0e0e0;
}

html.dark-mode body {
  background-color: #1a1a1a;
  color: #e0e0e0;
}

html.dark-mode .el-main {
  background-color: #1a1a1a;
}

html.dark-mode .progress-info p {
  color: #b0b0b0;
}

html.dark-mode .progress-label h3 {
  color: #e0e0e0;
}

html.dark-mode .progress-label p {
  color: #b0b0b0;
}
</style>
