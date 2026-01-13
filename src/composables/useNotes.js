/**
 * 笔记系统 Composable
 * 提供笔记编辑、管理的快捷方法
 */

import { ref, computed } from 'vue'
import { useNotesStore } from '@/stores/notes.js'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

/**
 * 笔记编辑器 Composable
 */
export function useNoteEditor() {
  const notesStore = useNotesStore()
  const currentNote = ref(null)
  const editorContent = ref('')
  const isPreviewMode = ref(false)
  const selectedTags = ref([])
  const selectedCategory = ref('默认')

  /**
   * 渲染 Markdown
   */
  const renderedContent = computed(() => {
    return md.render(editorContent.value)
  })

  /**
   * 创建新笔记
   */
  function createNewNote() {
    currentNote.value = null
    editorContent.value = ''
    selectedTags.value = []
    selectedCategory.value = '默认'
    isPreviewMode.value = false
  }

  /**
   * 加载笔记
   */
  function loadNote(noteId) {
    const note = notesStore.getNote(noteId)
    if (note) {
      currentNote.value = note
      editorContent.value = note.content
      selectedTags.value = [...(note.tags || [])]
      selectedCategory.value = note.category || '默认'
    }
  }

  /**
   * 保存笔记
   */
  function saveNote(title) {
    const noteData = {
      title: title || '无标题',
      content: editorContent.value,
      category: selectedCategory.value,
      tags: [...selectedTags.value]
    }

    if (currentNote.value) {
      notesStore.updateNote(currentNote.value.id, noteData)
    } else {
      currentNote.value = notesStore.createNote(noteData)
    }
  }

  /**
   * 添加标签
   */
  function addTag(tag) {
    if (!selectedTags.value.includes(tag)) {
      selectedTags.value.push(tag)
    }
  }

  /**
   * 移除标签
   */
  function removeTag(tag) {
    const index = selectedTags.value.indexOf(tag)
    if (index !== -1) {
      selectedTags.value.splice(index, 1)
    }
  }

  /**
   * 切换预览模式
   */
  function togglePreview() {
    isPreviewMode.value = !isPreviewMode.value
  }

  return {
    currentNote,
    editorContent,
    isPreviewMode,
    selectedTags,
    selectedCategory,
    renderedContent,
    createNewNote,
    loadNote,
    saveNote,
    addTag,
    removeTag,
    togglePreview
  }
}

/**
 * 代码片段管理 Composable
 */
export function useCodeSnippetManager() {
  const notesStore = useNotesStore()
  const currentSnippet = ref(null)
  const snippetCode = ref('')
  const snippetTitle = ref('')
  const snippetLanguage = ref('python')
  const snippetDescription = ref('')
  const snippetTags = ref([])

  /**
   * 创建新片段
   */
  function createNewSnippet() {
    currentSnippet.value = null
    snippetCode.value = ''
    snippetTitle.value = ''
    snippetLanguage.value = 'python'
    snippetDescription.value = ''
    snippetTags.value = []
  }

  /**
   * 保存片段
   */
  function saveSnippet() {
    const snippetData = {
      title: snippetTitle.value || '无标题',
      code: snippetCode.value,
      language: snippetLanguage.value,
      description: snippetDescription.value,
      tags: [...snippetTags.value]
    }

    if (currentSnippet.value) {
      notesStore.updateCodeSnippet(currentSnippet.value.id, snippetData)
    } else {
      currentSnippet.value = notesStore.addCodeSnippet(snippetData)
    }
  }

  /**
   * 加载片段
   */
  function loadSnippet(snippetId) {
    const snippet = notesStore.codeSnippets.find(s => s.id === snippetId)
    if (snippet) {
      currentSnippet.value = snippet
      snippetCode.value = snippet.code
      snippetTitle.value = snippet.title
      snippetLanguage.value = snippet.language
      snippetDescription.value = snippet.description || ''
      snippetTags.value = [...(snippet.tags || [])]
    }
  }

  /**
   * 复制代码到剪贴板
   */
  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code)
      return true
    } catch (error) {
      console.error('复制失败:', error)
      return false
    }
  }

  return {
    currentSnippet,
    snippetCode,
    snippetTitle,
    snippetLanguage,
    snippetDescription,
    snippetTags,
    createNewSnippet,
    saveSnippet,
    loadSnippet,
    copyCode
  }
}

/**
 * 笔记搜索 Composable
 */
export function useNoteSearch() {
  const notesStore = useNotesStore()
  const searchQuery = ref('')
  const selectedTag = ref(null)
  const selectedCategory = ref(null)

  /**
   * 搜索结果
   */
  const searchResults = computed(() => {
    let results = notesStore.notes

    // 按关键词搜索
    if (searchQuery.value) {
      results = notesStore.searchNotes(searchQuery.value)
    }

    // 按标签筛选
    if (selectedTag.value) {
      results = results.filter(note =>
        note.tags && note.tags.includes(selectedTag.value)
      )
    }

    // 按分类筛选
    if (selectedCategory.value) {
      results = results.filter(note =>
        note.category === selectedCategory.value
      )
    }

    return results
  })

  /**
   * 清空搜索
   */
  function clearSearch() {
    searchQuery.value = ''
    selectedTag.value = null
    selectedCategory.value = null
  }

  return {
    searchQuery,
    selectedTag,
    selectedCategory,
    searchResults,
    clearSearch
  }
}

/**
 * Markdown 渲染工具
 */
export function useMarkdown() {
  /**
   * 渲染 Markdown
   */
  function render(markdown) {
    return md.render(markdown)
  }

  /**
   * 渲染内联 Markdown
   */
  function renderInline(markdown) {
    return md.renderInline(markdown)
  }

  return {
    render,
    renderInline
  }
}
