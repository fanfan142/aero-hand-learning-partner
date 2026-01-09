<template>
  <div class="welcome-page">
    <!-- 官方项目大卡片 -->
    <div class="official-project-card">
      <div class="card-content">
        <div class="project-header">
          <h1 class="project-title">🚀 Aero Hand Open</h1>
          <p class="project-subtitle">开源肌腱驱动灵巧机械手</p>
        </div>

        <el-divider />

        <div class="project-links">
          <a
            href="https://tetheria.github.io/aero-hand-open/"
            target="_blank"
            class="official-link"
          >
            <el-icon class="link-icon"><Link /></el-icon>
            <div class="link-content">
              <div class="link-title">📖 官方文档</div>
              <div class="link-url">tetheria.github.io/aero-hand-open</div>
            </div>
            <el-icon class="external-icon"><TopRight /></el-icon>
          </a>

          <a
            href="https://github.com/TetherIA/aero-hand-open"
            target="_blank"
            class="official-link"
          >
            <el-icon class="link-icon"><DocumentCopy /></el-icon>
            <div class="link-content">
              <div class="link-title">💾 源代码仓库</div>
              <div class="link-url">github.com/TetherIA/aero-hand-open</div>
            </div>
            <el-icon class="external-icon"><TopRight /></el-icon>
          </a>
        </div>

        <el-alert
          type="warning"
          :closable="false"
          class="mt-4"
        >
          <template #title>
            <strong>⚠️ 重要提示：</strong>请务必先阅读官方文档，了解项目背景和技术架构！
          </template>
        </el-alert>
      </div>
    </div>

    <!-- 网站介绍卡片 -->
    <div class="intro-section">
      <div class="intro-card card">
        <h2>🎓 关于本网站</h2>
        <p class="intro-description">
          这是一个<strong>交互式学习伙伴</strong>，帮助你系统地学习和复现 Aero Hand Open 项目。
          无论你是机械工程学生、机器人爱好者，还是研究人员，这里都有你需要的资源。
        </p>

        <el-row :gutter="20" class="mt-4">
          <el-col :span="12">
            <div class="feature-section">
              <h3>🎯 核心功能</h3>
              <ul class="feature-list">
                <li>✅ <strong>学习进度追踪</strong> - 可视化显示学习阶段和完成度</li>
                <li>✅ <strong>技术知识库</strong> - 完整的中文技术文档</li>
                <li>✅ <strong>硬件清单</strong> - 详细的零件列表和规格</li>
                <li>✅ <strong>项目结构</strong> - 解读每个文件的作用</li>
                <li>✅ <strong>AI助手</strong> - 支持多种AI的问答系统</li>
              </ul>
            </div>
          </el-col>

          <el-col :span="12">
            <div class="feature-section">
              <h3>🛠️ 技术栈</h3>
              <div class="tech-tree">
                <div class="tech-item">
                  <span class="tech-icon">🔧</span>
                  <div>
                    <strong>硬件</strong>
                    <p>ESP32-S3、HLS3606M舵机、3D打印</p>
                  </div>
                </div>
                <div class="tech-item">
                  <span class="tech-icon">💻</span>
                  <div>
                    <strong>固件</strong>
                    <p>Arduino框架、串口协议</p>
                  </div>
                </div>
                <div class="tech-item">
                  <span class="tech-icon">🐍</span>
                  <div>
                    <strong>SDK</strong>
                    <p>Python控制接口</p>
                  </div>
                </div>
                <div class="tech-item">
                  <span class="tech-icon">🎮</span>
                  <div>
                    <strong>仿真</strong>
                    <p>MuJoCo物理引擎、MJX</p>
                  </div>
                </div>
                <div class="tech-item">
                  <span class="tech-icon">🤖</span>
                  <div>
                    <strong>AI</strong>
                    <p>PPO强化学习算法</p>
                  </div>
                </div>
                <div class="tech-item">
                  <span class="tech-icon">🔄</span>
                  <div>
                    <strong>Sim2Real</strong>
                    <p>从仿真到实物转移</p>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 学习路线预览 -->
    <div class="roadmap-preview card">
      <h2>📚 学习路线（8个阶段）</h2>
      <div class="roadmap-grid">
        <div
          v-for="(stage, index) in stages"
          :key="stage.id"
          :class="['roadmap-stage', `stage-${index + 1}`]"
        >
          <div class="stage-number">{{ index + 1 }}</div>
          <div class="stage-info">
            <div class="stage-title">{{ stage.title }}</div>
            <div class="stage-tasks">{{ stage.tasks.length }} 个任务</div>
          </div>
        </div>
      </div>
      <div class="roadmap-cta">
        <el-button type="primary" size="large" @click="goToLearning">
          <el-icon><Location /></el-icon>
          开始学习之旅
        </el-button>
      </div>
    </div>

    <!-- 存储说明 -->
    <div class="storage-info card">
      <h3>💾 数据存储说明</h3>
      <el-alert
        type="info"
        :closable="false"
        class="storage-alert"
      >
        <template #title>
          <div class="storage-content">
            <p><strong>学习进度</strong>和<strong>AI配置</strong>保存在<strong>浏览器本地</strong>：</p>
            <ul>
              <li>✅ 每个设备独立存储</li>
              <li>✅ 无需登录，快速使用</li>
              <li>❌ 清除浏览器数据会丢失进度</li>
              <li>❌ 换设备需要重新开始</li>
            </ul>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 快速开始 -->
    <div class="quick-start card">
      <h2>🚀 快速开始</h2>
      <el-steps :active="1" finish-status="success" align-center>
        <el-step title="阅读官方文档" description="了解项目背景和架构" />
        <el-step title="查看硬件清单" description="确认所需零件和工具" />
        <el-step title="开始学习" description="按照路线图逐步学习" />
      </el-steps>

      <div class="start-actions mt-4">
        <el-button type="primary" @click="goToDocs">
          <el-icon><Reading /></el-icon>
          查看官方文档
        </el-button>
        <el-button @click="goToHardware">
          <el-icon><Box /></el-icon>
          硬件清单
        </el-button>
        <el-button type="success" @click="goToLearning">
          <el-icon><Odometer /></el-icon>
          开始学习
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import { Link, TopRight, DocumentCopy, Location, Reading, Box, Odometer } from '@element-plus/icons-vue'

const router = useRouter()
const learningStore = useLearningStore()

const stages = learningStore.stages

const goToLearning = () => {
  router.push('/learning')
}

const goToDocs = () => {
  router.push('/docs')
}

const goToHardware = () => {
  router.push('/hardware')
}
</script>

<style scoped>
.welcome-page {
  max-width: 1400px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

/* 官方项目卡片 */
.official-project-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  margin-bottom: 30px;
}

.card-content {
  color: white;
}

.project-header {
  text-align: center;
  margin-bottom: 30px;
}

.project-title {
  font-size: 42px;
  margin: 0 0 10px 0;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.project-subtitle {
  font-size: 20px;
  margin: 0;
  opacity: 0.95;
}

.project-links {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 30px;
}

.official-link {
  flex: 1;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  text-decoration: none;
  color: white;
  transition: all 0.3s;
  cursor: pointer;
}

.official-link:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.link-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.link-content {
  flex: 1;
}

.link-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.link-url {
  font-size: 14px;
  opacity: 0.8;
}

.external-icon {
  font-size: 20px;
  flex-shrink: 0;
}

/* 网站介绍 */
.intro-section h2 {
  margin: 0 0 20px 0;
  font-size: 28px;
  color: #303133;
}

.intro-description {
  font-size: 16px;
  line-height: 1.8;
  color: #606266;
  margin-bottom: 20px;
}

.feature-section h3 {
  font-size: 18px;
  margin: 0 0 15px 0;
  color: #303133;
}

.feature-list {
  margin: 0;
  padding-left: 20px;
}

.feature-list li {
  margin-bottom: 10px;
  line-height: 1.6;
  color: #606266;
}

.tech-tree {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.tech-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.tech-item strong {
  display: block;
  color: #303133;
  font-size: 14px;
}

.tech-item p {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #909399;
}

/* 学习路线预览 */
.roadmap-preview h2 {
  margin: 0 0 20px 0;
  font-size: 28px;
  color: #303133;
}

.roadmap-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.roadmap-stage {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  transition: all 0.3s;
}

.roadmap-stage:hover {
  background: #e8eaf0;
  transform: translateX(4px);
}

.stage-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.stage-title {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  margin-bottom: 2px;
}

.stage-tasks {
  font-size: 12px;
  color: #909399;
}

.roadmap-cta {
  text-align: center;
}

/* 存储说明 */
.storage-info h3 {
  margin: 0 0 15px 0;
  font-size: 20px;
  color: #303133;
}

.storage-content ul {
  margin: 10px 0 0 0;
  padding-left: 20px;
}

.storage-content li {
  margin-bottom: 6px;
}

/* 快速开始 */
.quick-start h2 {
  margin: 0 0 20px 0;
  font-size: 28px;
  color: #303133;
}

.start-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.mt-4 {
  margin-top: 16px;
}

/* 响应式 */
@media (max-width: 768px) {
  .project-title {
    font-size: 32px;
  }

  .project-links {
    flex-direction: column;
  }

  .roadmap-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .start-actions {
    flex-direction: column;
  }
}
</style>
