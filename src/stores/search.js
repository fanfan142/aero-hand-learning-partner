/**
 * 全局搜索 Store
 * 管理搜索历史、搜索结果、筛选状态
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSearchStore = defineStore('search', () => {
  // ========== 状态 ==========

  // 搜索关键词
  const query = ref('')

  // 搜索历史
  const searchHistory = ref([])

  // 搜索结果
  const searchResults = ref([])

  // 是否正在搜索
  const isSearching = ref(false)

  // 搜索类型筛选
  const activeFilters = ref(new Set())

  // 高亮结果
  const highlightedIndex = ref(-1)

  // ========== 计算属性 ==========

  const hasQuery = computed(() => query.value.trim().length > 0)

  const hasResults = computed(() => searchResults.value.length > 0)

  const resultCount = computed(() => searchResults.value.length)

  const filteredResults = computed(() => {
    if (activeFilters.value.size === 0) {
      return searchResults.value
    }
    return searchResults.value.filter(result =>
      activeFilters.value.has(result.type)
    )
  })

  const recentSearches = computed(() => {
    return searchHistory.value.slice(0, 10)
  })

  // 搜索类型选项
  const searchTypes = [
    { id: 'article', label: '知识库文章', icon: 'Document' },
    { id: 'task', label: '学习任务', icon: 'Odometer' },
    { id: 'hardware', label: '硬件清单', icon: 'Box' },
    { id: 'doc', label: '技术文档', icon: 'Notebook' },
    { id: 'flow', label: '技术流程', icon: 'Connection' }
  ]

  // ========== 方法 ==========

  /**
   * 执行搜索
   */
  async function search(keyword) {
    if (!keyword || keyword.trim().length === 0) {
      clearResults()
      return
    }

    query.value = keyword.trim()
    isSearching.value = true

    // 添加到历史
    addToHistory(keyword.trim())

    // 模拟搜索延迟
    await new Promise(resolve => setTimeout(resolve, 200))

    // 这里可以实现实际的搜索逻辑
    // 目前是模拟搜索结果
    searchResults.value = []
    highlightedIndex.value = -1

    isSearching.value = false
  }

  /**
   * 添加到搜索历史
   */
  function addToHistory(keyword) {
    // 移除已存在的相同词
    searchHistory.value = searchHistory.value.filter(k => k !== keyword)
    // 添加到开头
    searchHistory.value.unshift(keyword)
    // 限制历史数量
    if (searchHistory.value.length > 20) {
      searchHistory.value = searchHistory.value.slice(0, 20)
    }
    saveHistoryToLocalStorage()
  }

  /**
   * 从历史删除
   */
  function removeFromHistory(keyword) {
    searchHistory.value = searchHistory.value.filter(k => k !== keyword)
    saveHistoryToLocalStorage()
  }

  /**
   * 清空搜索历史
   */
  function clearHistory() {
    searchHistory.value = []
    saveHistoryToLocalStorage()
  }

  /**
   * 清空结果
   */
  function clearResults() {
    searchResults.value = []
    highlightedIndex.value = -1
  }

  /**
   * 清空搜索
   */
  function clearSearch() {
    query.value = ''
    clearResults()
  }

  /**
   * 切换筛选
   */
  function toggleFilter(filterId) {
    if (activeFilters.value.has(filterId)) {
      activeFilters.value.delete(filterId)
    } else {
      activeFilters.value.add(filterId)
    }
  }

  /**
   * 清空所有筛选
   */
  function clearFilters() {
    activeFilters.value.clear()
  }

  /**
   * 高亮下一个结果
   */
  function highlightNext() {
    if (filteredResults.value.length === 0) return
    highlightedIndex.value = (highlightedIndex.value + 1) % filteredResults.value.length
  }

  /**
   * 高亮上一个结果
   */
  function highlightPrev() {
    if (filteredResults.value.length === 0) return
    highlightedIndex.value = highlightedIndex.value <= 0
      ? filteredResults.value.length - 1
      : highlightedIndex.value - 1
  }

  /**
   * 获取高亮结果
   */
  function getHighlightedResult() {
    if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredResults.value.length) {
      return filteredResults.value[highlightedIndex.value]
    }
    return null
  }

  /**
   * 保存历史到本地存储
   */
  function saveHistoryToLocalStorage() {
    try {
      localStorage.setItem('aero-hand-search-history', JSON.stringify(searchHistory.value))
    } catch (error) {
      console.error('保存搜索历史失败:', error)
    }
  }

  /**
   * 从本地存储加载历史
   */
  function loadHistoryFromLocalStorage() {
    try {
      const saved = localStorage.getItem('aero-hand-search-history')
      if (saved) {
        searchHistory.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('加载搜索历史失败:', error)
    }
  }

  // 初始化时加载
  loadHistoryFromLocalStorage()

  return {
    // 状态
    query,
    searchHistory,
    searchResults,
    isSearching,
    activeFilters,
    highlightedIndex,

    // 计算属性
    hasQuery,
    hasResults,
    resultCount,
    filteredResults,
    recentSearches,
    searchTypes,

    // 方法
    search,
    addToHistory,
    removeFromHistory,
    clearHistory,
    clearResults,
    clearSearch,
    toggleFilter,
    clearFilters,
    highlightNext,
    highlightPrev,
    getHighlightedResult,
    loadHistoryFromLocalStorage
  }
})
