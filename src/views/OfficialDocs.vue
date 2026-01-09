<template>
  <div class="official-docs">
    <!-- 导航 -->
    <div class="docs-nav card mb-3">
      <h2>📖 官方文档（中文翻译）</h2>
      <el-tabs v-model="activeSection" @tab-click="handleTabClick">
        <el-tab-pane label="项目介绍" name="intro" />
        <el-tab-pane label="硬件清单" name="hardware" />
        <el-tab-pane label="组装指南" name="assembly" />
        <el-tab-pane label="固件烧录" name="firmware" />
        <el-tab-pane label="示例脚本" name="examples" />
      </el-tabs>
    </div>

    <!-- 内容区 -->
    <div class="docs-content card">
      <div class="markdown-body" v-html="renderedContent"></div>

      <!-- 页面导航 -->
      <div class="page-nav">
        <el-button
          v-if="prevSection"
          @click="activeSection = prevSection.id"
          :icon="ArrowLeft"
        >
          上一章：{{ prevSection.title }}
        </el-button>
        <div style="flex: 1"></div>
        <el-button
          v-if="nextSection"
          @click="activeSection = nextSection.id"
        >
          下一章：{{ nextSection.title }}
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MarkdownIt from 'markdown-it'
import { extendedKnowledge } from '@/data/knowledge-extended.js'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

// 数据
const activeSection = ref('intro')

// 章节定义
const sections = [
  { id: 'intro', title: '项目介绍' },
  { id: 'hardware', title: '硬件清单' },
  { id: 'assembly', title: '组装指南' },
  { id: 'firmware', title: '固件烧录' },
  { id: 'examples', title: '示例脚本' }
]

// 计算属性
const currentIndex = computed(() => {
  return sections.findIndex(s => s.id === activeSection.value)
})

const prevSection = computed(() => {
  if (currentIndex.value <= 0) return null
  return sections[currentIndex.value - 1]
})

const nextSection = computed(() => {
  if (currentIndex.value >= sections.length - 1) return null
  return sections[currentIndex.value + 1]
})

const renderedContent = computed(() => {
  const docs = extendedKnowledge.officialDocs
  const content = docs[activeSection.value]?.content || ''
  return md.render(content)
})

// 方法
const handleTabClick = () => {
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.official-docs {
  max-width: 1200px;
  margin: 0 auto;
}

.docs-nav {
  padding: 20px;
}

.docs-nav h2 {
  margin: 0 0 16px 0;
  font-size: 24px;
  color: #333;
}

.docs-content {
  padding: 40px;
  min-height: 500px;
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
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 8px;
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

.page-nav {
  display: flex;
  gap: 12px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}
</style>
