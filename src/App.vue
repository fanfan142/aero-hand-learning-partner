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
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLearningStore } from '@/stores/learning'
import { House, MagicStick, Odometer, Reading, Box, Document, Files, Share, Notebook, Operation, Connection, DataAnalysis, ChatDotRound } from '@element-plus/icons-vue'
import AIAssistant from '@/components/ai/AIAssistant.vue'
import { ElMessage } from 'element-plus'

const learningStore = useLearningStore()
const aiDrawerVisible = ref(false)
const progressDialogVisible = ref(false)

const progressPercent = computed(() => learningStore.progressPercent)

const showProgress = () => {
  progressDialogVisible.value = true
}

const goToLearning = () => {
  progressDialogVisible.value = false
  window.location.hash = '#/learning'
}
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
