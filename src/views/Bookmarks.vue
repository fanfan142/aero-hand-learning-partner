<template>
  <div class="bookmarks-page">
    <!-- 页面标题 -->
    <div class="page-header card mb-3">
      <div class="header-content">
        <h2>📌 我的收藏</h2>
        <p>管理您的学习书签和收藏内容</p>
      </div>
      <div class="header-actions">
        <el-button @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
        <el-button @click="importData">
          <el-icon><Upload /></el-icon>
          导入数据
        </el-button>
        <el-button type="danger" @click="clearAll" :disabled="totalCount === 0">
          <el-icon><Delete /></el-icon>
          清空全部
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon articles">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ bookmarksStore.bookmarkedArticlesCount }}</div>
            <div class="stat-label">收藏文章</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon tasks">
            <el-icon><Odometer /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ bookmarksStore.bookmarkedTasksCount }}</div>
            <div class="stat-label">收藏任务</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon pages">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ bookmarksStore.bookmarkedPagesCount }}</div>
            <div class="stat-label">收藏页面</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="bookmarks-tabs">
      <!-- 收藏的文章 -->
      <el-tab-pane label="📄 收藏文章" name="articles">
        <div v-if="bookmarksStore.bookmarkedArticlesCount === 0" class="empty-state">
          <el-empty description="暂无收藏文章" />
          <el-button type="primary" @click="$router.push('/knowledge')">
            去知识库看看
          </el-button>
        </div>
        <div v-else class="bookmark-list">
          <el-card
            v-for="articleId in bookmarksStore.bookmarkedArticles"
            :key="articleId"
            class="bookmark-item"
          >
            <div class="bookmark-content">
              <div class="bookmark-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="bookmark-info">
                <div class="bookmark-title">{{ getArticleTitle(articleId) }}</div>
                <div class="bookmark-meta">
                  <el-tag size="small" type="info">文章</el-tag>
                </div>
              </div>
              <div class="bookmark-actions">
                <el-button text @click="goToArticle(articleId)">
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
                <el-button text type="danger" @click="removeBookmark('article', articleId)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 收藏的任务 -->
      <el-tab-pane label="🎯 收藏任务" name="tasks">
        <div v-if="bookmarksStore.bookmarkedTasksCount === 0" class="empty-state">
          <el-empty description="暂无收藏任务" />
          <el-button type="primary" @click="$router.push('/learning')">
            去学习中心
          </el-button>
        </div>
        <div v-else class="bookmark-list">
          <el-card
            v-for="taskId in bookmarksStore.bookmarkedTasks"
            :key="taskId"
            class="bookmark-item"
          >
            <div class="bookmark-content">
              <div class="bookmark-icon tasks">
                <el-icon><Odometer /></el-icon>
              </div>
              <div class="bookmark-info">
                <div class="bookmark-title">{{ getTaskTitle(taskId) }}</div>
                <div class="bookmark-meta">
                  <el-tag size="small" type="success">任务</el-tag>
                </div>
              </div>
              <div class="bookmark-actions">
                <el-button text @click="goToTask(taskId)">
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
                <el-button text type="danger" @click="removeBookmark('task', taskId)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 收藏的页面 -->
      <el-tab-pane label="📱 收藏页面" name="pages">
        <div v-if="bookmarksStore.bookmarkedPagesCount === 0" class="empty-state">
          <el-empty description="暂无收藏页面" />
        </div>
        <div v-else class="bookmark-list">
          <el-card
            v-for="pageId in bookmarksStore.bookmarkedPages"
            :key="pageId"
            class="bookmark-item"
          >
            <div class="bookmark-content">
              <div class="bookmark-icon pages">
                <el-icon><Connection /></el-icon>
              </div>
              <div class="bookmark-info">
                <div class="bookmark-title">{{ getPageTitle(pageId) }}</div>
                <div class="bookmark-meta">
                  <el-tag size="small" type="warning">页面</el-tag>
                  <span class="page-path">{{ getPagePath(pageId) }}</span>
                </div>
              </div>
              <div class="bookmark-actions">
                <el-button text @click="goToPage(pageId)">
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
                <el-button text type="danger" @click="removeBookmark('page', pageId)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入书签数据" width="500px">
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :limit="1"
        accept=".json"
        :on-change="handleFileChange"
      >
        <template #trigger>
          <el-button type="primary">选择 JSON 文件</el-button>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmImport" :disabled="!importFile">
          确认导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBookmarksStore } from '@/stores/bookmarks'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Upload, Delete, Document, Odometer, Connection, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const bookmarksStore = useBookmarksStore()

// 状态
const activeTab = ref('articles')
const importDialogVisible = ref(false)
const importFile = ref(null)
const uploadRef = ref(null)

// 计算属性
const totalCount = computed(() => bookmarksStore.totalBookmarksCount)

// 页面/文章/任务数据映射
const pageMap = {
  'knowledge': { title: '知识库', path: '/knowledge' },
  'hardware': { title: '硬件清单', path: '/hardware' },
  'docs': { title: '官方文档', path: '/docs' },
  'structure': { title: '项目结构', path: '/structure' },
  'mindmap': { title: '知识图谱', path: '/mindmap' },
  'techdocs': { title: '技术文档', path: '/techdocs' },
  'joint-mapping': { title: '关节映射', path: '/joint-mapping' },
  'flows': { title: '技术流程', path: '/flows' },
  'learning': { title: '学习进度', path: '/learning' }
}

const articleMap = {
  'overview': '系统架构概览',
  'hardware-intro': '硬件系统介绍',
  'firmware-guide': '固件开发指南',
  'sdk-usage': 'SDK 使用教程',
  'simulation-setup': '仿真环境配置'
}

const taskMap = {
  'hardware-buy-parts': '购买电子元件',
  'hardware-print': '3D打印零件',
  'firmware-flash': '固件烧录',
  'sdk-install': 'SDK安装',
  'first-test': '首次测试'
}

// 方法
function getArticleTitle(articleId) {
  return articleMap[articleId] || articleId
}

function getTaskTitle(taskId) {
  return taskMap[taskId] || taskId
}

function getPageTitle(pageId) {
  return pageMap[pageId]?.title || pageId
}

function getPagePath(pageId) {
  return pageMap[pageId]?.path || ''
}

function goToArticle(articleId) {
  router.push('/knowledge')
}

function goToTask(taskId) {
  router.push('/learning')
}

function goToPage(pageId) {
  const path = pageMap[pageId]?.path
  if (path) {
    router.push(path)
  }
}

function removeBookmark(type, id) {
  if (type === 'article') {
    bookmarksStore.removeArticleBookmark(id)
  } else if (type === 'task') {
    bookmarksStore.removeTaskBookmark(id)
  } else if (type === 'page') {
    bookmarksStore.removePageBookmark(id)
  }
  ElMessage.success('已移除收藏')
}

async function clearAll() {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有收藏吗？此操作不可恢复。',
      '警告',
      {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    bookmarksStore.clearAllBookmarks()
    ElMessage.success('已清空所有收藏')
  } catch {
    // 用户取消
  }
}

function exportData() {
  const data = bookmarksStore.exportBookmarks()
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `bookmarks-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('书签已导出')
}

function importData() {
  importFile.value = null
  importDialogVisible.value = true
}

function handleFileChange(file) {
  importFile.value = file.raw
}

async function confirmImport() {
  if (!importFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  try {
    const text = await importFile.value.text()
    const data = JSON.parse(text)
    bookmarksStore.importBookmarks(data)
    ElMessage.success('书签导入成功')
    importDialogVisible.value = false
  } catch (error) {
    ElMessage.error('导入失败：' + error.message)
  }
}
</script>

<style scoped>
.bookmarks-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0 0 8px 0;
}

.header-content p {
  margin: 0;
  color: #909399;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 28px;
  color: white;
}

.stat-icon.articles {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.tasks {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.pages {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.bookmarks-tabs {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.empty-state {
  padding: 60px;
  text-align: center;
}

.bookmark-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bookmark-item {
  transition: all 0.3s;
}

.bookmark-item:hover {
  transform: translateX(4px);
}

.bookmark-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.bookmark-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f9ff;
  border-radius: 10px;
  font-size: 24px;
  color: #409eff;
}

.bookmark-icon.tasks {
  background: #fff0f0;
  color: #f56c6c;
}

.bookmark-icon.pages {
  background: #f0fff0;
  color: #67c23a;
}

.bookmark-info {
  flex: 1;
}

.bookmark-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.bookmark-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-path {
  font-size: 12px;
  color: #c0c4cc;
}

.bookmark-actions {
  display: flex;
  gap: 4px;
}
</style>
