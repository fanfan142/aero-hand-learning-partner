<template>
  <el-dialog
    v-model="dialogVisible"
    title="🔍 全局搜索"
    width="600px"
    :close-on-click-modal="true"
    class="global-search-dialog"
    @keydown="handleKeydown"
  >
    <!-- 搜索输入 -->
    <div class="search-input-wrapper">
      <el-input
        ref="searchInputRef"
        v-model="searchQuery"
        placeholder="输入关键词搜索..."
        size="large"
        clearable
        @input="handleSearch"
        @keydown.enter="handleEnter"
        @keydown.up.prevent="handleUp"
        @keydown.down.prevent="handleDown"
        @keydown.esc="handleEsc"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 快捷键提示 -->
    <div class="search-hints">
      <span class="hint"><kbd>↑↓</kbd> 导航</span>
      <span class="hint"><kbd>Enter</kbd> 跳转</span>
      <span class="hint"><kbd>Esc</kbd> 关闭</span>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchQuery" class="search-results" ref="resultsRef">
      <div v-if="isSearching" class="search-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>搜索中...</span>
      </div>

      <div v-else-if="results.length === 0" class="search-empty">
        <el-empty description="未找到相关结果" :image-size="80" />
      </div>

      <div v-else class="results-list">
        <div
          v-for="(result, index) in results"
          :key="result.id"
          :class="['result-item', { highlighted: index === highlightedIndex }]"
          @click="selectResult(result)"
          @mouseenter="highlightedIndex = index"
        >
          <div class="result-icon">
            <el-icon><component :is="getIcon(result.type)" /></el-icon>
          </div>
          <div class="result-content">
            <div class="result-title" v-html="highlightKeyword(result.title)"></div>
            <div class="result-description" v-html="highlightKeyword(result.description)"></div>
            <div class="result-meta">
              <el-tag size="small" :type="getTypeColor(result.type)">
                {{ getTypeLabel(result.type) }}
              </el-tag>
              <span v-if="result.path" class="result-path">{{ result.path }}</span>
            </div>
          </div>
          <div class="result-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索历史 -->
    <div v-else class="search-history">
      <div v-if="recentSearches.length > 0" class="history-section">
        <div class="section-header">
          <span class="section-title">最近搜索</span>
          <el-button text size="small" @click="clearHistory">清空</el-button>
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
          <span class="section-title">快捷搜索</span>
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
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useSearchStore } from '@/stores/search'
import {
  Search, Loading, ArrowRight,
  Document, Odometer, Box, Notebook, Connection,
  Clock, Promotion, Setting, Box as BoxIcon, Cpu
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

  searchTimeout = setTimeout(() => {
    // 模拟搜索结果
    const query = searchQuery.value.toLowerCase()
    const mockResults = generateMockResults(query)
    results.value = mockResults
    highlightedIndex.value = mockResults.length > 0 ? 0 : -1
    isSearching.value = false
  }, 200)
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
  const regex = new RegExp(`(${searchQuery.value})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
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
}

function handleDown() {
  if (results.value.length === 0) return
  highlightedIndex.value = (highlightedIndex.value + 1) % results.value.length
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
  searchStore.addToHistory(searchQuery.value)

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
  }
})
</script>

<style scoped>
.search-input-wrapper {
  margin-bottom: 12px;
}

.search-hints {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 12px;
}

.hint {
  color: #909399;
}

.hint kbd {
  display: inline-block;
  padding: 2px 6px;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-family: monospace;
  margin-right: 4px;
}

.search-results {
  max-height: 400px;
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
  gap: 8px;
  color: #909399;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.result-item:hover,
.result-item.highlighted {
  background: #f5f7fa;
}

.result-item.highlighted {
  background: #ecf5ff;
  border-left: 3px solid #409eff;
}

.result-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f9ff;
  border-radius: 8px;
  color: #409eff;
  font-size: 20px;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.result-title :deep(mark) {
  background: #fef0b3;
  padding: 0 2px;
  border-radius: 2px;
}

.result-description {
  font-size: 13px;
  color: #909399;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-path {
  font-size: 12px;
  color: #c0c4cc;
}

.result-arrow {
  color: #c0c4cc;
}

.search-history {
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
  color: #303133;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tag {
  cursor: pointer;
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
  background: #f5f7fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-item:hover {
  background: #ecf5ff;
  color: #409eff;
}

:deep(.global-search-dialog) {
  border-radius: 12px;
}
</style>
