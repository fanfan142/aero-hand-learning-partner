<template>
  <div class="knowledge-base">
    <!-- 顶部导航 -->
    <div class="kb-header card mb-3">
      <div class="header-content">
        <h2>📚 知识库</h2>
        <p>深入理解 Aero Hand 的技术原理</p>
      </div>

      <!-- 分类选择 -->
      <div class="category-tabs">
        <el-button
          v-for="cat in categories"
          :key="cat.id"
          :type="activeCategory === cat.id ? 'primary' : 'default'"
          @click="activeCategory = cat.id"
          class="category-btn"
        >
          <el-icon><component :is="cat.icon" /></el-icon>
          {{ cat.title }}
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <el-row :gutter="20">
      <!-- 左侧：文章列表 -->
      <el-col :span="8">
        <div class="article-list card">
          <h3>{{ currentCategory?.title }}</h3>
          <p class="category-desc">{{ currentCategory?.description }}</p>

          <el-divider />

          <div class="articles">
            <div
              v-for="article in currentCategory?.articles"
              :key="article.id"
              :class="['article-item', { active: activeArticle === article.id }]"
              @click="activeArticle = article.id"
            >
              <div class="article-title">
                <el-icon><Document /></el-icon>
                {{ article.title }}
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 右侧：文章内容 -->
      <el-col :span="16">
        <div class="article-content card" v-if="currentArticleData">
          <div class="article-header">
            <h2>{{ currentArticleData.title }}</h2>
            <el-button size="small" @click="copyArticleContent">
              <el-icon><CopyDocument /></el-icon>
              复制内容
            </el-button>
          </div>

          <el-divider />

          <div class="markdown-body" v-html="renderedContent"></div>

          <!-- 导航 -->
          <div class="article-nav">
            <el-button
              v-if="prevArticle"
              @click="activeArticle = prevArticle.id"
              :icon="ArrowLeft"
            >
              上一篇：{{ prevArticle.title }}
            </el-button>
            <div style="flex: 1"></div>
            <el-button
              v-if="nextArticle"
              @click="activeArticle = nextArticle.id"
            >
              下一篇：{{ nextArticle.title }}
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>

        <div class="article-content card" v-else>
          <el-empty description="请选择一篇文章阅读" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { knowledgeCategories } from '@/data/knowledge-base'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

// 数据
const activeCategory = ref('architecture')
const activeArticle = ref('overview')

// 计算属性
const categories = computed(() => knowledgeCategories)

const currentCategory = computed(() => {
  return categories.value.find(c => c.id === activeCategory.value)
})

const currentArticleData = computed(() => {
  if (!currentCategory.value) return null
  return currentCategory.value.articles.find(a => a.id === activeArticle.value)
})

const renderedContent = computed(() => {
  if (!currentArticleData.value) return ''
  return md.render(currentArticleData.value.content)
})

const articles = computed(() => {
  return currentCategory.value?.articles || []
})

const currentIndex = computed(() => {
  return articles.value.findIndex(a => a.id === activeArticle.value)
})

const prevArticle = computed(() => {
  if (currentIndex.value <= 0) return null
  return articles.value[currentIndex.value - 1]
})

const nextArticle = computed(() => {
  if (currentIndex.value < 0 || currentIndex.value >= articles.value.length - 1) return null
  return articles.value[currentIndex.value + 1]
})

// 方法
const copyArticleContent = () => {
  if (!currentArticleData.value) return
  navigator.clipboard.writeText(currentArticleData.value.content)
  ElMessage.success('已复制到剪贴板')
}

// 初始化：自动选择第一篇文章
if (articles.value.length > 0 && !activeArticle.value) {
  activeArticle.value = articles.value[0].id
}
</script>

<style scoped>
.knowledge-base {
  max-width: 1600px;
  margin: 0 auto;
}

.kb-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
}

.header-content h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
}

.header-content p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.category-tabs {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.category-btn {
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.category-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.category-btn.el-button--primary {
  background: white;
  color: #667eea;
  border-color: white;
}

.article-list h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
}

.category-desc {
  margin: 0;
  color: #666;
  font-size: 13px;
}

.articles {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.article-item {
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 8px;
  border: 1px solid transparent;
}

.article-item:hover {
  background: #f5f7fa;
  border-color: #e4e7ed;
}

.article-item.active {
  background: #ecf5ff;
  border-color: #409eff;
}

.article-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.article-content {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.markdown-body {
  line-height: 1.8;
  color: #2c3e50;
}

.markdown-body :deep(h1) {
  font-size: 2em;
  margin: 1.5em 0 0.5em 0;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.markdown-body :deep(h2) {
  font-size: 1.5em;
  margin: 1.5em 0 0.5em 0;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.markdown-body :deep(h3) {
  font-size: 1.25em;
  margin: 1.5em 0 0.5em 0;
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
  background: #e6f3ff;
  color: #1a1a1a;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #b3d9ff;
  overflow-x: auto;
  margin: 1.5em 0;
  line-height: 1.6;
}

.markdown-body :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid #409eff;
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

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid #e4e7ed;
  margin: 2em 0;
}

.markdown-body :deep(strong) {
  font-weight: 600;
  color: #333;
}

.article-nav {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}
</style>
