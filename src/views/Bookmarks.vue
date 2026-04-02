<template>
  <div class="bookmarks-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="8" animated />
    </div>

    <template v-else>
      <!-- 页面标题 -->
      <div class="page-header card mb-3">
        <div class="header-content">
          <h2>📌 我的收藏</h2>
          <p>管理您的学习书签和收藏内容</p>
        </div>
        <div class="header-actions">
          <el-button @click="showImportDialog">
            <el-icon><Upload /></el-icon>
            导入
          </el-button>
          <el-button @click="exportData" :disabled="totalCount === 0">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <el-button type="danger" @click="clearAll" :disabled="totalCount === 0">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="8" :sm="8" :md="6">
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
        <el-col :xs="8" :sm="8" :md="6">
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
        <el-col :xs="8" :sm="8" :md="6">
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
        <el-col :xs="12" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon tags">
              <el-icon><PriceTag /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ bookmarksStore.tagsCount }}</div>
              <div class="stat-label">使用标签</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 标签筛选和搜索 -->
      <el-card shadow="hover" class="filter-card mb-3">
        <el-row :gutter="16" align="middle">
          <el-col :xs="24" :sm="12" :md="8">
            <el-input
              v-model="searchQuery"
              placeholder="搜索书签..."
              clearable
              :prefix-icon="Search"
            >
            </el-input>
          </el-col>
          <el-col :xs="24" :sm="12" :md="16">
            <div class="tag-filters">
              <span class="filter-label">标签筛选:</span>
              <el-radio-group v-model="tagFilter" size="small">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button
                  v-for="tag in availableTags"
                  :key="tag"
                  :label="tag"
                >
                  {{ tag }}
                </el-radio-button>
              </el-radio-group>
            </div>
          </el-col>
        </el-row>

        <!-- 批量操作栏 -->
        <div v-if="selectedBookmarks.length > 0" class="batch-actions">
          <el-alert type="info" :closable="false" show-icon>
            <template #title>
              已选择 {{ selectedBookmarks.length }} 个书签
              <el-button size="small" text @click="clearSelection">
                取消选择
              </el-button>
            </template>
            <div class="batch-buttons">
              <el-button size="small" type="primary" @click="batchAddTag">
                <el-icon><PriceTag /></el-icon>
                添加标签
              </el-button>
              <el-button size="small" type="danger" @click="batchDelete">
                <el-icon><Delete /></el-icon>
                批量删除
              </el-button>
            </div>
          </el-alert>
        </div>
      </el-card>

      <!-- 标签管理 -->
      <el-card shadow="hover" class="tags-management-card mb-3" v-if="bookmarksStore.allTags.length > 0">
        <template #header>
          <div class="card-header">
            <span>🏷️ 标签管理</span>
            <el-button size="small" text @click="showTagManager = !showTagManager">
              {{ showTagManager ? '收起' : '展开' }}
            </el-button>
          </div>
        </template>
        <div v-if="showTagManager" class="tags-content">
          <el-tag
            v-for="tag in bookmarksStore.allTags"
            :key="tag.name"
            :type="tag.count > 0 ? 'primary' : 'info'"
            closable
            @close="deleteTag(tag.name)"
            class="tag-item"
          >
            {{ tag.name }} ({{ tag.count }})
          </el-tag>
        </div>
      </el-card>

      <!-- 标签页 -->
      <el-tabs v-model="activeTab" class="bookmarks-tabs">
        <!-- 收藏的文章 -->
        <el-tab-pane name="articles">
          <template #label>
            <span class="tab-label">
              <el-icon><Document /></el-icon>
              收藏文章 ({{ bookmarksStore.bookmarkedArticlesCount }})
            </span>
          </template>
          <div v-if="bookmarksStore.bookmarkedArticlesCount === 0" class="empty-state">
            <el-empty description="暂无收藏文章">
              <el-button type="primary" @click="$router.push('/knowledge')">
                去知识库看看
              </el-button>
            </el-empty>
          </div>
          <div v-else class="bookmark-list">
            <el-card
              v-for="item in filteredArticles"
              :key="item.id"
              :class="['bookmark-item', { selected: selectedBookmarks.includes(item.id) }]"
              shadow="hover"
            >
              <div class="bookmark-content">
                <el-checkbox
                  v-model="item.selected"
                  @change="toggleSelect(item.id)"
                  class="bookmark-checkbox"
                />
                <div class="bookmark-icon articles">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="bookmark-info">
                  <div class="bookmark-title">{{ item.title }}</div>
                  <div class="bookmark-meta">
                    <el-tag size="small" type="info">文章</el-tag>
                    <el-tag
                      v-for="tag in item.tags"
                      :key="tag"
                      size="small"
                      class="item-tag"
                    >
                      {{ tag }}
                    </el-tag>
                    <span v-if="item.note" class="bookmark-note">
                      <el-icon><Comment /></el-icon>
                      {{ item.note }}
                    </span>
                  </div>
                </div>
                <div class="bookmark-actions">
                  <el-button text size="small" @click="previewBookmark(item, 'article')">
                    <el-icon><View /></el-icon>
                  </el-button>
                  <el-button text size="small" @click="editNote('article', item.id)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button text size="small" @click="goToArticle(item.id)">
                    <el-icon><ArrowRight /></el-icon>
                  </el-button>
                  <el-button text type="danger" size="small" @click="removeBookmark('article', item.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
        </el-tab-pane>

        <!-- 收藏的任务 -->
        <el-tab-pane name="tasks">
          <template #label>
            <span class="tab-label">
              <el-icon><Odometer /></el-icon>
              收藏任务 ({{ bookmarksStore.bookmarkedTasksCount }})
            </span>
          </template>
          <div v-if="bookmarksStore.bookmarkedTasksCount === 0" class="empty-state">
            <el-empty description="暂无收藏任务">
              <el-button type="primary" @click="$router.push('/learning')">
                去学习中心
              </el-button>
            </el-empty>
          </div>
          <div v-else class="bookmark-list">
            <el-card
              v-for="item in filteredTasks"
              :key="item.id"
              :class="['bookmark-item', { selected: selectedBookmarks.includes(item.id) }]"
              shadow="hover"
            >
              <div class="bookmark-content">
                <el-checkbox
                  v-model="item.selected"
                  @change="toggleSelect(item.id)"
                  class="bookmark-checkbox"
                />
                <div class="bookmark-icon tasks">
                  <el-icon><Odometer /></el-icon>
                </div>
                <div class="bookmark-info">
                  <div class="bookmark-title">{{ item.title }}</div>
                  <div class="bookmark-meta">
                    <el-tag size="small" type="success">任务</el-tag>
                    <el-tag
                      v-for="tag in item.tags"
                      :key="tag"
                      size="small"
                      class="item-tag"
                    >
                      {{ tag }}
                    </el-tag>
                    <span v-if="item.note" class="bookmark-note">
                      <el-icon><Comment /></el-icon>
                      {{ item.note }}
                    </span>
                  </div>
                </div>
                <div class="bookmark-actions">
                  <el-button text size="small" @click="previewBookmark(item, 'task')">
                    <el-icon><View /></el-icon>
                  </el-button>
                  <el-button text size="small" @click="editNote('task', item.id)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button text size="small" @click="goToTask(item.id)">
                    <el-icon><ArrowRight /></el-icon>
                  </el-button>
                  <el-button text type="danger" size="small" @click="removeBookmark('task', item.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
        </el-tab-pane>

        <!-- 收藏的页面 -->
        <el-tab-pane name="pages">
          <template #label>
            <span class="tab-label">
              <el-icon><Connection /></el-icon>
              收藏页面 ({{ bookmarksStore.bookmarkedPagesCount }})
            </span>
          </template>
          <div v-if="bookmarksStore.bookmarkedPagesCount === 0" class="empty-state">
            <el-empty description="暂无收藏页面" />
          </div>
          <div v-else class="bookmark-list">
            <el-card
              v-for="item in filteredPages"
              :key="item.id"
              :class="['bookmark-item', { selected: selectedBookmarks.includes(item.id) }]"
              shadow="hover"
            >
              <div class="bookmark-content">
                <el-checkbox
                  v-model="item.selected"
                  @change="toggleSelect(item.id)"
                  class="bookmark-checkbox"
                />
                <div class="bookmark-icon pages">
                  <el-icon><Connection /></el-icon>
                </div>
                <div class="bookmark-info">
                  <div class="bookmark-title">{{ item.title }}</div>
                  <div class="bookmark-meta">
                    <el-tag size="small" type="warning">页面</el-tag>
                    <span class="page-path">{{ item.path }}</span>
                    <el-tag
                      v-for="tag in item.tags"
                      :key="tag"
                      size="small"
                      class="item-tag"
                    >
                      {{ tag }}
                    </el-tag>
                    <span v-if="item.note" class="bookmark-note">
                      <el-icon><Comment /></el-icon>
                      {{ item.note }}
                    </span>
                  </div>
                </div>
                <div class="bookmark-actions">
                  <el-button text size="small" @click="previewBookmark(item, 'page')">
                    <el-icon><View /></el-icon>
                  </el-button>
                  <el-button text size="small" @click="editNote('page', item.id)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button text size="small" @click="goToPage(item.id)">
                    <el-icon><ArrowRight /></el-icon>
                  </el-button>
                  <el-button text type="danger" size="small" @click="removeBookmark('page', item.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </template>

    <!-- 导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入书签数据" width="500px">
      <div class="import-content">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :limit="1"
          accept=".json"
          :on-change="handleFileChange"
          drag
        >
          <el-icon class="upload-icon"><Upload /></el-icon>
          <div class="upload-text">
            拖拽 JSON 文件到此处或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="upload-tip">
              支持从其他设备导出的书签备份文件（.json 格式）
            </div>
          </template>
        </el-upload>

        <div v-if="importFile" class="import-preview">
          <el-alert type="info" :closable="false">
            <template #title>
              已选择: {{ importFile.name }}
            </template>
          </el-alert>
        </div>
      </div>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmImport" :disabled="!importFile">
          确认导入
        </el-button>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewDialogVisible" title="书签预览" width="500px">
      <div v-if="previewItem" class="preview-content">
        <div class="preview-icon">
          <el-icon v-if="previewType === 'article'"><Document /></el-icon>
          <el-icon v-else-if="previewType === 'task'"><Odometer /></el-icon>
          <el-icon v-else><Connection /></el-icon>
        </div>
        <h3 class="preview-title">{{ previewItem.title }}</h3>
        <div class="preview-meta">
          <el-tag :type="previewType === 'article' ? 'info' : previewType === 'task' ? 'success' : 'warning'">
            {{ previewType === 'article' ? '文章' : previewType === 'task' ? '任务' : '页面' }}
          </el-tag>
          <el-tag
            v-for="tag in previewItem.tags"
            :key="tag"
            size="small"
          >
            {{ tag }}
          </el-tag>
        </div>
        <div v-if="previewItem.note" class="preview-note">
          <div class="note-label">
            <el-icon><Comment /></el-icon>
            笔记:
          </div>
          <div class="note-content">{{ previewItem.note }}</div>
        </div>
        <div v-if="previewType === 'page'" class="preview-path">
          <div class="path-label">
            <el-icon><Link /></el-icon>
            路径:
          </div>
          <div class="path-value">{{ previewItem.path }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="goToPreviewItem">
          前往
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </template>
    </el-dialog>

    <!-- 添加标签对话框 -->
    <el-dialog v-model="addTagDialogVisible" title="添加标签" width="400px">
      <div class="add-tag-content">
        <el-input
          v-model="newTagName"
          placeholder="输入新标签名称"
          @keyup.enter="confirmAddTag"
        >
          <template #prefix>
            <el-icon><PriceTag /></el-icon>
          </template>
        </el-input>
        <div class="existing-tags">
          <span class="existing-label">或选择已有标签:</span>
          <el-tag
            v-for="tag in bookmarksStore.allTags"
            :key="tag.name"
            :type="tag.count > 0 ? 'primary' : 'info'"
            class="tag-option"
            @click="selectExistingTag(tag.name)"
          >
            {{ tag.name }}
          </el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="addTagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddTag" :disabled="!newTagName && !selectedExistingTag">
          确认
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑笔记对话框 -->
    <el-dialog v-model="editNoteDialogVisible" title="编辑笔记" width="500px">
      <div class="edit-note-content">
        <el-input
          v-model="editingNote"
          type="textarea"
          :rows="4"
          placeholder="添加笔记..."
        />
      </div>
      <template #footer>
        <el-button @click="editNoteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEditNote">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookmarksStore } from '@/stores/bookmarks'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download, Upload, Delete, Document, Odometer, Connection,
  ArrowRight, View, Edit, Comment, PriceTag, Search, Link
} from '@element-plus/icons-vue'

const router = useRouter()
const bookmarksStore = useBookmarksStore()

// 状态
const loading = ref(true)
const activeTab = ref('articles')
const searchQuery = ref('')
const tagFilter = ref('all')
const selectedBookmarks = ref([])
const showTagManager = ref(false)
const importDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const addTagDialogVisible = ref(false)
const editNoteDialogVisible = ref(false)

// 文件导入
const importFile = ref(null)
const uploadRef = ref(null)

// 预览
const previewItem = ref(null)
const previewType = ref('')

// 标签
const newTagName = ref('')
const selectedExistingTag = ref('')

// 笔记编辑
const editingNoteId = ref('')
const editingNoteType = ref('')
const editingNote = ref('')

// 页面/文章/任务数据映射
const pageMap = {
  'knowledge': { title: '知识库', path: '/knowledge', tags: ['文档', '学习'] },
  'hardware': { title: '硬件清单', path: '/hardware', tags: ['硬件', '参考'] },
  'docs': { title: '官方文档', path: '/docs', tags: ['文档'] },
  'structure': { title: '项目结构', path: '/structure', tags: ['文档'] },
  'mindmap': { title: '知识图谱', path: '/mindmap', tags: ['可视化'] },
  'techdocs': { title: '技术文档', path: '/techdocs', tags: ['文档', '技术'] },
  'joint-mapping': { title: '关节映射', path: '/joint-mapping', tags: ['硬件', '技术'] },
  'flows': { title: '技术流程', path: '/flows', tags: ['技术', '流程'] },
  'learning': { title: '学习进度', path: '/learning', tags: ['学习', '进度'] }
}

const articleMap = {
  'overview': { title: '系统架构概览', tags: ['架构'] },
  'hardware-intro': { title: '硬件系统介绍', tags: ['硬件'] },
  'firmware-guide': { title: '固件开发指南', tags: ['固件', '开发'] },
  'sdk-usage': { title: 'SDK 使用教程', tags: ['SDK', '教程'] },
  'simulation-setup': { title: '仿真环境配置', tags: ['仿真', '环境'] }
}

const taskMap = {
  'hardware-buy-parts': { title: '购买电子元件', tags: ['硬件', '采购'] },
  'hardware-print': { title: '3D打印零件', tags: ['硬件', '3D打印'] },
  'firmware-flash': { title: '固件烧录', tags: ['固件', '烧录'] },
  'sdk-install': { title: 'SDK安装', tags: ['SDK', '安装'] },
  'first-test': { title: '首次测试', tags: ['测试'] }
}

// 计算属性
const totalCount = computed(() => bookmarksStore.totalBookmarksCount)

const availableTags = computed(() => {
  return bookmarksStore.allTags.map(t => t.name)
})

// 过滤后的数据
const filteredArticles = computed(() => {
  const ids = Array.from(bookmarksStore.bookmarkedArticles)
  let items = ids.map(id => {
    const data = articleMap[id] || { title: id, tags: [] }
    const note = bookmarksStore.getBookmarkNote('article', id)
    return {
      id,
      ...data,
      note: note?.text || '',
      selected: false
    }
  })

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.note.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  if (tagFilter.value !== 'all') {
    items = items.filter(item => item.tags.includes(tagFilter.value))
  }

  return items
})

const filteredTasks = computed(() => {
  const ids = Array.from(bookmarksStore.bookmarkedTasks)
  let items = ids.map(id => {
    const data = taskMap[id] || { title: id, tags: [] }
    const note = bookmarksStore.getBookmarkNote('task', id)
    return {
      id,
      ...data,
      note: note?.text || '',
      selected: false
    }
  })

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.note.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  if (tagFilter.value !== 'all') {
    items = items.filter(item => item.tags.includes(tagFilter.value))
  }

  return items
})

const filteredPages = computed(() => {
  const ids = Array.from(bookmarksStore.bookmarkedPages)
  let items = ids.map(id => {
    const data = pageMap[id] || { title: id, path: '', tags: [] }
    const note = bookmarksStore.getBookmarkNote('page', id)
    return {
      id,
      ...data,
      note: note?.text || '',
      selected: false
    }
  })

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.note.toLowerCase().includes(query) ||
      item.path.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  if (tagFilter.value !== 'all') {
    items = items.filter(item => item.tags.includes(tagFilter.value))
  }

  return items
})

// 方法
function goToArticle(articleId) {
  router.push('/knowledge')
}

function goToTask(taskId) {
  router.push('/learning')
}

function goToPage(pageId) {
  const data = pageMap[pageId]
  if (data?.path) {
    router.push(data.path)
  }
}

function toggleSelect(id) {
  const index = selectedBookmarks.value.indexOf(id)
  if (index === -1) {
    selectedBookmarks.value.push(id)
  } else {
    selectedBookmarks.value.splice(index, 1)
  }
}

function clearSelection() {
  selectedBookmarks.value = []
  // 重置所有选中状态
  filteredArticles.value.forEach(item => item.selected = false)
  filteredTasks.value.forEach(item => item.selected = false)
  filteredPages.value.forEach(item => item.selected = false)
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

function showImportDialog() {
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
    importFile.value = null
  } catch (error) {
    ElMessage.error('导入失败：' + error.message)
  }
}

function previewBookmark(item, type) {
  previewItem.value = item
  previewType.value = type
  previewDialogVisible.value = true
}

function goToPreviewItem() {
  previewDialogVisible.value = false
  if (previewType.value === 'article') {
    goToArticle(previewItem.value.id)
  } else if (previewType.value === 'task') {
    goToTask(previewItem.value.id)
  } else if (previewType.value === 'page') {
    goToPage(previewItem.value.id)
  }
}

function editNote(type, id) {
  editingNoteType.value = type
  editingNoteId.value = id
  const note = bookmarksStore.getBookmarkNote(type, id)
  editingNote.value = note?.text || ''
  editNoteDialogVisible.value = true
}

function confirmEditNote() {
  bookmarksStore.setBookmarkNote(editingNoteType.value, editingNoteId.value, editingNote.value)
  ElMessage.success('笔记已保存')
  editNoteDialogVisible.value = false
}

function batchAddTag() {
  newTagName.value = ''
  selectedExistingTag.value = ''
  addTagDialogVisible.value = true
}

function selectExistingTag(tagName) {
  selectedExistingTag.value = tagName
  newTagName.value = tagName
}

function confirmAddTag() {
  const tag = newTagName.value || selectedExistingTag.value
  if (!tag) {
    ElMessage.warning('请输入或选择标签')
    return
  }

  // 为选中的书签添加标签
  selectedBookmarks.value.forEach(id => {
    const type = getBookmarkType(id)
    if (type) {
      bookmarksStore.addTag(type, id, tag)
    }
  })

  ElMessage.success(`已为 ${selectedBookmarks.value.length} 个书签添加标签「${tag}」`)
  addTagDialogVisible.value = false
  clearSelection()
}

function batchDelete() {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedBookmarks.value.length} 个书签吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    selectedBookmarks.value.forEach(id => {
      const type = getBookmarkType(id)
      if (type) {
        if (type === 'article') {
          bookmarksStore.removeArticleBookmark(id)
        } else if (type === 'task') {
          bookmarksStore.removeTaskBookmark(id)
        } else if (type === 'page') {
          bookmarksStore.removePageBookmark(id)
        }
      }
    })
    ElMessage.success(`已删除 ${selectedBookmarks.value.length} 个书签`)
    clearSelection()
  }).catch(() => {})
}

function deleteTag(tagName) {
  ElMessageBox.confirm(
    `确定要删除标签「${tagName}」吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    bookmarksStore.deleteTag(tagName)
    ElMessage.success('标签已删除')
  }).catch(() => {})
}

function getBookmarkType(id) {
  if (bookmarksStore.isArticleBookmarked(id)) return 'article'
  if (bookmarksStore.isTaskBookmarked(id)) return 'task'
  if (bookmarksStore.isPageBookmarked(id)) return 'page'
  return null
}

// 扩展 bookmarksStore
bookmarksStore.allTags = computed(() => {
  const tagCounts = {}
  const notes = bookmarksStore.bookmarksNotes

  Object.entries(notes).forEach(([key, note]) => {
    if (note.tags) {
      note.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    }
  })

  return Object.entries(tagCounts).map(([name, count]) => ({ name, count }))
})

bookmarksStore.tagsCount = computed(() => {
  return bookmarksStore.allTags.value?.length || 0
})

bookmarksStore.addTag = function(type, id, tagName) {
  const key = `${type}-${id}`
  const note = bookmarksStore.bookmarksNotes[key] || { text: '', tags: [] }
  if (!note.tags) note.tags = []
  if (!note.tags.includes(tagName)) {
    note.tags.push(tagName)
    note.updatedAt = Date.now()
    bookmarksStore.bookmarksNotes[key] = note
    bookmarksStore.saveToLocalStorage()
  }
}

bookmarksStore.deleteTag = function(tagName) {
  Object.keys(bookmarksStore.bookmarksNotes).forEach(key => {
    const note = bookmarksStore.bookmarksNotes[key]
    if (note.tags) {
      const index = note.tags.indexOf(tagName)
      if (index !== -1) {
        note.tags.splice(index, 1)
        note.updatedAt = Date.now()
      }
    }
  })
  bookmarksStore.saveToLocalStorage()
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style scoped>
.bookmarks-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.loading-state {
  padding: 40px;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
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
  flex-wrap: wrap;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 26px;
  color: white;
  flex-shrink: 0;
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

.stat-icon.tags {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 筛选卡片 */
.filter-card {
  margin-bottom: 20px;
}

.tag-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

/* 批量操作 */
.batch-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.batch-buttons {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

/* 标签管理 */
.tags-management-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tags-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin-right: 0;
}

/* 标签页 */
.bookmarks-tabs {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
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

.bookmark-item.selected {
  border: 2px solid #409eff;
  background: #ecf5ff;
}

.bookmark-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bookmark-checkbox {
  flex-shrink: 0;
}

.bookmark-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.bookmark-icon.articles {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bookmark-icon.tasks {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.bookmark-icon.pages {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.bookmark-info {
  flex: 1;
  min-width: 0;
}

.bookmark-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bookmark-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.item-tag {
  margin-left: 0;
}

.bookmark-note {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 2px;
}

.page-path {
  font-size: 12px;
  color: #c0c4cc;
}

.bookmark-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

/* 导入对话框 */
.import-content {
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 14px;
  color: #606266;
}

.upload-text em {
  color: #409eff;
  font-style: normal;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.import-preview {
  margin-top: 16px;
}

/* 预览对话框 */
.preview-content {
  text-align: center;
}

.preview-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.preview-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #303133;
}

.preview-meta {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.preview-note,
.preview-path {
  text-align: left;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
}

.note-label,
.path-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.note-content,
.path-value {
  font-size: 14px;
  color: #303133;
}

.path-value {
  font-family: monospace;
}

/* 添加标签对话框 */
.add-tag-content {
  text-align: center;
}

.existing-tags {
  margin-top: 16px;
  text-align: left;
}

.existing-label {
  font-size: 13px;
  color: #909399;
  display: block;
  margin-bottom: 8px;
}

.tag-option {
  margin: 4px;
  cursor: pointer;
}

.tag-option:hover {
  opacity: 0.8;
}

/* 笔记编辑 */
.edit-note-content {
  text-align: center;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .stat-card {
    padding: 16px;
    gap: 12px;
  }

  .stat-icon {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }

  .stat-value {
    font-size: 22px;
  }

  .bookmark-content {
    flex-wrap: wrap;
  }

  .bookmark-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 8px;
  }

  .tag-filters {
    width: 100%;
  }

  .filter-card :deep(.el-row) {
    flex-direction: column;
  }
}

.mb-3 {
  margin-bottom: 20px;
}
</style>
