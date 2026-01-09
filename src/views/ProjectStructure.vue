<template>
  <div class="project-structure">
    <el-card class="header-card mb-4">
      <div class="header-content">
        <div class="title-section">
          <h2>{{ structureData.name }}</h2>
          <p class="description">{{ structureData.description }}</p>
        </div>
        <div class="actions">
          <el-button type="primary" @click="expandAll">
            <el-icon><FolderOpened /></el-icon>
            全部展开
          </el-button>
          <el-button @click="collapseAll">
            <el-icon><Folder /></el-icon>
            全部折叠
          </el-button>
          <el-button @click="showWorkflows = true">
            <el-icon><Operation /></el-icon>
            开发流程
          </el-button>
          <el-button @click="showTroubleshooting = true">
            <el-icon><Tools /></el-icon>
            问题排查
          </el-button>
        </div>
      </div>
      <el-alert
        type="info"
        :closable="false"
        class="mt-3"
      >
        <template #title>
          <span>GitHub仓库：</span>
          <a :href="structureData.repository" target="_blank" class="repo-link">
            {{ structureData.repository }}
          </a>
        </template>
      </el-alert>
    </el-card>

    <!-- 根目录文件 -->
    <el-card class="mb-4">
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          <span>根目录文件</span>
        </div>
      </template>
      <el-table :data="structureData.rootFiles" stripe>
        <el-table-column prop="name" label="文件名" width="200">
          <template #default="{ row }">
            <el-icon class="file-icon">
              <component :is="getFileIcon(row.type)" />
            </el-icon>
            {{ row.name }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" />
        <el-table-column prop="importance" label="重要性" width="100">
          <template #default="{ row }">
            <el-tag :type="getImportanceTagType(row.importance)" size="small">
              {{ getImportanceLabel(row.importance) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button
              v-if="row.link"
              type="primary"
              size="small"
              text
              @click="openLink(row.link)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 目录结构 -->
    <div v-for="dir in structureData.directories" :key="dir.name" class="directory-card">
      <el-card>
        <template #header>
          <div class="card-header clickable" @click="toggleDir(dir.name)">
            <el-icon>{{ dir.icon }}</el-icon>
            <span class="dir-name">{{ dir.name }}/</span>
            <el-tag :type="getImportanceTagType(dir.importance)" size="small" class="ml-2">
              {{ getImportanceLabel(dir.importance) }}
            </el-tag>
            <el-tag type="info" size="small" class="ml-2">{{ dir.language }}</el-tag>
            <el-icon class="arrow-icon" :class="{ expanded: expandedDirs.has(dir.name) }">
              <ArrowRight />
            </el-icon>
          </div>
        </template>

        <div v-if="expandedDirs.has(dir.name)" class="dir-content">
          <p class="dir-description">{{ dir.description }}</p>

          <!-- 快速开始 -->
          <el-collapse v-if="dir.gettingStarted" class="mt-3">
            <el-collapse-item title="🚀 快速开始" name="getting-started">
              <ol class="getting-started-list">
                <li v-for="(step, index) in dir.gettingStarted" :key="index">
                  {{ step }}
                </li>
              </ol>
            </el-collapse-item>
          </el-collapse>

          <!-- 子目录 -->
          <div v-for="subdir in dir.subdirectories" :key="subdir.name" class="subdir-section">
            <div class="subdir-header" @click="toggleSubdir(dir.name, subdir.name)">
              <el-icon><Folder /></el-icon>
              <span>{{ subdir.name }}</span>
              <span class="subdir-desc">{{ subdir.description }}</span>
              <el-icon class="arrow-icon" :class="{ expanded: expandedSubdirs[`${dir.name}/${subdir.name}`] }">
                <ArrowRight />
              </el-icon>
            </div>

            <div v-if="expandedSubdirs[`${dir.name}/${subdir.name}`]" class="subdir-content">
              <!-- 文件列表 -->
              <div v-for="file in subdir.files" :key="file.name" class="file-item">
                <div class="file-header">
                  <el-icon class="file-icon">
                    <component :is="getFileIcon(file.type)" />
                  </el-icon>
                  <span class="file-name">{{ file.name }}</span>
                  <el-tag :type="getImportanceTagType(file.importance)" size="small">
                    {{ getImportanceLabel(file.importance) }}
                  </el-tag>
                  <el-tag :type="getTypeTagType(file.type)" size="small">{{ file.type }}</el-tag>
                </div>
                <div class="file-details">
                  <p class="file-description">{{ file.description }}</p>

                  <!-- 可执行文件的操作 -->
                  <div v-if="file.actions && file.actions.length > 0" class="file-actions">
                    <div class="action-label">
                      <el-icon><CaretRight /></el-icon>
                      可执行操作：
                    </div>
                    <el-space wrap>
                      <el-tag
                        v-for="(action, idx) in file.actions"
                        :key="idx"
                        type="success"
                        size="small"
                        effect="plain"
                      >
                        {{ action }}
                      </el-tag>
                    </el-space>
                  </div>

                  <!-- 依赖项 -->
                  <div v-if="file.dependencies" class="file-dependencies">
                    <div class="action-label">
                      <el-icon><Link /></el-icon>
                      依赖：
                    </div>
                    <el-space wrap>
                      <el-tag
                        v-for="(dep, idx) in file.dependencies"
                        :key="idx"
                        type="warning"
                        size="small"
                        effect="plain"
                      >
                        {{ dep }}
                      </el-tag>
                    </el-space>
                  </div>

                  <!-- 使用示例 -->
                  <div v-if="file.usageExample" class="file-usage">
                    <div class="action-label">
                      <el-icon><Edit /></el-icon>
                      使用示例：
                    </div>
                    <code class="usage-code">{{ file.usageExample }}</code>
                  </div>

                  <!-- 注意事项 -->
                  <div v-if="file.notes" class="file-notes">
                    <el-alert type="warning" :closable="false">
                      {{ file.notes }}
                    </el-alert>
                  </div>
                </div>
              </div>

              <!-- 子文件列表 -->
              <div v-if="subdir.subfiles" class="subfile-list">
                <div v-for="subfile in subdir.subfiles" :key="subfile.name" class="subfile-item">
                  <el-icon class="file-icon"><Document /></el-icon>
                  <span class="file-name">{{ subfile.name }}</span>
                  <el-tag :type="getImportanceTagType(subfile.importance)" size="small">
                    {{ getImportanceLabel(subfile.importance) }}
                  </el-tag>
                  <span class="file-desc">{{ subfile.description }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 注意事项 -->
          <el-alert v-if="dir.notes" type="info" :closable="false" class="mt-3">
            {{ dir.notes }}
          </el-alert>
        </div>
      </el-card>
    </div>

    <!-- 工作流对话框 -->
    <el-dialog v-model="showWorkflows" title="开发工作流程" width="800px">
      <el-timeline>
        <el-timeline-item
          v-for="workflow in structureData.workflows"
          :key="workflow.name"
          :timestamp="workflow.name"
          placement="top"
        >
          <el-steps direction="vertical" :space="80">
            <el-step
              v-for="(step, index) in workflow.steps"
              :key="index"
              :title="step"
              :status="index === workflow.steps.length - 1 ? 'success' : 'process'"
            />
          </el-steps>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>

    <!-- 问题排查对话框 -->
    <el-dialog v-model="showTroubleshooting" title="常见问题排查" width="900px">
      <el-collapse accordion>
        <el-collapse-item
          v-for="(item, index) in structureData.troubleshooting"
          :key="index"
          :title="`🔧 ${item.issue}`"
          :name="index"
        >
          <div class="troubleshooting-content">
            <h4>解决方案：</h4>
            <ol>
              <li v-for="(solution, idx) in item.solutions" :key="idx">
                {{ solution }}
              </li>
            </ol>
            <h4 class="mt-3">相关文件：</h4>
            <el-space wrap>
              <el-tag
                v-for="(file, idx) in item.relatedFiles"
                :key="idx"
                type="info"
              >
                {{ file }}
              </el-tag>
            </el-space>
          </div>
        </el-collapse-item>
      </el-collapse>

      <el-divider />

      <h4>🔑 关键配置文件</h4>
      <el-table :data="structureData.criticalConfigs" stripe>
        <el-table-column prop="file" label="文件" width="300" />
        <el-table-column prop="description" label="说明" />
        <el-table-column prop="impact" label="影响" width="200" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { projectStructure } from '@/data/project-structure.js'
import {
  Document, Folder, FolderOpened, ArrowRight,
  Operation, Tools, CaretRight, Link, Edit,
  Files, Setting, Grid, DataAnalysis, Picture,
  Coin, Notebook, VideoCamera
} from '@element-plus/icons-vue'

const structureData = ref(projectStructure)
const expandedDirs = ref(new Set(['firmware', 'sdk']))
const expandedSubdirs = ref({})
const showWorkflows = ref(false)
const showTroubleshooting = ref(false)

// 展开/折叠目录
const toggleDir = (dirName) => {
  if (expandedDirs.value.has(dirName)) {
    expandedDirs.value.delete(dirName)
  } else {
    expandedDirs.value.add(dirName)
  }
}

const toggleSubdir = (dirName, subdirName) => {
  const key = `${dirName}/${subdirName}`
  expandedSubdirs.value[key] = !expandedSubdirs.value[key]
}

const expandAll = () => {
  structureData.value.directories.forEach(dir => {
    expandedDirs.value.add(dir.name)
    dir.subdirectories?.forEach(subdir => {
      expandedSubdirs.value[`${dir.name}/${subdir.name}`] = true
    })
  })
}

const collapseAll = () => {
  expandedDirs.value.clear()
  expandedSubdirs.value = {}
}

const openLink = (url) => {
  window.open(url, '_blank')
}

const getFileIcon = (type) => {
  const iconMap = {
    executable: VideoCamera,
    source: Edit,
    header: Files,
    config: Setting,
    documentation: Document,
    binary: Coin,
    cad: Grid,
    directory: Folder,
    tutorial: Notebook
  }
  return iconMap[type] || Document
}

const getTypeTagType = (type) => {
  const typeMap = {
    executable: 'success',
    source: 'primary',
    header: 'info',
    config: 'warning',
    documentation: '',
    binary: 'danger',
    cad: 'success',
    tutorial: 'primary'
  }
  return typeMap[type] || 'info'
}

const getImportanceTagType = (importance) => {
  const importanceMap = {
    critical: 'danger',
    high: 'warning',
    medium: 'primary',
    low: 'info'
  }
  return importanceMap[importance] || 'info'
}

const getImportanceLabel = (importance) => {
  const labelMap = {
    critical: '关键',
    high: '高',
    medium: '中',
    low: '低'
  }
  return labelMap[importance] || importance
}

onMounted(() => {
  // 默认展开一些重要的子目录
  expandedSubdirs.value['firmware/main/'] = true
  expandedSubdirs.value['sdk/src/aero_open_sdk/'] = true
  expandedSubdirs.value['sdk/examples/'] = true
})
</script>

<style scoped>
.project-structure {
  padding: 20px;
}

.header-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.header-card :deep(.el-card__body) {
  background: transparent;
  color: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: white;
}

.description {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 10px;
}

.repo-link {
  color: #ffd700;
  text-decoration: none;
  font-weight: 600;
}

.repo-link:hover {
  text-decoration: underline;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.card-header.clickable {
  cursor: pointer;
  user-select: none;
}

.dir-name {
  font-size: 18px;
  font-weight: 600;
}

.arrow-icon {
  margin-left: auto;
  transition: transform 0.3s;
}

.arrow-icon.expanded {
  transform: rotate(90deg);
}

.directory-card {
  margin-bottom: 16px;
}

.dir-content {
  padding: 16px 0;
}

.dir-description {
  margin: 0 0 16px 0;
  color: #606266;
  font-size: 14px;
}

.getting-started-list {
  margin: 0;
  padding-left: 20px;
}

.getting-started-list li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.subdir-section {
  margin-top: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.subdir-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f5f7fa;
  cursor: pointer;
  user-select: none;
  font-weight: 600;
  transition: background 0.3s;
}

.subdir-header:hover {
  background: #e6e8eb;
}

.subdir-desc {
  margin-left: 8px;
  font-weight: normal;
  color: #909399;
  font-size: 13px;
}

.subdir-content {
  padding: 16px;
  background: white;
}

.file-item {
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fafafa;
}

.file-item:last-child {
  margin-bottom: 0;
}

.file-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.file-icon {
  font-size: 18px;
  color: #409eff;
}

.file-name {
  font-weight: 600;
  font-family: 'Courier New', monospace;
  color: #303133;
}

.file-details {
  padding-left: 26px;
}

.file-description {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
}

.file-actions,
.file-dependencies,
.file-usage {
  margin-bottom: 12px;
}

.action-label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #409eff;
}

.usage-code {
  display: block;
  padding: 8px 12px;
  background: #282c34;
  color: #abb2bf;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
}

.file-notes {
  margin-top: 8px;
}

.subfile-list {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.subfile-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #e4e7ed;
}

.subfile-item:last-child {
  border-bottom: none;
}

.file-desc {
  margin-left: auto;
  color: #909399;
  font-size: 12px;
}

.troubleshooting-content h4 {
  margin: 16px 0 8px 0;
  color: #303133;
}

.troubleshooting-content ol {
  margin: 0;
  padding-left: 20px;
}

.troubleshooting-content li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.mt-3 {
  margin-top: 12px;
}

.ml-2 {
  margin-left: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th) {
  background: #f5f7fa;
}

:deep(.el-collapse-item__header) {
  font-weight: 600;
}
</style>
