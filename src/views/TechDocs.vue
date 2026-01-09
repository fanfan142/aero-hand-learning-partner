<template>
  <div class="tech-docs-page">
    <!-- 顶部搜索和筛选 -->
    <div class="docs-header card">
      <h1>📚 技术文档中心</h1>
      <p class="subtitle">AI生成的深度技术文档，帮助你全面理解Aero Hand Open项目</p>

      <el-row :gutter="20" class="mt-4">
        <el-col :span="12">
          <el-input
            v-model="searchQuery"
            placeholder="搜索文档..."
            prefix-icon="Search"
            clearable
            size="large"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="12">
          <el-select
            v-model="selectedCategory"
            placeholder="选择分类"
            size="large"
            style="width: 100%"
          >
            <el-option label="全部文档" value="all" />
            <el-option label="学习路径" value="learning-path" />
            <el-option label="模块化学习" value="modules" />
            <el-option label="完整指南" value="guides" />
            <el-option label="技术专题" value="topics" />
            <el-option label="模块文档" value="module-docs" />
          </el-select>
        </el-col>
      </el-row>
    </div>

    <!-- 文档分类 -->
    <div class="docs-content">
      <!-- 学习路径方案 -->
      <div v-if="selectedCategory === 'all' || selectedCategory === 'learning-path'" class="doc-section">
        <h2>🎯 学习路径方案</h2>
        <p class="section-desc">系统性学习路线，从基础到高级的完整学习计划</p>

        <el-row :gutter="20">
          <el-col :span="8" v-for="doc in filteredLearningPathDocs" :key="doc.id">
            <el-card class="doc-card" @click="openDoc(doc)">
              <div class="doc-icon">{{ doc.icon }}</div>
              <h3>{{ doc.title }}</h3>
              <p>{{ doc.description }}</p>
              <div class="doc-meta">
                <el-tag size="small" type="info">{{ doc.duration }}</el-tag>
                <el-tag size="small" type="success">{{ doc.level }}</el-tag>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- Scheme 1 详细模块 -->
        <div class="scheme-modules mt-4">
          <h3>📖 方案一：分层学习（6个阶段）</h3>
          <el-collapse v-model="activeScheme1">
            <el-collapse-item
              v-for="module in filteredScheme1Modules"
              :key="module.id"
              :name="module.id"
            >
              <template #title>
                <div class="module-title">
                  <span class="module-number">{{ module.number }}</span>
                  <span class="module-name">{{ module.name }}</span>
                  <el-tag size="small" :type="module.tagType">{{ module.tag }}</el-tag>
                </div>
              </template>
              <div class="module-content">
                <p><strong>📝 内容概述：</strong>{{ module.description }}</p>
                <p><strong>⏱️ 学习时长：</strong>{{ module.duration }}</p>
                <p><strong>📂 关键文件：</strong></p>
                <ul class="file-list">
                  <li v-for="file in module.files" :key="file">
                    <el-icon><Document /></el-icon>
                    {{ file }}
                  </li>
                </ul>
                <el-button
                  type="primary"
                  size="small"
                  @click="loadDocById(module.docId)"
                >
                  查看详细文档
                </el-button>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>

      <!-- 模块化学习 -->
      <div v-if="selectedCategory === 'all' || selectedCategory === 'modules'" class="doc-section">
        <h2>🔧 模块化学习方案</h2>
        <p class="section-desc">按技术模块分类，专注学习特定技术领域</p>

        <el-row :gutter="20">
          <el-col :span="12" v-for="module in filteredScheme2Modules" :key="module.id">
            <el-card class="module-card">
              <div class="module-header">
                <div class="module-badge">{{ module.letter }}</div>
                <h3>{{ module.name }}</h3>
              </div>
              <p class="module-desc">{{ module.description }}</p>
              <div class="module-info">
                <div class="info-item">
                  <el-icon><Clock /></el-icon>
                  <span>{{ module.duration }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Reading /></el-icon>
                  <span>{{ module.prerequisites }}</span>
                </div>
              </div>
              <div class="module-files">
                <p><strong>对应文件：</strong></p>
                <code>{{ module.files }}</code>
              </div>
              <el-button
                type="primary"
                @click="loadDocById(module.docId)"
                class="mt-3"
              >
                开始学习
              </el-button>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 完整指南 -->
      <div v-if="selectedCategory === 'all' || selectedCategory === 'guides'" class="doc-section">
        <h2>📖 AI生成技术文档 (2025-12-29 ~ 12-30)</h2>
        <p class="section-desc">深度技术分析文档，全面解析Aero Hand Open项目</p>

        <!-- 12月29日文档 -->
        <div class="date-group">
          <h3>📅 2025年12月29日</h3>
          <el-row :gutter="20">
            <el-col :span="8" v-for="guide in filteredCompleteGuides.filter(g => g.date === '2025-12-29')" :key="guide.id">
              <el-card class="guide-card" @click="loadDocById(guide.docId)">
                <div class="guide-icon">{{ guide.icon }}</div>
                <h4>{{ guide.title }}</h4>
                <p>{{ guide.description }}</p>
                <div class="guide-meta">
                  <el-tag size="small" type="info">{{ guide.module }}</el-tag>
                  <el-tag size="small" type="success">12-29</el-tag>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 12月30日文档 -->
        <div class="date-group mt-4">
          <h3>📅 2025年12月30日</h3>
          <el-row :gutter="20">
            <el-col :span="8" v-for="guide in filteredCompleteGuides.filter(g => g.date === '2025-12-30')" :key="guide.id">
              <el-card class="guide-card" @click="loadDocById(guide.docId)">
                <div class="guide-icon">{{ guide.icon }}</div>
                <h4>{{ guide.title }}</h4>
                <p>{{ guide.description }}</p>
                <div class="guide-meta">
                  <el-tag size="small" type="info">{{ guide.module }}</el-tag>
                  <el-tag size="small" type="warning">12-30</el-tag>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 技术专题 -->
      <div v-if="selectedCategory === 'all' || selectedCategory === 'topics'" class="doc-section">
        <h2>🔬 技术专题</h2>
        <p class="section-desc">深入探讨特定技术主题</p>

        <el-timeline>
          <el-timeline-item
            v-for="topic in filteredTechnicalTopics"
            :key="topic.id"
            :timestamp="topic.date"
            placement="top"
          >
            <el-card>
              <h4>{{ topic.title }}</h4>
              <p>{{ topic.description }}</p>
              <el-button
                text
                type="primary"
                @click="loadDocById(topic.docId)"
              >
                阅读文档 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 模块文档 -->
      <div v-if="selectedCategory === 'all' || selectedCategory === 'module-docs'" class="doc-section">
        <h2>📁 模块文档</h2>
        <p class="section-desc">各模块的AI上下文文档</p>

        <el-row :gutter="20">
          <el-col :span="8" v-for="mod in filteredModuleDocs" :key="mod.id">
            <el-card class="mod-doc-card" @click="loadDocById(mod.docId)">
              <div class="mod-doc-icon">{{ mod.icon }}</div>
              <h4>{{ mod.name }}</h4>
              <p>{{ mod.description }}</p>
              <div class="mod-stats">
                <span><el-icon><Document /></el-icon> {{ mod.fileCount }} 文件</span>
                <span><el-icon><DataAnalysis /></el-icon> {{ mod.coverage }} 覆盖率</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 文档查看器抽屉 -->
    <el-drawer
      v-model="docDrawerVisible"
      :title="currentDocTitle"
      direction="rtl"
      size="60%"
      class="doc-drawer"
    >
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading"><Loading /></el-icon>
        <p>加载中...</p>
      </div>
      <div v-else-if="currentDocContent" class="doc-content">
        <div class="markdown-body" v-html="renderedMarkdown"></div>
      </div>
      <div v-else class="empty-content">
        <el-icon><DocumentDelete /></el-icon>
        <p>文档内容为空</p>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Search,
  Document,
  Clock,
  Reading,
  ArrowRight,
  Loading,
  DocumentDelete,
  DataAnalysis
} from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'
import {
  docsById,
  learningPathDocs,
  scheme1Modules,
  scheme2Modules,
  completeGuides,
  technicalTopics,
  moduleDocs
} from '../data/tech-docs'

const searchQuery = ref('')
const selectedCategory = ref('all')
const docDrawerVisible = ref(false)
const currentDocTitle = ref('')
const currentDocContent = ref('')
const loading = ref(false)
const activeScheme1 = ref(['1', '2'])

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())

const buildSearchText = (item) => {
  const doc = docsById[item.docId]
  return [
    item.title,
    item.name,
    item.description,
    item.duration,
    item.level,
    item.prerequisites,
    item.files,
    item.module,
    item.coverage,
    doc?.title,
    doc?.summary,
    doc?.tags?.join(' '),
    doc?.sections?.map((section) => section.title).join(' '),
    doc?.sections?.flatMap((section) => section.points || []).join(' ')
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

const filterByQuery = (items) => {
  const query = normalizedQuery.value
  if (!query) return items
  return items.filter((item) => buildSearchText(item).includes(query))
}

const filteredLearningPathDocs = computed(() => filterByQuery(learningPathDocs))
const filteredScheme1Modules = computed(() => filterByQuery(scheme1Modules))
const filteredScheme2Modules = computed(() => filterByQuery(scheme2Modules))
const filteredCompleteGuides = computed(() => filterByQuery(completeGuides))
const filteredTechnicalTopics = computed(() => filterByQuery(technicalTopics))
const filteredModuleDocs = computed(() => filterByQuery(moduleDocs))

// 计算渲染的Markdown
const renderedMarkdown = computed(() => {
  if (!currentDocContent.value) return ''
  return md.render(currentDocContent.value)
})

// 打开文档
function openDoc(doc) {
  loadDocById(doc.docId)
}

// 加载Markdown文档
function loadDocById(docId) {
  loading.value = true
  docDrawerVisible.value = true
  const doc = docsById[docId]

  if (doc) {
    currentDocTitle.value = doc.title
    currentDocContent.value = doc.content
  } else {
    currentDocTitle.value = '文档'
    currentDocContent.value = '# 文档未找到\n\n当前分类中未匹配到对应文档内容。'
  }

  loading.value = false
}
</script>

<style scoped>
.tech-docs-page {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
}

.docs-header h1 {
  margin: 0 0 10px 0;
  font-size: 32px;
  color: #303133;
}

.subtitle {
  margin: 0;
  font-size: 16px;
  color: #909399;
}

.mt-4 {
  margin-top: 20px;
}

.mt-3 {
  margin-top: 16px;
}

.doc-section {
  margin-bottom: 50px;
}

.doc-section h2 {
  font-size: 28px;
  color: #303133;
  margin: 0 0 10px 0;
}

.section-desc {
  color: #909399;
  font-size: 16px;
  margin-bottom: 25px;
}

/* 文档卡片 */
.doc-card {
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.doc-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.doc-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.doc-card h3 {
  font-size: 18px;
  color: #303133;
  margin: 10px 0;
}

.doc-card p {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 10px 0;
}

.doc-meta {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

/* 模块卡片 */
.module-card {
  height: 100%;
  margin-bottom: 20px;
}

.module-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.module-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
}

.module-card h3 {
  font-size: 18px;
  color: #303133;
  margin: 0;
}

.module-desc {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 15px;
}

.module-info {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #909399;
  font-size: 14px;
}

.module-files code {
  display: block;
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #1a1a1a;
  margin-bottom: 15px;
}

/* Scheme 1 折叠面板 */
.scheme-modules h3 {
  font-size: 20px;
  color: #303133;
  margin: 0 0 20px 0;
}

.module-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.module-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

.module-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.module-content {
  padding: 15px 0;
}

.module-content p {
  margin-bottom: 10px;
  color: #606266;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 10px 0;
}

.file-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  color: #606266;
  font-size: 14px;
}

/* 指南卡片 */
.guide-card {
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
  text-align: center;
}

.guide-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.guide-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.guide-card h4 {
  font-size: 16px;
  color: #303133;
  margin: 10px 0;
}

.guide-card p {
  font-size: 13px;
  color: #606266;
  margin: 10px 0;
}

.guide-meta {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 10px;
}

/* 日期分组 */
.date-group h3 {
  font-size: 18px;
  color: #667eea;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #e4e7ed;
}

/* 时间线 */
.el-timeline {
  padding-left: 10px;
}

.el-timeline-item__content {
  h4 {
    font-size: 16px;
    color: #303133;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: #606266;
    margin: 8px 0;
  }
}

/* 模块文档卡片 */
.mod-doc-card {
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.mod-doc-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.mod-doc-icon {
  font-size: 36px;
  margin-bottom: 10px;
}

.mod-doc-card h4 {
  font-size: 16px;
  color: #303133;
  margin: 10px 0;
}

.mod-doc-card p {
  font-size: 13px;
  color: #606266;
  margin: 10px 0;
}

.mod-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.mod-stats span {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #909399;
}

/* 文档抽屉 */
.doc-drawer :deep(.el-drawer__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 20px;
}

.doc-drawer :deep(.el-drawer__body) {
  padding: 20px;
  background: #f5f7fa;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 20px;
  color: #909399;
}

.loading-container .el-icon {
  font-size: 48px;
  color: #667eea;
}

.doc-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.empty-content .el-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

/* Markdown 样式 */
.markdown-body :deep(h1) {
  font-size: 28px;
  color: #303133;
  border-bottom: 2px solid #e4e7ed;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.markdown-body :deep(h2) {
  font-size: 24px;
  color: #303133;
  margin-top: 30px;
  margin-bottom: 15px;
}

.markdown-body :deep(h3) {
  font-size: 20px;
  color: #303133;
  margin-top: 25px;
  margin-bottom: 12px;
}

.markdown-body :deep(p) {
  line-height: 1.8;
  color: #606266;
  margin-bottom: 15px;
}

.markdown-body :deep(code) {
  background: #e6f3ff;
  color: #1a1a1a;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
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

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 25px;
  margin-bottom: 15px;
}

.markdown-body :deep(li) {
  margin-bottom: 8px;
  line-height: 1.6;
  color: #606266;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid #409eff;
  padding-left: 16px;
  margin: 15px 0;
  color: #606266;
  background: #f5f7fa;
  padding: 10px 16px;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid #dcdfe6;
  padding: 8px 12px;
  text-align: left;
}

.markdown-body :deep(th) {
  background: #f5f7fa;
  font-weight: 600;
}

.markdown-body :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

/* 响应式 */
@media (max-width: 768px) {
  .doc-card,
  .module-card,
  .guide-card,
  .mod-doc-card {
    margin-bottom: 15px;
  }

  .module-info {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
