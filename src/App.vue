<template>
  <el-container class="app-container">
    <!-- 官方项目横幅 -->
    <div class="official-banner">
      <el-icon class="banner-icon"><Link /></el-icon>
      <span class="banner-text">Aero Hand Open 官方项目：</span>
      <el-link
        href="https://tetheria.github.io/aero-hand-open/"
        target="_blank"
        class="banner-link"
      >
        https://tetheria.github.io/aero-hand-open/
        <el-icon class="el-icon--right"><TopRight /></el-icon>
      </el-link>
      <el-tag size="small" type="warning" class="ml-2">必读</el-tag>
    </div>

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
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLearningStore } from '@/stores/learning'
import { Link, TopRight } from '@element-plus/icons-vue'
import AIAssistant from '@/components/ai/AIAssistant.vue'

const learningStore = useLearningStore()
const aiDrawerVisible = ref(false)

const progressPercent = computed(() => learningStore.progressPercent)

const showProgress = () => {
  // TODO: 显示进度对话框
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.official-banner {
  background: linear-gradient(90deg, #ffd700 0%, #ffed4e 100%);
  padding: 12px 30px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.banner-icon {
  font-size: 20px;
  color: #b45309;
}

.banner-text {
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
}

.banner-link {
  font-size: 14px;
  font-weight: 600;
  color: #b45309;
  text-decoration: none;
  transition: all 0.3s;
}

.banner-link:hover {
  color: #78350f;
  text-decoration: underline;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  gap: 40px;
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
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
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
</style>
