/**
 * 笔记系统 Store
 * 管理学习笔记、书签、代码片段等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotesStore = defineStore('notes', () => {
  // ========== 状态 ==========
  const notes = ref([])
  const bookmarks = ref([])
  const codeSnippets = ref([])
  const categories = ref(['默认', '重要', '疑问', '技巧', '错误'])

  // ========== 计算属性 ==========

  /**
   * 按分类分组的笔记
   */
  const notesByCategory = computed(() => {
    const grouped = {}
    notes.value.forEach(note => {
      const category = note.category || '默认'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(note)
    })
    return grouped
  })

  /**
   * 搜索笔记
   */
  function searchNotes(query) {
    const lowerQuery = query.toLowerCase()
    return notes.value.filter(note =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    )
  }

  /**
   * 按标签筛选笔记
   */
  function filterNotesByTag(tag) {
    return notes.value.filter(note =>
      note.tags && note.tags.includes(tag)
    )
  }

  // ========== 方法 ==========

  /**
   * 创建笔记
   * @param {Object} noteData - 笔记数据
   * @returns {Object} 创建的笔记
   */
  function createNote(noteData) {
    const note = {
      id: `note-${Date.now()}`,
      title: noteData.title || '无标题',
      content: noteData.content || '',
      category: noteData.category || '默认',
      tags: noteData.tags || [],
      timestamp: Date.now(),
      updatedAt: Date.now(),
      source: noteData.source || null, // 来源：任务ID、页面等
      attachment: noteData.attachment || null // 附件：截图等
    }
    notes.value.unshift(note)
    saveToLocalStorage()
    return note
  }

  /**
   * 更新笔记
   * @param {string} noteId - 笔记ID
   * @param {Object} updates - 更新数据
   */
  function updateNote(noteId, updates) {
    const index = notes.value.findIndex(n => n.id === noteId)
    if (index !== -1) {
      notes.value[index] = {
        ...notes.value[index],
        ...updates,
        updatedAt: Date.now()
      }
      saveToLocalStorage()
    }
  }

  /**
   * 删除笔记
   * @param {string} noteId - 笔记ID
   */
  function deleteNote(noteId) {
    const index = notes.value.findIndex(n => n.id === noteId)
    if (index !== -1) {
      notes.value.splice(index, 1)
      saveToLocalStorage()
    }
  }

  /**
   * 获取笔记
   * @param {string} noteId - 笔记ID
   * @returns {Object|null} 笔记对象
   */
  function getNote(noteId) {
    return notes.value.find(n => n.id === noteId) || null
  }

  /**
   * 添加书签
   * @param {Object} bookmarkData - 书签数据
   */
  function addBookmark(bookmarkData) {
    const bookmark = {
      id: `bookmark-${Date.now()}`,
      title: bookmarkData.title,
      url: bookmarkData.url,
      path: bookmarkData.path,
      timestamp: Date.now(),
      notes: bookmarkData.notes || ''
    }
    bookmarks.value.unshift(bookmark)
    saveToLocalStorage()
  }

  /**
   * 删除书签
   * @param {string} bookmarkId - 书签ID
   */
  function removeBookmark(bookmarkId) {
    const index = bookmarks.value.findIndex(b => b.id === bookmarkId)
    if (index !== -1) {
      bookmarks.value.splice(index, 1)
      saveToLocalStorage()
    }
  }

  /**
   * 添加代码片段
   * @param {Object} snippetData - 代码片段数据
   */
  function addCodeSnippet(snippetData) {
    const snippet = {
      id: `snippet-${Date.now()}`,
      title: snippetData.title || '无标题',
      code: snippetData.code,
      language: snippetData.language || 'python',
      description: snippetData.description || '',
      tags: snippetData.tags || [],
      category: snippetData.category || '通用',
      timestamp: Date.now()
    }
    codeSnippets.value.unshift(snippet)
    saveToLocalStorage()
    return snippet
  }

  /**
   * 更新代码片段
   * @param {string} snippetId - 片段ID
   * @param {Object} updates - 更新数据
   */
  function updateCodeSnippet(snippetId, updates) {
    const index = codeSnippets.value.findIndex(s => s.id === snippetId)
    if (index !== -1) {
      codeSnippets.value[index] = {
        ...codeSnippets.value[index],
        ...updates
      }
      saveToLocalStorage()
    }
  }

  /**
   * 删除代码片段
   * @param {string} snippetId - 片段ID
   */
  function deleteCodeSnippet(snippetId) {
    const index = codeSnippets.value.findIndex(s => s.id === snippetId)
    if (index !== -1) {
      codeSnippets.value.splice(index, 1)
      saveToLocalStorage()
    }
  }

  /**
   * 搜索代码片段
   * @param {string} query - 搜索关键词
   */
  function searchCodeSnippets(query) {
    const lowerQuery = query.toLowerCase()
    return codeSnippets.value.filter(snippet =>
      snippet.title.toLowerCase().includes(lowerQuery) ||
      snippet.code.toLowerCase().includes(lowerQuery) ||
      (snippet.tags && snippet.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    )
  }

  /**
   * 获取所有标签
   */
  function getAllTags() {
    const tagSet = new Set()
    notes.value.forEach(note => {
      if (note.tags) {
        note.tags.forEach(tag => tagSet.add(tag))
      }
    })
    codeSnippets.value.forEach(snippet => {
      if (snippet.tags) {
        snippet.tags.forEach(tag => tagSet.add(tag))
      }
    })
    return Array.from(tagSet)
  }

  /**
   * 添加分类
   * @param {string} category - 分类名称
   */
  function addCategory(category) {
    if (!categories.value.includes(category)) {
      categories.value.push(category)
      saveToLocalStorage()
    }
  }

  /**
   * 导出所有数据
   */
  function exportAllData() {
    return {
      notes: notes.value,
      bookmarks: bookmarks.value,
      codeSnippets: codeSnippets.value,
      categories: categories.value,
      exportDate: new Date().toISOString()
    }
  }

  /**
   * 导入数据
   * @param {Object} data - 导入的数据
   */
  function importData(data) {
    if (data.notes) notes.value = data.notes
    if (data.bookmarks) bookmarks.value = data.bookmarks
    if (data.codeSnippets) codeSnippets.value = data.codeSnippets
    if (data.categories) {
      data.categories.forEach(cat => {
        if (!categories.value.includes(cat)) {
          categories.value.push(cat)
        }
      })
    }
    saveToLocalStorage()
  }

  /**
   * 保存到本地存储
   */
  function saveToLocalStorage() {
    try {
      localStorage.setItem('aero-hand-notes', JSON.stringify(notes.value))
      localStorage.setItem('aero-hand-bookmarks', JSON.stringify(bookmarks.value))
      localStorage.setItem('aero-hand-code-snippets', JSON.stringify(codeSnippets.value))
      localStorage.setItem('aero-hand-categories', JSON.stringify(categories.value))
    } catch (error) {
      console.error('保存笔记数据失败:', error)
    }
  }

  /**
   * 从本地存储加载
   */
  function loadFromLocalStorage() {
    try {
      const savedNotes = localStorage.getItem('aero-hand-notes')
      const savedBookmarks = localStorage.getItem('aero-hand-bookmarks')
      const savedSnippets = localStorage.getItem('aero-hand-code-snippets')
      const savedCategories = localStorage.getItem('aero-hand-categories')

      if (savedNotes) notes.value = JSON.parse(savedNotes)
      if (savedBookmarks) bookmarks.value = JSON.parse(savedBookmarks)
      if (savedSnippets) codeSnippets.value = JSON.parse(savedSnippets)
      if (savedCategories) categories.value = JSON.parse(savedCategories)
    } catch (error) {
      console.error('加载笔记数据失败:', error)
    }
  }

  /**
   * 清空所有数据
   */
  function clearAllData() {
    notes.value = []
    bookmarks.value = []
    codeSnippets.value = []
    saveToLocalStorage()
  }

  // 初始化
  loadFromLocalStorage()

  return {
    // 状态
    notes,
    bookmarks,
    codeSnippets,
    categories,

    // 计算属性
    notesByCategory,

    // 方法
    searchNotes,
    filterNotesByTag,
    createNote,
    updateNote,
    deleteNote,
    getNote,
    addBookmark,
    removeBookmark,
    addCodeSnippet,
    updateCodeSnippet,
    deleteCodeSnippet,
    searchCodeSnippets,
    getAllTags,
    addCategory,
    exportAllData,
    importData,
    clearAllData
  }
})
