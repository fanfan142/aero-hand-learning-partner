<template>
  <div class="project-structure">
    <!-- 顶部搜索和工具栏 -->
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
          <el-button @click="showDependencyGraph = true">
            <el-icon><Share /></el-icon>
            依赖关系
          </el-button>
        </div>
      </div>
      <el-alert type="info" :closable="false" class="mt-3">
        <template #title>
          <span>GitHub仓库：</span>
          <a :href="structureData.repository" target="_blank" class="repo-link">
            {{ structureData.repository }}
          </a>
        </template>
      </el-alert>
    </el-card>

    <!-- 搜索和统计栏 -->
    <el-card class="mb-4 search-card">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input
            v-model="searchQuery"
            placeholder="搜索文件或目录..."
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </el-col>
        <el-col :span="12">
          <div class="stats-row">
            <el-statistic title="总模块数" :value="structureData.directories.length" />
            <el-statistic title="总文件数" :value="totalFileCount" />
            <el-statistic title="代码行数" :value="totalLines" />
            <el-statistic title="关键配置" :value="structureData.criticalConfigs.length" />
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 面包屑导航 -->
    <div class="breadcrumb-nav">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">
          <el-icon><House /></el-icon>
          首页
        </el-breadcrumb-item>
        <el-breadcrumb-item>
          <el-icon><FolderOpened /></el-icon>
          项目结构
        </el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentPath.length > 0">
          {{ currentPath.join(' / ') }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 标签页切换：树形视图 / 统计视图 -->
    <el-tabs v-model="activeTab" class="main-tabs">
      <!-- 树形视图 -->
      <el-tab-pane label="📁 树形视图" name="tree">
        <div class="tree-view">
          <!-- 根目录文件 -->
          <el-card class="mb-4" v-if="searchQuery === ''">
            <template #header>
              <div class="card-header">
                <el-icon><Document /></el-icon>
                <span>根目录文件</span>
                <el-tag type="info" size="small" class="ml-2">{{ structureData.rootFiles.length }} 个文件</el-tag>
              </div>
            </template>
            <el-table :data="structureData.rootFiles" stripe size="small">
              <el-table-column prop="name" label="文件名" min-width="200">
                <template #default="{ row }">
                  <div class="file-name-cell" @click="showFileDetail(row)">
                    <el-icon class="file-icon" :style="{ color: getFileIconColor(row.type) }">
                      <component :is="getFileIcon(row.type)" />
                    </el-icon>
                    <span class="file-name-text">{{ row.name }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="type" label="类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="getTypeTagType(row.type)" size="small">{{ row.type }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="说明" min-width="300" show-overflow-tooltip />
              <el-table-column prop="importance" label="重要性" width="100">
                <template #default="{ row }">
                  <el-tag :type="getImportanceTagType(row.importance)" size="small">
                    {{ getImportanceLabel(row.importance) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" size="small" text @click="showFileDetail(row)">
                    详情
                  </el-button>
                  <el-button
                    v-if="row.link"
                    type="success"
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

          <!-- 目录树 -->
          <div class="directory-tree">
            <el-tree
              :data="treeData"
              :props="treeProps"
              :default-expand-all="false"
              :expand-on-click-node="false"
              :lazy="false"
              highlight-current
              node-key="id"
              ref="treeRef"
              @node-click="handleTreeNodeClick"
              @node-expand="handleNodeExpand"
              @node-collapse="handleNodeCollapse"
              class="custom-tree"
            >
              <template #default="{ node, data }">
                <div
                  class="tree-node-content"
                  :class="{ 'is-highlight': data.highlighted }"
                  @contextmenu.prevent="showContextMenu($event, data)"
                >
                  <div class="node-icon">
                    <el-icon
                      :style="{ color: data.type === 'directory' ? '#e6a23c' : getFileIconColor(data.fileType) }"
                    >
                      <component :is="data.type === 'directory' ? (node.expanded ? FolderOpened : Folder) : getFileIcon(data.fileType)" />
                    </el-icon>
                  </div>
                  <div class="node-info">
                    <span class="node-label" :class="{ 'is-dir': data.type === 'directory' }">
                      {{ data.label }}
                    </span>
                    <span v-if="data.type !== 'directory' && data.importance" class="node-importance">
                      <el-tag :type="getImportanceTagType(data.importance)" size="small">
                        {{ getImportanceLabel(data.importance) }}
                      </el-tag>
                    </span>
                  </div>
                  <div v-if="data.type !== 'directory'" class="node-meta">
                    <el-tag v-if="data.fileType" :type="getTypeTagType(data.fileType)" size="small">
                      {{ data.fileType }}
                    </el-tag>
                  </div>
                </div>
              </template>
            </el-tree>
          </div>

          <!-- 搜索结果 -->
          <div v-if="searchQuery !== '' && searchResults.length > 0" class="search-results">
            <h4>搜索结果 ({{ searchResults.length }})</h4>
            <div v-for="result in searchResults" :key="result.path" class="search-result-item">
              <el-icon :style="{ color: result.type === 'directory' ? '#e6a23c' : getFileIconColor(result.fileType) }">
                <component :is="result.type === 'directory' ? Folder : getFileIcon(result.fileType)" />
              </el-icon>
              <span class="result-path" v-html="highlightPath(result.path)"></span>
              <span v-if="result.importance" class="result-importance">
                <el-tag :type="getImportanceTagType(result.importance)" size="small">
                  {{ getImportanceLabel(result.importance) }}
                </el-tag>
              </span>
              <el-button type="primary" size="small" text @click="navigateToResult(result)">
                定位
              </el-button>
            </div>
          </div>

          <div v-if="searchQuery !== '' && searchResults.length === 0" class="no-results">
            <el-empty description="未找到匹配的文件或目录" />
          </div>
        </div>
      </el-tab-pane>

      <!-- 模块统计视图 -->
      <el-tab-pane label="📊 模块统计" name="stats">
        <el-row :gutter="20">
          <el-col :span="8" v-for="dir in structureData.directories" :key="dir.name">
            <el-card class="module-stat-card" shadow="hover">
              <template #header>
                <div class="module-stat-header">
                  <span class="module-icon">{{ dir.icon }}</span>
                  <span class="module-name">{{ dir.name }}/</span>
                  <el-tag :type="getImportanceTagType(dir.importance)" size="small">
                    {{ getImportanceLabel(dir.importance) }}
                  </el-tag>
                </div>
              </template>
              <div class="module-stat-body">
                <p class="module-desc">{{ dir.description }}</p>
                <el-divider />
                <div class="module-meta">
                  <div class="meta-item">
                    <el-icon><Folder /></el-icon>
                    <span>子目录: {{ dir.subdirectories?.length || 0 }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><Document /></el-icon>
                    <span>文件: {{ countFilesInDir(dir) }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><Coin /></el-icon>
                    <span>语言: {{ dir.language }}</span>
                  </div>
                </div>
                <el-progress
                  :percentage="getModuleImportancePercent(dir.importance)"
                  :color="getImportanceProgressColor(dir.importance)"
                  :stroke-width="8"
                />
                <div class="module-importance-label">
                  重要性: {{ getImportanceLabel(dir.importance) }}
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- 依赖关系视图 -->
      <el-tab-pane label="🔗 依赖关系" name="dependencies">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Share /></el-icon>
              <span>模块依赖关系图</span>
            </div>
          </template>
          <div class="dependency-graph">
            <div class="dep-flow">
              <div class="dep-item dep-start">
                <el-tag type="danger" size="large">硬件 (Hardware)</el-tag>
                <p class="dep-desc">物理机械手</p>
              </div>
              <div class="dep-arrow">
                <el-icon><Right /></el-icon>
              </div>
              <div class="dep-item">
                <el-tag type="warning" size="large">固件 (Firmware)</el-tag>
                <p class="dep-desc">ESP32-S3 控制</p>
              </div>
              <div class="dep-arrow">
                <el-icon><Right /></el-icon>
              </div>
              <div class="dep-item">
                <el-tag type="primary" size="large">SDK</el-tag>
                <p class="dep-desc">Python 接口</p>
              </div>
              <div class="dep-arrow">
                <el-icon><Right /></el-icon>
              </div>
              <div class="dep-item">
                <el-tag type="success" size="large">ROS2 / 仿真</el-tag>
                <p class="dep-desc">高级控制 & RL</p>
              </div>
            </div>

            <el-divider />

            <h4>关键依赖链</h4>
            <el-space wrap class="dep-chains">
              <el-tag
                v-for="(chain, idx) in dependencyChains"
                :key="idx"
                type="info"
                effect="plain"
                class="dep-chain-tag"
              >
                {{ chain }}
              </el-tag>
            </el-space>

            <el-divider />

            <h4>配置文件依赖</h4>
            <el-table :data="structureData.criticalConfigs" stripe size="small">
              <el-table-column prop="file" label="配置文件" min-width="250">
                <template #default="{ row }">
                  <code class="config-path">{{ row.file }}</code>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="说明" min-width="200" />
              <el-table-column prop="impact" label="影响" min-width="200">
                <template #default="{ row }">
                  <el-tag type="warning" size="small">{{ row.impact }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 右键菜单 -->
    <div
      v-show="contextMenuVisible"
      class="context-menu"
      :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
    >
      <div class="context-menu-item" @click="copyPath">
        <el-icon><CopyDocument /></el-icon>
        复制路径
      </div>
      <div class="context-menu-item" @click="navigateToContextItem">
        <el-icon><Position /></el-icon>
        定位到此处
      </div>
      <div class="context-menu-item" @click="showItemDetail">
        <el-icon><InfoFilled /></el-icon>
        查看详情
      </div>
    </div>

    <!-- 文件详情对话框 -->
    <el-dialog v-model="showDetail" :title="selectedFile?.name || '详情'" width="600px">
      <div v-if="selectedFile" class="file-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="文件名">
            <code>{{ selectedFile.name }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="getTypeTagType(selectedFile.type)" size="small">
              {{ selectedFile.type }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="重要性">
            <el-tag :type="getImportanceTagType(selectedFile.importance)" size="small">
              {{ getImportanceLabel(selectedFile.importance) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="路径">
            <code>{{ getFullPath(selectedFile) }}</code>
            <el-button
              size="small"
              text
              @click="copyToClipboard(getFullPath(selectedFile))"
              v-copy="getFullPath(selectedFile)"
            >
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <div class="detail-section">
          <h4>说明</h4>
          <p>{{ selectedFile.description }}</p>
        </div>

        <div v-if="selectedFile.actions" class="detail-section">
          <h4>可执行操作</h4>
          <el-space wrap>
            <el-tag v-for="(action, idx) in selectedFile.actions" :key="idx" type="success">
              {{ action }}
            </el-tag>
          </el-space>
        </div>

        <div v-if="selectedFile.dependencies" class="detail-section">
          <h4>依赖项</h4>
          <el-space wrap>
            <el-tag v-for="(dep, idx) in selectedFile.dependencies" :key="idx" type="warning">
              {{ dep }}
            </el-tag>
          </el-space>
        </div>

        <div v-if="selectedFile.usageExample" class="detail-section">
          <h4>使用示例</h4>
          <code class="usage-code">{{ selectedFile.usageExample }}</code>
        </div>

        <div v-if="selectedFile.notes" class="detail-section">
          <el-alert type="warning" :closable="false">{{ selectedFile.notes }}</el-alert>
        </div>
      </div>
    </el-dialog>

    <!-- 开发流程对话框 -->
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

    <!-- 依赖关系对话框 -->
    <el-dialog v-model="showDependencyGraph" title="模块依赖关系" width="700px">
      <div class="dep-graph-dialog">
        <el-steps direction="vertical" :space="100">
          <el-step
            v-for="(step, index) in dependencySteps"
            :key="index"
            :title="step.title"
            :description="step.description"
            :status="step.status"
          />
        </el-steps>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { projectStructure } from '@/data/project-structure.js'
import {
  Document, Folder, FolderOpened, ArrowRight,
  Operation, Tools, CaretRight, Link, Edit,
  Files, Setting, Grid, DataAnalysis, Picture,
  Coin, Notebook, VideoCamera, Search, House,
  Right, Share, CopyDocument, Position, InfoFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const structureData = ref(projectStructure)
const expandedDirs = ref(new Set(['firmware', 'sdk']))
const expandedSubdirs = ref({})
const showWorkflows = ref(false)
const showDependencyGraph = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const activeTab = ref('tree')
const treeRef = ref(null)
const currentPath = ref([])
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuData = ref(null)
const showDetail = ref(false)
const selectedFile = ref(null)

const treeProps = {
  children: 'children',
  label: 'label',
  isLeaf: 'isLeaf'
}

// 生成树形数据
const generateTreeData = () => {
  const tree = []

  // 添加根目录文件作为树的顶层
  structureData.value.rootFiles.forEach(file => {
    tree.push({
      id: `root-${file.name}`,
      label: file.name,
      type: 'file',
      fileType: file.type,
      importance: file.importance,
      description: file.description,
      path: file.name,
      highlighted: searchQuery.value && file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    })
  })

  // 添加各个目录
  structureData.value.directories.forEach(dir => {
    const dirNode = {
      id: `dir-${dir.name}`,
      label: `${dir.name}/`,
      type: 'directory',
      path: dir.name,
      importance: dir.importance,
      description: dir.description,
      highlighted: searchQuery.value && dir.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
      children: []
    }

    // 添加子目录和文件
    if (dir.subdirectories) {
      dir.subdirectories.forEach(subdir => {
        const subdirNode = {
          id: `dir-${dir.name}-${subdir.name}`,
          label: subdir.name,
          type: 'directory',
          path: `${dir.name}/${subdir.name}`,
          description: subdir.description,
          highlighted: searchQuery.value && subdir.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
          children: []
        }

        if (subdir.files) {
          subdir.files.forEach(file => {
            subdirNode.children.push({
              id: `file-${dir.name}-${subdir.name}-${file.name}`,
              label: file.name,
              type: 'file',
              fileType: file.type,
              importance: file.importance,
              description: file.description,
              path: `${dir.name}/${subdir.name}/${file.name}`,
              actions: file.actions,
              dependencies: file.dependencies,
              usageExample: file.usageExample,
              notes: file.notes,
              highlighted: searchQuery.value && file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
            })
          })
        }

        if (subdir.subfiles) {
          subdir.subfiles.forEach(file => {
            subdirNode.children.push({
              id: `file-${dir.name}-${subdir.name}-${file.name}`,
              label: file.name,
              type: 'file',
              fileType: file.type,
              importance: file.importance,
              description: file.description,
              path: `${dir.name}/${subdir.name}/${file.name}`,
              highlighted: searchQuery.value && file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
            })
          })
        }

        dirNode.children.push(subdirNode)
      })
    }

    tree.push(dirNode)
  })

  return tree
}

const treeData = computed(() => generateTreeData())

// 统计数据
const totalFileCount = computed(() => {
  let count = structureData.value.rootFiles.length
  structureData.value.directories.forEach(dir => {
    if (dir.subdirectories) {
      dir.subdirectories.forEach(subdir => {
        count += (subdir.files?.length || 0) + (subdir.subfiles?.length || 0)
      })
    }
  })
  return count
})

const totalLines = computed(() => {
  // 估算值，实际需要扫描文件
  return '~50,000'
})

const dependencyChains = computed(() => [
  'HandConfig.h → Homing.cpp → firmware_v0.1.0.ino',
  'aero_hand.py → AeroHand class → Serial Communication',
  'aero_hand.xml → MuJoCo Model → Physics Simulation',
  'tasks.py → PPO Algorithm → RL Training',
  'package.xml → CMakeLists.txt → ROS2 Build'
])

const dependencySteps = computed(() => [
  { title: '硬件设计 (Hardware)', description: 'CAD模型 + PCB设计 + BOM清单', status: 'success' },
  { title: '固件开发 (Firmware)', description: 'ESP32-S3 + Arduino框架 + 舵机控制', status: 'process' },
  { title: 'SDK封装 (SDK)', description: 'Python接口 + 串口协议 + GUI工具', status: 'process' },
  { title: 'ROS2集成 / 仿真训练', description: '话题通信 / MuJoCo + JAX RL', status: 'process' },
  { title: 'Sim2Real部署', description: '域随机化 + 策略迁移', status: 'wait' }
])

// 搜索功能
const handleSearch = () => {
  if (searchQuery.value === '') {
    searchResults.value = []
    return
  }

  const results = []
  const query = searchQuery.value.toLowerCase()

  // 搜索根目录文件
  structureData.value.rootFiles.forEach(file => {
    if (file.name.toLowerCase().includes(query) || file.description?.toLowerCase().includes(query)) {
      results.push({
        ...file,
        type: 'file',
        path: file.name
      })
    }
  })

  // 搜索目录
  structureData.value.directories.forEach(dir => {
    if (dir.name.toLowerCase().includes(query) || dir.description?.toLowerCase().includes(query)) {
      results.push({
        ...dir,
        type: 'directory',
        path: dir.name
      })
    }

    if (dir.subdirectories) {
      dir.subdirectories.forEach(subdir => {
        if (subdir.name.toLowerCase().includes(query) || subdir.description?.toLowerCase().includes(query)) {
          results.push({
            ...subdir,
            type: 'directory',
            path: `${dir.name}/${subdir.name}`
          })
        }

        if (subdir.files) {
          subdir.files.forEach(file => {
            if (file.name.toLowerCase().includes(query) || file.description?.toLowerCase().includes(query)) {
              results.push({
                ...file,
                type: 'file',
                fileType: file.type,
                path: `${dir.name}/${subdir.name}/${file.name}`
              })
            }
          })
        }
      })
    }
  })

  searchResults.value = results
}

const highlightPath = (path) => {
  if (!searchQuery.value) return path
  const regex = new RegExp(`(${searchQuery.value})`, 'gi')
  return path.replace(regex, '<mark class="highlight">$1</mark>')
}

const navigateToResult = (result) => {
  // 展开对应的树节点
  if (treeRef.value) {
    const nodeId = result.path.replace(/\//g, '-').replace(/\./g, '_')
    const node = treeRef.value.getNode(nodeId)
    if (node) {
      treeRef.value.expandNode(node)
    }
  }
}

// 树节点操作
const handleTreeNodeClick = (data) => {
  currentPath.value = data.path.split('/')
  if (data.type === 'file') {
    showFileDetail(data)
  }
}

const handleNodeExpand = (data) => {
  // 节点展开时的处理
}

const handleNodeCollapse = (data) => {
  // 节点折叠时的处理
}

// 展开/折叠
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
  const expandNodes = (nodes) => {
    nodes.forEach(node => {
      if (node.type === 'directory' && treeRef.value) {
        const treeNode = treeRef.value.getNode(node.id)
        if (treeNode) {
          treeRef.value.expandNode(treeNode)
        }
        if (node.children) {
          expandNodes(node.children)
        }
      }
    })
  }
  expandNodes(treeData.value)
}

const collapseAll = () => {
  const collapseNodes = (nodes) => {
    nodes.forEach(node => {
      if (node.type === 'directory' && treeRef.value) {
        const treeNode = treeRef.value.getNode(node.id)
        if (treeNode) {
          treeRef.value.collapseNode(treeNode)
        }
        if (node.children) {
          collapseNodes(node.children)
        }
      }
    })
  }
  collapseNodes(treeData.value)
}

// 文件详情
const showFileDetail = (file) => {
  selectedFile.value = file
  showDetail.value = true
}

const getFullPath = (file) => {
  return file.path || file.name
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  ElMessage.success('路径已复制到剪贴板')
}

// 右键菜单
const showContextMenu = (event, data) => {
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  contextMenuData.value = data
  contextMenuVisible.value = true
}

const copyPath = () => {
  if (contextMenuData.value) {
    copyToClipboard(contextMenuData.value.path)
  }
  contextMenuVisible.value = false
}

const navigateToContextItem = () => {
  if (contextMenuData.value) {
    currentPath.value = contextMenuData.value.path.split('/')
    if (contextMenuData.value.type === 'directory' && treeRef.value) {
      const node = treeRef.value.getNode(contextMenuData.value.id)
      if (node) {
        treeRef.value.expandNode(node)
      }
    }
  }
  contextMenuVisible.value = false
}

const showItemDetail = () => {
  if (contextMenuData.value) {
    selectedFile.value = contextMenuData.value
    showDetail.value = true
  }
  contextMenuVisible.value = false
}

// 关闭右键菜单
const handleClickOutside = (e) => {
  if (contextMenuVisible.value) {
    contextMenuVisible.value = false
  }
}

// 辅助函数
const countFilesInDir = (dir) => {
  let count = 0
  if (dir.subdirectories) {
    dir.subdirectories.forEach(subdir => {
      count += (subdir.files?.length || 0) + (subdir.subfiles?.length || 0)
    })
  }
  return count
}

const getModuleImportancePercent = (importance) => {
  const map = { critical: 100, high: 75, medium: 50, low: 25 }
  return map[importance] || 50
}

const getImportanceProgressColor = (importance) => {
  const map = { critical: '#f56c6c', high: '#e6a23c', medium: '#409eff', low: '#909399' }
  return map[importance] || '#409eff'
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
    tutorial: Notebook,
    legal: Document,
    html: Document,
    document: Document
  }
  return iconMap[type] || Document
}

const getFileIconColor = (type) => {
  const colorMap = {
    executable: '#67c23a',
    source: '#409eff',
    header: '#909399',
    config: '#e6a23c',
    documentation: '#909399',
    binary: '#f56c6c',
    cad: '#67c23a',
    tutorial: '#409eff',
    legal: '#909399',
    html: '#e6a23c',
    document: '#909399'
  }
  return colorMap[type] || '#909399'
}

const getTypeTagType = (type) => {
  const typeMap = {
    executable: 'success',
    source: 'primary',
    header: 'info',
    config: 'warning',
    documentation: 'info',
    binary: 'danger',
    cad: 'success',
    tutorial: 'primary',
    legal: 'info',
    html: 'warning',
    document: 'info'
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
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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

.search-card :deep(.el-card__body) {
  padding: 16px;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stats-row :deep(.el-statistic__head) {
  font-size: 12px;
  color: #909399;
}

.breadcrumb-nav {
  margin-bottom: 16px;
  padding: 8px 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.main-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.tree-view {
  min-height: 400px;
}

.directory-tree {
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.custom-tree {
  background: transparent;
}

.custom-tree :deep(.el-tree-node__content) {
  height: 36px;
}

.tree-node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
  width: 100%;
}

.tree-node-content:hover {
  background: #f5f7fa;
}

.tree-node-content.is-highlight {
  background: #ecf5ff;
}

.node-icon {
  font-size: 16px;
}

.node-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.node-label {
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.node-label.is-dir {
  font-weight: 600;
  color: #303133;
}

.node-meta {
  margin-left: auto;
}

.search-results {
  margin-top: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.search-results h4 {
  margin: 0 0 12px 0;
  color: #303133;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
}

.result-path {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.result-path :deep(.highlight) {
  background: #fef0b0;
  color: #303133;
  padding: 0 2px;
  border-radius: 2px;
}

.no-results {
  padding: 40px;
  text-align: center;
}

/* 模块统计卡片 */
.module-stat-card {
  margin-bottom: 16px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.module-stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.module-stat-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.module-icon {
  font-size: 20px;
}

.module-name {
  font-size: 18px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.module-stat-body {
  padding: 8px 0;
}

.module-desc {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.module-meta {
  display: flex;
  gap: 16px;
  margin: 12px 0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.module-importance-label {
  text-align: center;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

/* 依赖关系图 */
.dependency-graph {
  padding: 20px;
}

.dep-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
}

.dep-item {
  text-align: center;
  flex: 1;
}

.dep-desc {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #909399;
}

.dep-arrow {
  font-size: 24px;
  color: #409eff;
  flex: 0 0 50px;
}

.dep-chains {
  margin: 16px 0;
}

.dep-chain-tag {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.config-path {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  z-index: 9999;
  min-width: 150px;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.context-menu-item:hover {
  background: #f5f7fa;
}

/* 文件详情 */
.file-detail {
  padding: 8px 0;
}

.detail-section {
  margin-top: 16px;
}

.detail-section h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #303133;
}

.detail-section p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.usage-code {
  display: block;
  padding: 12px 16px;
  background: #282c34;
  color: #abb2bf;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
}

/* 通用样式 */
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.file-name-cell:hover .file-name-text {
  color: #409eff;
  text-decoration: underline;
}

.file-icon {
  font-size: 16px;
}

.file-name-text {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  transition: color 0.2s;
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

.dep-graph-dialog {
  padding: 20px;
}
</style>
