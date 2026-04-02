<template>
  <div class="knowledge-base" :class="{ 'dark-mode': isDarkMode }">
    <!-- 顶部搜索栏 -->
    <div class="kb-header" :class="{ 'dark-header': isDarkMode }">
      <div class="header-content">
        <div class="header-title">
          <h2>📚 知识中心</h2>
          <p>深入理解 Aero Hand 的技术原理</p>
        </div>
        <div class="header-actions">
          <el-button @click="isDarkMode = !isDarkMode" circle>
            <el-icon><Moon v-if="!isDarkMode" /><Sunny v-else /></el-icon>
          </el-button>
          <el-button @click="toggleBookmark" circle :type="isBookmarked ? 'primary' : 'default'">
            <el-icon><Star /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索文章、代码、内容..."
          size="large"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-select v-model="searchScope" style="width: 120px">
              <el-option label="全部" value="all" />
              <el-option label="标题" value="title" />
              <el-option label="代码" value="code" />
            </el-select>
          </template>
        </el-input>
      </div>

      <!-- 搜索结果高亮提示 -->
      <div v-if="searchQuery && searchResults.length > 0" class="search-results-info">
        找到 {{ searchResults.length }} 个匹配结果
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="kb-main">
      <!-- 左侧分类导航（侧边栏） -->
      <aside class="kb-sidebar" :class="{ 'dark-sidebar': isDarkMode }">
        <div class="sidebar-header">
          <h3>知识分类</h3>
          <el-button text size="small" @click="clearCategory">清除</el-button>
        </div>

        <el-menu
          :default-active="activeCategory"
          @select="handleCategorySelect"
          class="category-menu"
        >
          <el-sub-menu v-for="cat in categories" :key="cat.id" :index="cat.id">
            <template #title>
              <el-icon><component :is="cat.icon" /></el-icon>
              <span>{{ cat.title }}</span>
              <el-tag size="small" class="article-count">{{ cat.articles.length }}</el-tag>
            </template>
            <el-menu-item
              v-for="article in cat.articles"
              :key="article.id"
              :index="article.id"
              :class="{ 'has-read': readArticles.includes(article.id) }"
            >
              <span class="article-title-text">{{ article.title }}</span>
              <el-icon v-if="bookmarkedArticles.includes(article.id)" class="bookmark-icon"><Star /></el-icon>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>

        <!-- 书签列表 -->
        <div class="bookmarks-section" v-if="bookmarkedArticles.length > 0">
          <h4>📌 我的书签</h4>
          <div class="bookmark-list">
            <div
              v-for="article in bookmarkedArticleList"
              :key="article.id"
              class="bookmark-item"
              @click="goToArticle(article.categoryId, article.id)"
            >
              <span>{{ article.title }}</span>
              <el-icon @click.stop="removeBookmark(article.id)"><Close /></el-icon>
            </div>
          </div>
        </div>
      </aside>

      <!-- 中间：文章列表 -->
      <div class="kb-articles">
        <div class="articles-header">
          <h3>{{ currentCategory?.title || '全部文章' }}</h3>
          <div class="articles-filter">
            <el-select v-model="sortBy" size="small">
              <el-option label="默认顺序" value="default" />
              <el-option label="按阅读状态" value="read" />
              <el-option label="按书签" value="bookmark" />
            </el-select>
          </div>
        </div>

        <!-- 文章卡片列表 -->
        <div class="article-cards" v-if="!searchQuery">
          <div
            v-for="article in filteredArticles"
            :key="article.id"
            :class="['article-card', { active: activeArticle === article.id, read: readArticles.includes(article.id) }]"
            @click="selectArticle(article)"
          >
            <div class="card-header">
              <span class="card-category">{{ getCategoryName(article.categoryId) }}</span>
              <el-icon
                v-if="bookmarkedArticles.includes(article.id)"
                class="card-bookmark"
                @click.stop="toggleArticleBookmark(article.id)"
              ><Star /></el-icon>
              <el-icon
                v-else
                class="card-bookmark-outline"
                @click.stop="toggleArticleBookmark(article.id)"
              ><Star /></el-icon>
            </div>
            <h4 class="card-title">{{ article.title }}</h4>
            <p class="card-summary">{{ article.summary }}</p>
            <div class="card-footer">
              <div class="card-tags">
                <el-tag v-for="tag in article.tags" :key="tag" size="small" :type="getTagType(tag)">
                  {{ tag }}
                </el-tag>
              </div>
              <div class="read-indicator" v-if="readArticles.includes(article.id)">
                <el-icon><Check /></el-icon> 已读
              </div>
            </div>
          </div>
        </div>

        <!-- 搜索结果列表 -->
        <div class="search-results" v-else>
          <div
            v-for="result in searchResults"
            :key="result.id"
            class="search-result-item"
            @click="goToArticle(result.categoryId, result.id)"
          >
            <div class="result-header">
              <span class="result-category">{{ getCategoryName(result.categoryId) }}</span>
              <span class="result-title" v-html="highlightText(result.title, searchQuery)"></span>
            </div>
            <p class="result-summary" v-html="highlightText(result.summary, searchQuery)"></p>
          </div>
          <el-empty v-if="searchResults.length === 0" description="未找到匹配结果" />
        </div>
      </div>

      <!-- 右侧：文章内容 -->
      <div class="kb-content" :class="{ 'dark-content': isDarkMode }">
        <template v-if="currentArticleData">
          <!-- 文章操作栏 -->
          <div class="content-toolbar">
            <div class="toolbar-left">
              <el-button @click="toggleArticleBookmark(currentArticleData.id)" circle>
                <el-icon><Star /></el-icon>
              </el-button>
              <el-button @click="copyArticleContent" circle>
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
            <div class="toolbar-right">
              <el-progress
                :percentage="readProgress"
                :show-text="false"
                class="read-progress"
              />
              <span class="progress-text">{{ readProgress }}%</span>
            </div>
          </div>

          <!-- 文章内容 -->
          <div class="article-content-wrapper" ref="contentRef" @scroll="handleContentScroll">
            <!-- 文章标题区 -->
            <div class="article-header-section">
              <h1 class="article-title">{{ currentArticleData.title }}</h1>
              <div class="article-meta">
                <span class="meta-category">
                  <el-icon><Folder /></el-icon>
                  {{ getCategoryName(currentCategoryId) }}
                </span>
                <span class="meta-tags">
                  <el-tag v-for="tag in currentArticleData.tags" :key="tag" size="small">
                    {{ tag }}
                  </el-tag>
                </span>
              </div>
            </div>

            <!-- 文章目录 -->
            <nav class="article-toc" v-if="tocItems.length > 0">
              <h4>目录</h4>
              <ul>
                <li
                  v-for="item in tocItems"
                  :key="item.id"
                  :class="['toc-item', `level-${item.level}`, { active: activeHeading === item.id }]"
                  @click="scrollToHeading(item.id)"
                >
                  {{ item.text }}
                </li>
              </ul>
            </nav>

            <!-- Markdown 内容 -->
            <div class="markdown-body" v-html="renderedContent"></div>

            <!-- 导航 -->
            <div class="article-nav">
              <el-button
                v-if="prevArticle"
                @click="selectArticle(prevArticle)"
                class="nav-btn prev"
              >
                <el-icon><ArrowLeft /></el-icon>
                <div class="nav-text">
                  <span class="nav-label">上一篇</span>
                  <span class="nav-title">{{ prevArticle.title }}</span>
                </div>
              </el-button>
              <div style="flex: 1"></div>
              <el-button
                v-if="nextArticle"
                @click="selectArticle(nextArticle)"
                class="nav-btn next"
              >
                <div class="nav-text">
                  <span class="nav-label">下一篇</span>
                  <span class="nav-title">{{ nextArticle.title }}</span>
                </div>
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>

            <!-- 相关文章推荐 -->
            <div class="related-articles" v-if="relatedArticles.length > 0">
              <h3>相关文章</h3>
              <div class="related-list">
                <div
                  v-for="article in relatedArticles"
                  :key="article.id"
                  class="related-item"
                  @click="goToArticle(article.categoryId, article.id)"
                >
                  <el-icon><Document /></el-icon>
                  <span>{{ article.title }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <div class="article-content-empty" v-else>
          <el-empty description="请从左侧选择一篇文章开始阅读">
            <template #image>
              <div class="empty-illustration">📖</div>
            </template>
          </el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { knowledgeCategories } from '@/data/knowledge-base'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    return `<pre class="code-block"><div class="code-header"><span class="code-lang">${lang || 'code'}</span><button class="copy-btn" onclick="copyCode(this)">复制</button></div><code class="lang-${lang}">${md.utils.escapeHtml(str)}</code></pre>`
  }
})

// 状态
const isDarkMode = ref(false)
const activeCategory = ref('')
const activeArticle = ref('')
const searchQuery = ref('')
const searchScope = ref('all')
const sortBy = ref('default')
const readArticles = ref([])
const bookmarkedArticles = ref([])
const readProgress = ref(0)
const tocItems = ref([])
const activeHeading = ref('')
const contentRef = ref(null)
const currentCategoryId = ref('')

// 数据
const categories = computed(() => knowledgeCategories)

// 计算所有文章（带分类ID）
const allArticles = computed(() => {
  const articles = []
  categories.value.forEach(cat => {
    cat.articles.forEach(article => {
      articles.push({
        ...article,
        categoryId: cat.id
      })
    })
  })
  return articles
})

// 过滤后的文章列表
const filteredArticles = computed(() => {
  let articles = []

  if (activeCategory.value) {
    const cat = categories.value.find(c => c.id === activeCategory.value)
    if (cat) {
      articles = cat.articles.map(a => ({ ...a, categoryId: cat.id }))
    }
  } else {
    articles = allArticles.value
  }

  // 排序
  if (sortBy.value === 'read') {
    articles = [...articles].sort((a, b) => {
      const aRead = readArticles.value.includes(a.id)
      const bRead = readArticles.value.includes(b.id)
      return aRead - bRead
    })
  } else if (sortBy.value === 'bookmark') {
    articles = [...articles].sort((a, b) => {
      const aBook = bookmarkedArticles.value.includes(a.id)
      const bBook = bookmarkedArticles.value.includes(b.id)
      return bBook - aBook
    })
  }

  return articles
})

// 当前选中分类
const currentCategory = computed(() => {
  if (!activeCategory.value) return null
  return categories.value.find(c => c.id === activeCategory.value)
})

// 当前文章数据
const currentArticleData = computed(() => {
  if (!currentCategory.value) return null
  return currentCategory.value.articles.find(a => a.id === activeArticle.value)
})

// 渲染内容
const renderedContent = computed(() => {
  if (!currentArticleData.value) return ''
  let content = md.render(currentArticleData.value.content)

  // 添加复制按钮功能
  content = content.replace(/<pre>/g, '<pre class="code-block">')

  return content
})

// 相关文章
const relatedArticles = computed(() => {
  if (!currentArticleData.value || !currentCategoryId.value) return []

  const currentCat = categories.value.find(c => c.id === currentCategoryId.value)
  if (!currentCat) return []

  return currentCat.articles
    .filter(a => a.id !== currentArticleData.value.id)
    .slice(0, 3)
    .map(a => ({ ...a, categoryId: currentCategoryId.value }))
})

// 上下篇
const currentIndex = computed(() => {
  if (!currentCategory.value) return -1
  return currentCategory.value.articles.findIndex(a => a.id === activeArticle.value)
})

const prevArticle = computed(() => {
  if (currentIndex.value <= 0 || !currentCategory.value) return null
  const article = currentCategory.value.articles[currentIndex.value - 1]
  return { ...article, categoryId: currentCategoryId.value }
})

const nextArticle = computed(() => {
  if (!currentCategory.value || currentIndex.value < 0) return null
  if (currentIndex.value >= currentCategory.value.articles.length - 1) return null
  const article = currentCategory.value.articles[currentIndex.value + 1]
  return { ...article, categoryId: currentCategoryId.value }
})

// 书签列表
const bookmarkedArticleList = computed(() => {
  return allArticles.value.filter(a => bookmarkedArticles.value.includes(a.id))
})

// 搜索结果
const searchResults = computed(() => {
  if (!searchQuery.value) return []

  const query = searchQuery.value.toLowerCase()
  return allArticles.value.filter(article => {
    // 提取纯文本内容用于搜索
    const plainContent = article.content.replace(/```[\s\S]*?```/g, '').replace(/[#*`_\[\]]/g, '')

    if (searchScope.value === 'title') {
      return article.title.toLowerCase().includes(query)
    } else if (searchScope.value === 'code') {
      const codeBlocks = article.content.match(/```[\s\S]*?```/g) || []
      return codeBlocks.some(block => block.toLowerCase().includes(query))
    } else {
      return article.title.toLowerCase().includes(query) ||
             plainContent.toLowerCase().includes(query)
    }
  })
})

// 方法
const handleCategorySelect = (index) => {
  // 检查是否是分类ID还是文章ID
  const cat = categories.value.find(c => c.id === index)
  if (cat) {
    activeCategory.value = index
    activeArticle.value = ''
  } else {
    // 可能是文章ID，找到它所属的分类
    for (const c of categories.value) {
      if (c.articles.some(a => a.id === index)) {
        activeCategory.value = c.id
        activeArticle.value = index
        currentCategoryId.value = c.id
        break
      }
    }
  }
}

const handleSearch = () => {
  // 搜索时会自动更新 searchResults
}

const selectArticle = (article) => {
  activeArticle.value = article.id
  currentCategoryId.value = article.categoryId
  readProgress.value = 0

  nextTick(() => {
    extractToc()
    updateReadProgress()
  })
}

const goToArticle = (categoryId, articleId) => {
  activeCategory.value = categoryId
  activeArticle.value = articleId
  currentCategoryId.value = categoryId
  readProgress.value = 0
  searchQuery.value = ''

  nextTick(() => {
    extractToc()
    updateReadProgress()
  })
}

const getCategoryName = (categoryId) => {
  const cat = categories.value.find(c => c.id === categoryId)
  return cat?.title || ''
}

const clearCategory = () => {
  activeCategory.value = ''
  activeArticle.value = ''
}

const toggleBookmark = () => {
  if (currentArticleData.value) {
    toggleArticleBookmark(currentArticleData.value.id)
  }
}

const toggleArticleBookmark = (articleId) => {
  const index = bookmarkedArticles.value.indexOf(articleId)
  if (index > -1) {
    bookmarkedArticles.value.splice(index, 1)
    ElMessage.success('已取消书签')
  } else {
    bookmarkedArticles.value.push(articleId)
    ElMessage.success('已添加书签')
  }
  localStorage.setItem('kb_bookmarks', JSON.stringify(bookmarkedArticles.value))
}

const removeBookmark = (articleId) => {
  const index = bookmarkedArticles.value.indexOf(articleId)
  if (index > -1) {
    bookmarkedArticles.value.splice(index, 1)
    localStorage.setItem('kb_bookmarks', JSON.stringify(bookmarkedArticles.value))
  }
}

const copyArticleContent = () => {
  if (!currentArticleData.value) return
  navigator.clipboard.writeText(currentArticleData.value.content)
  ElMessage.success('已复制到剪贴板')
}

// 复制代码功能
const initCopyCode = () => {
  window.copyCode = (btn) => {
    const code = btn.closest('.code-block').querySelector('code').textContent
    navigator.clipboard.writeText(code)
    btn.textContent = '已复制'
    setTimeout(() => { btn.textContent = '复制' }, 2000)
  }
}

// 提取目录
const extractToc = () => {
  if (!currentArticleData.value) {
    tocItems.value = []
    return
  }

  const headings = currentArticleData.value.content.match(/^#{1,3}\s+.+$/gm) || []
  tocItems.value = headings.map(h => {
    const level = h.match(/^#+/)[0].length
    const text = h.replace(/^#+\s+/, '')
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    return { level, text, id }
  })
}

const scrollToHeading = (id) => {
  const heading = contentRef.value?.querySelector(`#${id}`)
  if (heading) {
    heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeHeading.value = id
  }
}

// 阅读进度
const handleContentScroll = () => {
  updateReadProgress()
}

const updateReadProgress = () => {
  if (!contentRef.value) return

  const { scrollTop, scrollHeight, clientHeight } = contentRef.value
  const progress = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)
  readProgress.value = Math.min(100, Math.max(0, progress))

  // 标记已读
  if (readProgress.value > 80 && currentArticleData.value) {
    if (!readArticles.value.includes(currentArticleData.value.id)) {
      readArticles.value.push(currentArticleData.value.id)
      localStorage.setItem('kb_read', JSON.stringify(readArticles.value))
    }
  }
}

// 高亮搜索文本
const highlightText = (text, query) => {
  if (!query) return text
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="highlight">$1</mark>')
}

// 获取标签类型
const getTagType = (tag) => {
  const types = {
    '架构': '',
    '固件': 'success',
    'SDK': 'warning',
    '仿真': 'info',
    'ROS2': 'danger',
    'RL': '',
    '代码': 'primary'
  }
  return types[tag] || ''
}

// 初始化
onMounted(() => {
  // 加载保存的状态
  const savedBookmarks = localStorage.getItem('kb_bookmarks')
  if (savedBookmarks) {
    bookmarkedArticles.value = JSON.parse(savedBookmarks)
  }

  const savedRead = localStorage.getItem('kb_read')
  if (savedRead) {
    readArticles.value = JSON.parse(savedRead)
  }

  const savedDark = localStorage.getItem('kb_darkmode')
  if (savedDark) {
    isDarkMode.value = savedDark === 'true'
  }

  // 初始化代码复制
  initCopyCode()
})

// 监听暗黑模式变化
watch(isDarkMode, (val) => {
  localStorage.setItem('kb_darkmode', String(val))
})
</script>

<style scoped>
.knowledge-base {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 1800px;
  margin: 0 auto;
  background: #f5f7fa;
}

/* 头部样式 */
.kb-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.header-title h2 {
  margin: 0 0 4px 0;
  font-size: 24px;
}

.header-title p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.search-box {
  max-width: 600px;
}

.search-results-info {
  margin-top: 12px;
  font-size: 13px;
  opacity: 0.9;
}

/* 主内容区 */
.kb-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 16px;
  padding: 16px;
}

/* 侧边栏 */
.kb-sidebar {
  width: 260px;
  flex-shrink: 0;
  background: white;
  border-radius: 8px;
  padding: 16px;
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.category-menu {
  border-right: none;
}

.article-count {
  margin-left: auto;
  background: #f0f2f5;
}

.article-title-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.has-read {
  color: #999;
}

.bookmark-icon {
  color: #e6a23c;
  margin-left: 8px;
}

.bookmarks-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.bookmarks-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
}

.bookmark-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bookmark-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.bookmark-item:hover {
  background: #e4e7ed;
}

.bookmark-item .el-icon {
  color: #999;
  transition: color 0.2s;
}

.bookmark-item .el-icon:hover {
  color: #f56c6c;
}

/* 文章列表 */
.kb-articles {
  width: 320px;
  flex-shrink: 0;
  overflow-y: auto;
}

.articles-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.articles-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.article-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.article-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.article-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-card.active {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.article-card.read {
  background: #fafafa;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-category {
  font-size: 12px;
  color: #999;
}

.card-bookmark, .card-bookmark-outline {
  cursor: pointer;
  transition: color 0.2s;
}

.card-bookmark {
  color: #e6a23c;
}

.card-bookmark-outline {
  color: #dcdfe6;
}

.card-bookmark-outline:hover {
  color: #e6a23c;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #333;
  font-weight: 600;
}

.card-summary {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.read-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #67c23a;
}

/* 搜索结果 */
.search-results {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-result-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.search-result-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.result-category {
  font-size: 12px;
  color: #999;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.result-title {
  font-weight: 600;
  color: #333;
}

.result-summary {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

/* 内容区 */
.kb-content {
  flex: 1;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.content-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  background: #fafafa;
}

.toolbar-left {
  display: flex;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.read-progress {
  width: 100px;
}

.progress-text {
  font-size: 12px;
  color: #999;
}

.article-content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

.article-header-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.article-title {
  margin: 0 0 12px 0;
  font-size: 28px;
  color: #333;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #666;
  font-size: 14px;
}

.meta-category {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-tags {
  display: flex;
  gap: 8px;
}

/* 目录 */
.article-toc {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.article-toc h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
}

.article-toc ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  padding: 6px 12px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  border-radius: 4px;
  transition: all 0.2s;
}

.toc-item:hover {
  background: #e4e7ed;
  color: #333;
}

.toc-item.active {
  background: #667eea;
  color: white;
}

.toc-item.level-2 {
  padding-left: 24px;
}

.toc-item.level-3 {
  padding-left: 36px;
  font-size: 12px;
}

/* Markdown 样式 */
.markdown-body {
  line-height: 1.8;
  color: #2c3e50;
}

.markdown-body :deep(h1) {
  font-size: 2em;
  margin: 1.5em 0 0.5em 0;
  padding-bottom: 0.3em;
  border-bottom: 2px solid #667eea;
  color: #333;
}

.markdown-body :deep(h2) {
  font-size: 1.5em;
  margin: 1.5em 0 0.5em 0;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
  color: #333;
}

.markdown-body :deep(h3) {
  font-size: 1.25em;
  margin: 1.5em 0 0.5em 0;
  color: #444;
}

.markdown-body :deep(p) {
  margin: 1em 0;
}

.markdown-body :deep(code) {
  background: #f6f8fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  color: #e74c3c;
}

.markdown-body :deep(pre) {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 0;
  border-radius: 8px;
  overflow: hidden;
  margin: 1.5em 0;
  line-height: 1.6;
}

.markdown-body :deep(.code-block) {
  position: relative;
}

.markdown-body :deep(.code-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
}

.markdown-body :deep(.code-lang) {
  font-size: 12px;
  color: #888;
}

.markdown-body :deep(.copy-btn) {
  background: #4a4a4a;
  color: #d4d4d4;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.markdown-body :deep(.copy-btn:hover) {
  background: #5a5a5a;
}

.markdown-body :deep(pre code) {
  display: block;
  padding: 16px;
  background: transparent;
  color: inherit;
  overflow-x: auto;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid #667eea;
  padding-left: 16px;
  margin: 1.5em 0;
  color: #666;
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 0 4px 4px 0;
}

.markdown-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5em 0;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid #e4e7ed;
  padding: 8px 12px;
  text-align: left;
}

.markdown-body :deep(th) {
  background: #f5f7fa;
  font-weight: 600;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 1em 0;
  padding-left: 2em;
}

.markdown-body :deep(li) {
  margin: 0.5em 0;
}

.markdown-body :deep(strong) {
  font-weight: 600;
  color: #333;
}

.markdown-body :deep(a) {
  color: #667eea;
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

/* 高亮 */
.markdown-body :deep(.highlight) {
  background: #ffe566;
  padding: 2px 4px;
  border-radius: 2px;
}

:deep(.highlight) {
  background: #ffe566;
  padding: 2px 4px;
  border-radius: 2px;
}

/* 文章导航 */
.article-nav {
  display: flex;
  gap: 16px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.nav-btn:hover {
  border-color: #667eea;
  background: #f5f7fa;
}

.nav-text {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.nav-label {
  font-size: 12px;
  color: #999;
}

.nav-title {
  font-size: 14px;
  color: #333;
}

.nav-btn.next .nav-text {
  text-align: right;
}

/* 相关文章 */
.related-articles {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.related-articles h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.related-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.related-item:hover {
  background: #e4e7ed;
  color: #667eea;
}

.related-item .el-icon {
  color: #999;
}

/* 空状态 */
.article-content-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-illustration {
  font-size: 64px;
}

/* 暗黑模式 */
.dark-mode {
  background: #1a1a2e;
}

.dark-mode .kb-header.dark-header {
  background: linear-gradient(135deg, #4a4a6a 0%, #2a2a4a 100%);
}

.dark-mode .kb-sidebar.dark-sidebar {
  background: #252538;
}

.dark-mode .kb-sidebar,
.dark-mode .article-card,
.dark-mode .search-result-item,
.dark-mode .kb-content,
.dark-mode .content-toolbar {
  background: #252538;
  color: #e0e0e0;
}

.dark-mode .sidebar-header h3,
.dark-mode .articles-header h3,
.dark-mode .card-title,
.dark-mode .result-title,
.dark-mode .article-title,
.dark-mode .article-header-section h1 {
  color: #e0e0e0;
}

.dark-mode .category-desc,
.dark-mode .card-summary,
.dark-mode .result-summary,
.dark-mode .article-meta,
.dark-mode .toc-item {
  color: #a0a0a0;
}

.dark-mode .article-card:hover,
.dark-mode .search-result-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dark-mode .article-card.active {
  border-color: #667eea;
}

.dark-mode .markdown-body {
  color: #d0d0d0;
}

.dark-mode .markdown-body :deep(h1),
.dark-mode .markdown-body :deep(h2),
.dark-mode .markdown-body :deep(h3) {
  color: #e0e0e0;
}

.dark-mode .markdown-body :deep(code) {
  background: #2d2d2d;
  color: #f5a5a5;
}

.dark-mode .markdown-body :deep(pre) {
  background: #1e1e1e;
}

.dark-mode .markdown-body :deep(pre code) {
  color: #d4d4d4;
}

.dark-mode .markdown-body :deep(blockquote) {
  background: #2d2d2d;
  border-left-color: #667eea;
  color: #a0a0a0;
}

.dark-mode .markdown-body :deep(th) {
  background: #2d2d2d;
  color: #e0e0e0;
}

.dark-mode .markdown-body :deep(th),
.dark-mode .markdown-body :deep(td) {
  border-color: #3d3d3d;
}

.dark-mode .article-toc {
  background: #2d2d2d;
}

.dark-mode .toc-item:hover {
  background: #3d3d3d;
}

.dark-mode .toc-item.active {
  background: #667eea;
}

.dark-mode .article-nav,
.dark-mode .related-articles {
  border-top-color: #3d3d3d;
}

.dark-mode .nav-btn {
  background: #2d2d2d;
  border-color: #3d3d3d;
}

.dark-mode .nav-btn:hover {
  border-color: #667eea;
}

.dark-mode .nav-btn .nav-title {
  color: #e0e0e0;
}

.dark-mode .related-item {
  background: #2d2d2d;
}

.dark-mode .related-item:hover {
  color: #667eea;
}

.dark-mode .article-header-section {
  border-bottom-color: #3d3d3d;
}

.dark-mode .content-toolbar {
  background: #1e1e2e;
  border-bottom-color: #3d3d3d;
}

.dark-mode .article-count,
.dark-mode .result-category {
  background: #3d3d3d;
  color: #a0a0a0;
}

.dark-mode .has-read {
  color: #666;
}

.dark-mode .read-indicator {
  color: #67c23a;
}

/* 响应式 */
@media (max-width: 1200px) {
  .kb-main {
    flex-direction: column;
  }

  .kb-sidebar {
    width: 100%;
    max-height: 200px;
  }

  .kb-articles {
    width: 100%;
    max-height: 300px;
  }
}
</style>
