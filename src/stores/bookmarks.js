/**
 * 书签/收藏 Store
 * 管理用户收藏的文章、页面、任务等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBookmarksStore = defineStore('bookmarks', () => {
  // ========== 状态 ==========

  // 收藏的文章
  const bookmarkedArticles = ref(new Set())

  // 收藏的页面
  const bookmarkedPages = ref(new Set())

  // 收藏的任务
  const bookmarkedTasks = ref(new Set())

  // 书签注释
  const bookmarksNotes = ref({})

  // ========== 计算属性 ==========

  const bookmarkedArticlesCount = computed(() => bookmarkedArticles.value.size)

  const bookmarkedPagesCount = computed(() => bookmarkedPages.value.size)

  const bookmarkedTasksCount = computed(() => bookmarkedTasks.value.size)

  const totalBookmarksCount = computed(() =>
    bookmarkedArticles.value.size +
    bookmarkedPages.value.size +
    bookmarkedTasks.value.size
  )

  // ========== 文章书签 ==========

  /**
   * 添加文章书签
   */
  function bookmarkArticle(articleId) {
    bookmarkedArticles.value.add(articleId)
    saveToLocalStorage()
  }

  /**
   * 移除文章书签
   */
  function removeArticleBookmark(articleId) {
    bookmarkedArticles.value.delete(articleId)
    delete bookmarksNotes.value[`article-${articleId}`]
    saveToLocalStorage()
  }

  /**
   * 切换文章书签
   */
  function toggleArticleBookmark(articleId) {
    if (bookmarkedArticles.value.has(articleId)) {
      removeArticleBookmark(articleId)
    } else {
      bookmarkArticle(articleId)
    }
  }

  /**
   * 检查文章是否已书签
   */
  function isArticleBookmarked(articleId) {
    return bookmarkedArticles.value.has(articleId)
  }

  // ========== 页面书签 ==========

  /**
   * 添加页面书签
   */
  function bookmarkPage(pageId) {
    bookmarkedPages.value.add(pageId)
    saveToLocalStorage()
  }

  /**
   * 移除页面书签
   */
  function removePageBookmark(pageId) {
    bookmarkedPages.value.delete(pageId)
    delete bookmarksNotes.value[`page-${pageId}`]
    saveToLocalStorage()
  }

  /**
   * 切换页面书签
   */
  function togglePageBookmark(pageId) {
    if (bookmarkedPages.value.has(pageId)) {
      removePageBookmark(pageId)
    } else {
      bookmarkPage(pageId)
    }
  }

  /**
   * 检查页面是否已书签
   */
  function isPageBookmarked(pageId) {
    return bookmarkedPages.value.has(pageId)
  }

  // ========== 任务书签 ==========

  /**
   * 添加任务书签
   */
  function bookmarkTask(taskId) {
    bookmarkedTasks.value.add(taskId)
    saveToLocalStorage()
  }

  /**
   * 移除任务书签
   */
  function removeTaskBookmark(taskId) {
    bookmarkedTasks.value.delete(taskId)
    delete bookmarksNotes.value[`task-${taskId}`]
    saveToLocalStorage()
  }

  /**
   * 切换任务书签
   */
  function toggleTaskBookmark(taskId) {
    if (bookmarkedTasks.value.has(taskId)) {
      removeTaskBookmark(taskId)
    } else {
      bookmarkTask(taskId)
    }
  }

  /**
   * 检查任务是否已书签
   */
  function isTaskBookmarked(taskId) {
    return bookmarkedTasks.value.has(taskId)
  }

  // ========== 书签注释 ==========

  /**
   * 设置书签注释
   */
  function setBookmarkNote(type, id, note) {
    const key = `${type}-${id}`
    if (note) {
      bookmarksNotes.value[key] = {
        text: note,
        updatedAt: Date.now()
      }
    } else {
      delete bookmarksNotes.value[key]
    }
    saveToLocalStorage()
  }

  /**
   * 获取书签注释
   */
  function getBookmarkNote(type, id) {
    const key = `${type}-${id}`
    return bookmarksNotes.value[key] || null
  }

  // ========== 导出/导入 ==========

  /**
   * 导出所有书签
   */
  function exportBookmarks() {
    return {
      articles: Array.from(bookmarkedArticles.value),
      pages: Array.from(bookmarkedPages.value),
      tasks: Array.from(bookmarkedTasks.value),
      notes: bookmarksNotes.value,
      exportedAt: Date.now()
    }
  }

  /**
   * 导入书签
   */
  function importBookmarks(data) {
    if (data.articles) {
      bookmarkedArticles.value = new Set(data.articles)
    }
    if (data.pages) {
      bookmarkedPages.value = new Set(data.pages)
    }
    if (data.tasks) {
      bookmarkedTasks.value = new Set(data.tasks)
    }
    if (data.notes) {
      bookmarksNotes.value = data.notes
    }
    saveToLocalStorage()
  }

  /**
   * 清空所有书签
   */
  function clearAllBookmarks() {
    bookmarkedArticles.value.clear()
    bookmarkedPages.value.clear()
    bookmarkedTasks.value.clear()
    bookmarksNotes.value = {}
    saveToLocalStorage()
  }

  // ========== 本地存储 ==========

  /**
   * 保存到本地存储
   */
  function saveToLocalStorage() {
    try {
      const data = {
        articles: Array.from(bookmarkedArticles.value),
        pages: Array.from(bookmarkedPages.value),
        tasks: Array.from(bookmarkedTasks.value),
        notes: bookmarksNotes.value
      }
      localStorage.setItem('aero-hand-bookmarks', JSON.stringify(data))
    } catch (error) {
      console.error('保存书签失败:', error)
    }
  }

  /**
   * 从本地存储加载
   */
  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('aero-hand-bookmarks')
      if (saved) {
        const data = JSON.parse(saved)
        if (data.articles) {
          bookmarkedArticles.value = new Set(data.articles)
        }
        if (data.pages) {
          bookmarkedPages.value = new Set(data.pages)
        }
        if (data.tasks) {
          bookmarkedTasks.value = new Set(data.tasks)
        }
        if (data.notes) {
          bookmarksNotes.value = data.notes
        }
      }
    } catch (error) {
      console.error('加载书签失败:', error)
    }
  }

  // 初始化时加载
  loadFromLocalStorage()

  return {
    // 状态
    bookmarkedArticles,
    bookmarkedPages,
    bookmarkedTasks,
    bookmarksNotes,

    // 计算属性
    bookmarkedArticlesCount,
    bookmarkedPagesCount,
    bookmarkedTasksCount,
    totalBookmarksCount,

    // 文章书签方法
    bookmarkArticle,
    removeArticleBookmark,
    toggleArticleBookmark,
    isArticleBookmarked,

    // 页面书签方法
    bookmarkPage,
    removePageBookmark,
    togglePageBookmark,
    isPageBookmarked,

    // 任务书签方法
    bookmarkTask,
    removeTaskBookmark,
    toggleTaskBookmark,
    isTaskBookmarked,

    // 注释方法
    setBookmarkNote,
    getBookmarkNote,

    // 导出导入
    exportBookmarks,
    importBookmarks,
    clearAllBookmarks,

    // 本地存储
    saveToLocalStorage,
    loadFromLocalStorage
  }
})
