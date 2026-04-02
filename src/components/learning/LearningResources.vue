<template>
  <div class="learning-resources">
    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="resources-tabs">
      <!-- 教程列表 -->
      <el-tab-pane label="📚 教程" name="tutorials">
        <div class="resource-list">
          <div
            v-for="tutorial in tutorials"
            :key="tutorial.id"
            :class="['resource-card', { 'resource-recommended': tutorial.recommended }]"
            @click="openResource(tutorial)"
          >
            <div class="card-badge" v-if="tutorial.recommended">
              <span class="badge-icon">⭐</span>
              <span class="badge-text">推荐</span>
            </div>
            <div class="card-header">
              <span class="card-icon">{{ getTypeIcon(tutorial.type) }}</span>
              <span class="card-language" :class="`lang-${tutorial.language}`">
                {{ tutorial.language === 'zh-CN' ? '中文' : 'EN' }}
              </span>
            </div>
            <h4 class="card-title">{{ tutorial.title }}</h4>
            <p class="card-description">{{ tutorial.url }}</p>
            <div class="card-footer">
              <el-tag size="small" :type="getTypeTagType(tutorial.type)">
                {{ getTypeName(tutorial.type) }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 视频列表 -->
      <el-tab-pane label="📺 视频" name="videos">
        <div class="resource-list">
          <div
            v-for="video in videos"
            :key="video.id"
            class="resource-card video-card"
            @click="openResource(video)"
          >
            <div class="video-thumbnail">
              <span class="play-icon">▶</span>
              <span class="duration-badge">{{ video.duration }}</span>
            </div>
            <div class="card-content">
              <h4 class="card-title">{{ video.title }}</h4>
              <div class="video-meta">
                <span class="meta-item">⏱️ {{ video.duration }}</span>
                <span class="meta-item">🌐 {{ video.language === 'zh-CN' ? '中文' : 'EN' }}</span>
              </div>
              <div class="video-stage" v-if="video.stage">
                <el-tag size="small" type="info">{{ getStageName(video.stage) }}</el-tag>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 实践项目 -->
      <el-tab-pane label="🚀 实践项目" name="projects">
        <div class="project-list">
          <div
            v-for="project in projects"
            :key="project.id"
            class="project-card"
            @click="selectProject(project)"
          >
            <div class="project-header">
              <h4 class="project-title">{{ project.title }}</h4>
              <span
                class="difficulty-badge"
                :style="{ backgroundColor: getDifficultyColor(project.difficulty) }"
              >
                {{ project.difficulty }}
              </span>
            </div>
            <p class="project-description">{{ project.description }}</p>
            <div class="project-footer">
              <span class="project-meta">
                <span class="meta-icon">⏱️</span>
                {{ project.estimatedTime }}
              </span>
              <el-tag v-if="project.stage" size="small" type="primary">
                {{ getStageName(project.stage) }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 快速链接 -->
      <el-tab-pane label="⚡ 快速链接" name="quicklinks">
        <div class="quick-links">
          <a
            v-for="link in quickLinks"
            :key="link.url"
            :href="link.url"
            target="_blank"
            class="quick-link-item"
          >
            <span class="link-icon">{{ link.icon }}</span>
            <div class="link-content">
              <span class="link-title">{{ link.title }}</span>
              <span class="link-description">{{ link.description }}</span>
            </div>
            <span class="link-arrow">→</span>
          </a>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  tutorials: {
    type: Array,
    default: () => []
  },
  videos: {
    type: Array,
    default: () => []
  },
  projects: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['open-resource', 'select-project'])

// 状态
const activeTab = ref('tutorials')

// 快速链接
const quickLinks = [
  {
    title: 'GitHub 仓库',
    description: 'Aero Hand Open 官方源码',
    url: 'https://github.com/TetherIA/aero-hand-open',
    icon: '📦'
  },
  {
    title: '官方文档',
    description: '完整的技术文档和API参考',
    url: 'https://docs.tetheria.ai',
    icon: '📖'
  },
  {
    title: 'MuJoCo 官方',
    description: 'MuJoCo 物理仿真引擎文档',
    url: 'https://mujoco.readthedocs.io',
    icon: '🔬'
  },
  {
    title: 'ROS2 文档',
    description: 'ROS2 Humble 官方教程',
    url: 'https://docs.ros.org/en/humble',
    icon: '🔗'
  },
  {
    title: 'JAX 文档',
    description: 'JAX 高性能数值计算库',
    url: 'https://jax.readthedocs.io',
    icon: '⚡'
  }
]

// 方法
const getTypeIcon = (type) => {
  const icons = {
    'official': '🌐',
    'course': '🎓',
    'tutorial': '📝',
    'video': '📺',
    'paper': '📑'
  }
  return icons[type] || '🔗'
}

const getTypeName = (type) => {
  const names = {
    'official': '官方',
    'course': '课程',
    'tutorial': '教程',
    'video': '视频',
    'paper': '论文'
  }
  return names[type] || '其他'
}

const getTypeTagType = (type) => {
  const types = {
    'official': 'success',
    'course': 'warning',
    'tutorial': 'primary',
    'video': 'danger',
    'paper': 'info'
  }
  return types[type] || 'info'
}

const getStageName = (stageId) => {
  const names = {
    'hardware': '硬件',
    'firmware': '固件',
    'servo-config': '舵机',
    'sdk-usage': 'SDK',
    'mujoco': '仿真',
    'ros2': 'ROS2',
    'rl-training': 'RL训练',
    'sim2real': '部署'
  }
  return names[stageId] || stageId
}

const getDifficultyColor = (difficulty) => {
  const colors = {
    '入门': '#67c23a',
    '基础': '#409eff',
    '进阶': '#e6a23c',
    '高级': '#f56c6c'
  }
  return colors[difficulty] || '#909399'
}

const openResource = (resource) => {
  if (resource.url) {
    window.open(resource.url, '_blank')
  }
  emit('open-resource', resource)
}

const selectProject = (project) => {
  emit('select-project', project)
}
</script>

<style scoped>
.learning-resources {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* 标签页 */
.resources-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.resources-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

/* 资源列表 */
.resource-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

/* 资源卡片 */
.resource-card {
  position: relative;
  background: #fafafa;
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.resource-card:hover {
  background: white;
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.resource-recommended {
  border-color: #f56c6c;
  background: linear-gradient(135deg, #fff5f5 0%, #fef0f0 100%);
}

.card-badge {
  position: absolute;
  top: -6px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
  background: linear-gradient(135deg, #f56c6c 0%, #e6a23c 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
}

.badge-icon {
  font-size: 10px;
}

.badge-text {
  font-weight: 600;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-icon {
  font-size: 24px;
}

.card-language {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.lang-zh-CN {
  background: #fef0f0;
  color: #f56c6c;
}

.lang-en {
  background: #ecf5ff;
  color: #409eff;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.card-description {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-footer {
  display: flex;
  justify-content: flex-start;
}

/* 视频卡片 */
.video-card {
  display: flex;
  gap: 12px;
}

.video-thumbnail {
  position: relative;
  width: 100px;
  height: 70px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.play-icon {
  font-size: 24px;
  color: white;
  opacity: 0.9;
}

.duration-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 10px;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-content .card-title {
  margin-bottom: 4px;
}

.video-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
}

.meta-item {
  font-size: 11px;
  color: #909399;
}

.video-stage {
  margin-top: 4px;
}

/* 项目列表 */
.project-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-card {
  background: #fafafa;
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.project-card:hover {
  background: white;
  border-color: #409eff;
  transform: translateX(4px);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.project-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.difficulty-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  color: white;
}

.project-description {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.meta-icon {
  font-size: 12px;
}

/* 快速链接 */
.quick-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-link-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fafafa;
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.quick-link-item:hover {
  background: #ecf5ff;
  transform: translateX(4px);
}

.link-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.link-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.link-title {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.link-description {
  font-size: 12px;
  color: #909399;
}

.link-arrow {
  font-size: 18px;
  color: #c0c4cc;
  transition: transform 0.3s ease;
}

.quick-link-item:hover .link-arrow {
  transform: translateX(4px);
  color: #409eff;
}
</style>
