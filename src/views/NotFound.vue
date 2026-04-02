<template>
  <div class="not-found-page">
    <div class="content-wrapper">
      <!-- 404 图形 -->
      <div class="illustration">
        <svg viewBox="0 0 400 300" class="error-svg">
          <!-- 背景圆形 -->
          <circle cx="200" cy="150" r="120" fill="#f0f2f5" class="bg-circle"/>
          <!-- 问号 -->
          <text x="200" y="130" text-anchor="middle" font-size="80" font-weight="bold" fill="#667eea" class="question-mark">?</text>
          <text x="200" y="190" text-anchor="middle" font-size="40" font-weight="bold" fill="#764ba2" class="four-oh-four">404</text>
          <!-- 装饰元素 -->
          <circle cx="80" cy="80" r="8" fill="#667eea" class="dot dot-1"/>
          <circle cx="320" cy="100" r="6" fill="#764ba2" class="dot dot-2"/>
          <circle cx="100" cy="220" r="5" fill="#667eea" class="dot dot-3"/>
          <circle cx="300" cy="200" r="7" fill="#764ba2" class="dot dot-4"/>
          <!-- 火箭/手形状装饰 -->
          <path d="M320 240 L340 260 L330 260 L330 280 L310 280 L310 260 L300 260 Z" fill="#667eea" opacity="0.6" class="rocket"/>
        </svg>
      </div>

      <!-- 错误信息 -->
      <div class="error-content">
        <h1 class="error-title">页面未找到</h1>
        <p class="error-message">
          抱歉，您访问的页面不存在或已被移除。
          <br>
          可能的原因：
        </p>
        <ul class="error-reasons">
          <li>URL 地址输入错误</li>
          <li>页面已被删除或移动</li>
          <li>链接已过期</li>
        </ul>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="goHome">
            <el-icon><House /></el-icon>
            返回首页
          </el-button>
          <el-button size="large" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回上一页
          </el-button>
        </div>

        <!-- 快捷导航 -->
        <div class="quick-nav">
          <p>您可以尝试：</p>
          <div class="nav-links">
            <router-link to="/learning" class="nav-link">
              <el-icon><Odometer /></el-icon>
              <span>学习进度</span>
            </router-link>
            <router-link to="/knowledge" class="nav-link">
              <el-icon><Reading /></el-icon>
              <span>知识库</span>
            </router-link>
            <router-link to="/hardware" class="nav-link">
              <el-icon><Box /></el-icon>
              <span>硬件清单</span>
            </router-link>
            <router-link to="/settings" class="nav-link">
              <el-icon><Setting /></el-icon>
              <span>设置</span>
            </router-link>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="search-section">
          <p>或者搜索您需要的内容：</p>
          <el-input
            v-model="searchQuery"
            placeholder="输入关键词搜索..."
            size="large"
            @keyup.enter="handleSearch"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <!-- 装饰背景 -->
    <div class="bg-decoration">
      <div class="wave wave-1"></div>
      <div class="wave wave-2"></div>
      <div class="wave wave-3"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { House, ArrowLeft, Odometer, Reading, Box, Setting, Search } from '@element-plus/icons-vue'

const router = useRouter()
const searchQuery = ref('')

function goHome() {
  router.push('/')
}

function goBack() {
  router.back()
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    // 可以扩展为全局搜索功能
    ElMessage.info('搜索功能开发中...')
  }
}

// 临时导入 ElMessage
import { ElMessage } from 'element-plus'
</script>

<style scoped>
.not-found-page {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 40px 20px;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 600px;
  z-index: 10;
}

/* SVG 图形 */
.illustration {
  width: 100%;
  max-width: 400px;
  margin-bottom: 32px;
}

.error-svg {
  width: 100%;
  height: auto;
}

.bg-circle {
  animation: pulse 3s ease-in-out infinite;
}

.question-mark {
  animation: bounce 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.dot {
  animation: float 3s ease-in-out infinite;
}

.dot-1 { animation-delay: 0s; }
.dot-2 { animation-delay: 0.5s; }
.dot-3 { animation-delay: 1s; }
.dot-4 { animation-delay: 1.5s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.rocket {
  animation: launch 4s ease-in-out infinite;
}

@keyframes launch {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(-5deg); }
  50% { transform: translateY(-20px) rotate(0deg); }
  75% { transform: translateY(-10px) rotate(5deg); }
}

/* 错误内容 */
.error-content {
  text-align: center;
}

.error-title {
  font-size: 36px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 16px 0;
}

.error-message {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.error-reasons {
  text-align: left;
  color: #909399;
  font-size: 14px;
  margin: 0 0 32px 0;
  padding-left: 24px;
}

.error-reasons li {
  margin: 8px 0;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

/* 快捷导航 */
.quick-nav {
  margin-bottom: 32px;
}

.quick-nav p {
  color: #909399;
  font-size: 14px;
  margin: 0 0 16px 0;
}

.nav-links {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: white;
  border-radius: 8px;
  text-decoration: none;
  color: #606266;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.nav-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.nav-link .el-icon {
  font-size: 18px;
}

/* 搜索框 */
.search-section {
  width: 100%;
  max-width: 400px;
}

.search-section p {
  color: #909399;
  font-size: 14px;
  margin: 0 0 12px 0;
}

.search-input {
  width: 100%;
}

/* 装饰背景 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
}

.wave {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.wave-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  top: -200px;
  right: -200px;
  animation: wave-float 8s ease-in-out infinite;
}

.wave-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  bottom: -100px;
  left: -100px;
  animation: wave-float 10s ease-in-out infinite reverse;
}

.wave-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: wave-pulse 6s ease-in-out infinite;
}

@keyframes wave-float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -30px); }
}

@keyframes wave-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.1; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.15; }
}

/* 响应式 */
@media (max-width: 768px) {
  .error-title {
    font-size: 28px;
  }

  .error-message {
    font-size: 14px;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .action-buttons .el-button {
    width: 100%;
  }

  .nav-links {
    flex-direction: column;
    align-items: center;
  }

  .nav-link {
    width: 100%;
    max-width: 200px;
    justify-content: center;
  }
}
</style>
