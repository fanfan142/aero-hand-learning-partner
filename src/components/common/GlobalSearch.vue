<template>
  <el-dialog
    v-model="dialogVisible"
    title="全局搜索"
    width="620px"
    :close-on-click-modal="true"
    class="global-search-dialog"
    @keydown="handleKeydown"
    destroy-on-close
  >
    <!-- 搜索输入 -->
    <div class="search-input-wrapper">
      <el-input
        ref="searchInputRef"
        v-model="searchQuery"
        placeholder="输入关键词搜索..."
        size="large"
        clearable
        autofocus
        @input="handleSearch"
        @keydown.enter="handleEnter"
        @keydown.up.prevent="handleUp"
        @keydown.down.prevent="handleDown"
        @keydown.esc="handleEsc"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #suffix v-if="searchQuery">
          <el-icon class="clear-icon" @click="clearSearch"><CircleClose /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchQuery" class="search-results" ref="resultsRef">
      <div v-if="isSearching" class="search-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>搜索中...</span>
      </div>

      <div v-else-if="results.length === 0" class="search-empty">
        <el-empty description="未找到相关结果" :image-size="80">
          <template #image>
            <el-icon :size="60" color="#c0c4cc"><Search /></el-icon>
          </template>
        </el-empty>
        <p class="empty-tip">试试其他关键词</p>
      </div>

      <div v-else class="results-container">
        <div class="results-header">
          <span class="results-count">找到 {{ results.length }} 个结果</span>
        </div>
        <div class="results-list">
          <div
            v-for="(result, index) in results"
            :key="result.id"
            :class="['result-item', { highlighted: index === highlightedIndex }]"
            @click="selectResult(result)"
            @mouseenter="highlightedIndex = index"
          >
            <div class="result-icon" :class="`type-${result.type}`">
              <el-icon><component :is="getIcon(result.type)" /></el-icon>
            </div>
            <div class="result-content">
              <div class="result-title" v-html="highlightKeyword(result.title)"></div>
              <div class="result-description" v-html="highlightKeyword(result.description)"></div>
              <div class="result-meta">
                <el-tag size="small" :type="getTypeColor(result.type)" effect="light">
                  <el-icon><component :is="getIcon(result.type)" /></el-icon>
                  {{ getTypeLabel(result.type) }}
                </el-tag>
                <span v-if="result.path" class="result-path">
                  <el-icon><Location /></el-icon>
                  {{ result.path }}
                </span>
              </div>
            </div>
            <div class="result-action">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索历史和建议 -->
    <div v-else class="search-empty-state">
      <!-- 搜索历史 -->
      <div v-if="recentSearches.length > 0" class="history-section">
        <div class="section-header">
          <span class="section-title">
            <el-icon><Clock /></el-icon>
            最近搜索
          </span>
          <el-button text size="small" @click="clearHistory" type="danger">清空</el-button>
        </div>
        <div class="history-tags">
          <el-tag
            v-for="keyword in recentSearches"
            :key="keyword"
            class="history-tag"
            closable
            @close="removeFromHistory(keyword)"
            @click="searchQuery = keyword; handleSearch()"
          >
            {{ keyword }}
          </el-tag>
        </div>
      </div>

      <!-- 搜索建议 -->
      <div class="suggestions-section">
        <div class="section-header">
          <span class="section-title">
            <el-icon><TrendCharts /></el-icon>
            快捷搜索
          </span>
        </div>
        <div class="suggestion-list">
          <div
            v-for="suggestion in suggestions"
            :key="suggestion.keyword"
            class="suggestion-item"
            @click="searchQuery = suggestion.keyword; handleSearch()"
          >
            <el-icon><component :is="suggestion.icon" /></el-icon>
            <span>{{ suggestion.keyword }}</span>
          </div>
        </div>
      </div>

      <!-- 快捷键提示 -->
      <div class="shortcuts-hint">
        <span class="hint"><kbd>↑</kbd><kbd>↓</kbd> 导航</span>
        <span class="hint"><kbd>Enter</kbd> 跳转</span>
        <span class="hint"><kbd>Esc</kbd> 关闭</span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useSearchStore } from '@/stores/search'
import {
  Search, Loading, ArrowRight, CircleClose, Location,
  Document, Odometer, Box, Notebook, Connection,
  Clock, Promotion, Setting, Box as BoxIcon, Cpu, TrendCharts
} from '@element-plus/icons-vue'

const router = useRouter()
const searchStore = useSearchStore()

// Refs
const dialogVisible = ref(false)
const searchInputRef = ref(null)
const resultsRef = ref(null)
const searchQuery = ref('')
const highlightedIndex = ref(-1)

// 搜索状态
const isSearching = ref(false)
const results = ref([])

// 搜索建议
const suggestions = [
  { keyword: 'ESP32-S3 固件', icon: Cpu },
  { keyword: 'HLS3606M 舵机', icon: Setting },
  { keyword: '关节映射', icon: BoxIcon },
  { keyword: '强化学习 PPO', icon: Promotion },
  { keyword: 'Sim2Real', icon: Connection }
]

// 计算属性
const recentSearches = computed(() => searchStore.recentSearches)

// 图标映射
const iconMap = {
  article: Document,
  task: Odometer,
  hardware: Box,
  doc: Notebook,
  flow: Connection
}

// 类型标签映射
const typeLabelMap = {
  article: '知识库',
  task: '任务',
  hardware: '硬件',
  doc: '文档',
  flow: '流程'
}

// 类型颜色映射
const typeColorMap = {
  article: '',
  task: 'success',
  hardware: 'warning',
  doc: 'info',
  flow: ''
}

function getIcon(type) {
  return iconMap[type] || Document
}

function getTypeLabel(type) {
  return typeLabelMap[type] || type
}

function getTypeColor(type) {
  return typeColorMap[type] || ''
}

// 监听对话框显示
watch(dialogVisible, (val) => {
  if (val) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  } else {
    // 关闭时清空
    searchQuery.value = ''
    results.value = []
    highlightedIndex.value = -1
  }
})

// 清空搜索
function clearSearch() {
  searchQuery.value = ''
  results.value = []
  highlightedIndex.value = -1
  searchInputRef.value?.focus()
}

// 搜索处理
let searchTimeout = null
function handleSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)

  if (!searchQuery.value.trim()) {
    results.value = []
    isSearching.value = false
    return
  }

  isSearching.value = true
  highlightedIndex.value = -1

  searchTimeout = setTimeout(() => {
    // 模拟搜索结果
    const query = searchQuery.value.toLowerCase()
    const mockResults = generateMockResults(query)
    results.value = mockResults
    highlightedIndex.value = mockResults.length > 0 ? 0 : -1
    isSearching.value = false
  }, 150)
}

// 生成模拟搜索结果
function generateMockResults(query) {
  const allItems = [
    { id: '1', title: 'ESP32-S3 开发指南', description: 'ESP32-S3 开发板使用教程和固件烧录指南', type: 'doc', path: '/techdocs' },
    { id: '2', title: 'HLS3606M 舵机控制', description: '智能总线舵机的控制原理和编程接口', type: 'hardware', path: '/hardware' },
    { id: '3', title: '关节映射可视化', description: '关节角度与舵机脉冲的转换关系图示', type: 'flow', path: '/joint-mapping' },
    { id: '4', title: '学习进度追踪', description: '系统化学习 Aero Hand 的八个阶段', type: 'task', path: '/learning' },
    { id: '5', title: '系统架构概览', description: 'Aero Hand 整体架构和数据流图解', type: 'article', path: '/knowledge' },
    { id: '6', title: '强化学习训练', description: '使用 PPO 算法在 MuJoCo 中训练机械手', type: 'article', path: '/knowledge' },
    { id: '7', title: 'Sim2Real 转移', description: '从仿真环境到真实硬件的参数迁移', type: 'doc', path: '/techdocs' },
    { id: '8', title: '硬件清单完整版', description: '所有零件的规格、采购链接和价格估算', type: 'hardware', path: '/hardware' }
  ]

  return allItems.filter(item =>
    item.title.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  )
}

// 高亮关键词
function highlightKeyword(text) {
  if (!text || !searchQuery.value) return text
  const regex = new RegExp(`(${escapeRegex(searchQuery.value)})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 转义正则特殊字符
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 键盘事件处理
function handleKeydown(e) {
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault()
      handleUp()
      break
    case 'ArrowDown':
      e.preventDefault()
      handleDown()
      break
    case 'Enter':
      e.preventDefault()
      handleEnter()
      break
    case 'Escape':
      handleEsc()
      break
  }
}

function handleUp() {
  if (results.value.length === 0) return
  highlightedIndex.value = highlightedIndex.value <= 0
    ? results.value.length - 1
    : highlightedIndex.value - 1
  scrollToHighlighted()
}

function handleDown() {
  if (results.value.length === 0) return
  highlightedIndex.value = (highlightedIndex.value + 1) % results.value.length
  scrollToHighlighted()
}

function scrollToHighlighted() {
  nextTick(() => {
    const highlighted = resultsRef.value?.querySelector('.result-item.highlighted')
    if (highlighted) {
      highlighted.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  })
}

function handleEnter() {
  if (results.value.length > 0 && highlightedIndex.value >= 0) {
    selectResult(results.value[highlightedIndex.value])
  }
}

function handleEsc() {
  dialogVisible.value = false
}

function selectResult(result) {
  // 添加到历史
  if (searchQuery.value.trim()) {
    searchStore.addToHistory(searchQuery.value.trim())
  }

  // 跳转到对应页面
  if (result.path) {
    router.push(result.path)
  }

  // 关闭对话框
  dialogVisible.value = false
}

function removeFromHistory(keyword) {
  searchStore.removeFromHistory(keyword)
}

function clearHistory() {
  searchStore.clearHistory()
}

// 暴露方法给外部调用
defineExpose({
  open: () => {
    dialogVisible.value = true
  },
  close: () => {
    dialogVisible.value = false
  },
  isVisible: () => dialogVisible.value
})
</script>

<style scoped>
.search-input-wrapper {
  margin-bottom: 16px;
  position: relative;
}

.search-input-wrapper :deep(.el-input__wrapper) {
  padding: 12px 16px;
  border-radius: 10px;
  transition: all 0.25s ease;
}

.search-input-wrapper :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.search-input-wrapper :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.clear-icon {
  cursor: pointer;
  color: #c0c4cc;
  transition: color 0.2s;
}

.clear-icon:hover {
  color: #909399;
}

.search-results {
  max-height: 420px;
  overflow-y: auto;
}

.search-loading,
.search-empty {
  padding: 40px;
  text-align: center;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-secondary, #909399);
}

.empty-tip {
  color: var(--text-secondary, #909399);
  font-size: 14px;
  margin-top: 8px;
}

.results-container {
  border-radius: 10px;
  overflow: hidden;
}

.results-header {
  padding: 8px 12px;
  background: var(--bg-hover, #f5f7fa);
  border-radius: 8px 8px 0 0;
}

.results-count {
  font-size: 12px;
  color: var(--text-secondary, #909399);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-item:hover,
.result-item.highlighted {
  background: var(--bg-hover, #f5f7fa);
}

.result-item.highlighted {
  background: rgba(102, 126, 234, 0.08);
  border-left: 3px solid var(--primary-color, #667eea);
  padding-left: 9px;
}

.result-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 10px;
  color: var(--primary-color, #667eea);
  font-size: 20px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.result-item:hover .result-icon,
.result-item.highlighted .result-icon {
  transform: scale(1.05);
}

.result-icon.type-hardware {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.1) 0%, rgba(245, 108, 108, 0.1) 100%);
  color: #e6a23c;
}

.result-icon.type-task {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.1) 0%, rgba(82, 196, 26, 0.1) 100%);
  color: #67c23a;
}

.result-icon.type-article {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%);
  color: #409eff;
}

.result-icon.type-doc {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.1) 0%, rgba(96, 98, 102, 0.1) 100%);
  color: #909399;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-weight: 600;
  color: var(--text-primary, #303133);
  margin-bottom: 4px;
  font-size: 15px;
}

.result-title :deep(mark) {
  background: rgba(245, 208, 50, 0.3);
  padding: 1px 3px;
  border-radius: 3px;
}

.result-description {
  font-size: 13px;
  color: var(--text-secondary, #909399);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-meta .el-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.result-path {
  font-size: 12px;
  color: var(--text-secondary, #c0c4cc);
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.result-action {
  color: var(--text-secondary, #c0c4cc);
  opacity: 0;
  transform: translateX(-5px);
  transition: all 0.2s ease;
}

.result-item:hover .result-action,
.result-item.highlighted .result-action {
  opacity: 1;
  transform: translateX(0);
}

/* 空状态样式 */
.search-empty-state {
  max-height: 400px;
  overflow-y: auto;
}

.history-section,
.suggestions-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-weight: 600;
  color: var(--text-primary, #303133);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tag {
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-tag:hover {
  transform: translateY(-1px);
}

.suggestion-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--bg-hover, #f5f7fa);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-regular, #606266);
}

.suggestion-item:hover {
  background: rgba(102, 126, 234, 0.1);
  color: var(--primary-color, #667eea);
  transform: translateY(-1px);
}

/* 快捷键提示 */
.shortcuts-hint {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 12px;
  background: var(--bg-hover, #f5f7fa);
  border-radius: 8px;
  margin-top: 16px;
}

.shortcuts-hint .hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary, #909399);
}

.shortcuts-hint kbd {
  display: inline-block;
  padding: 2px 6px;
  background: var(--bg-surface, #fff);
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 4px;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 11px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

:deep(.global-search-dialog) {
  border-radius: 14px;
}

:deep(.global-search-dialog .el-dialog__header) {
  padding: 16px 20px 0;
}

:deep(.global-search-dialog .el-dialog__body) {
  padding: 20px;
}
</style>
