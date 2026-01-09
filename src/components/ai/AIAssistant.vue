<template>
  <div class="ai-assistant">
    <!-- 聊天历史 -->
    <div class="chat-history" ref="historyRef">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message', msg.role]"
      >
        <div class="avatar">
          <el-icon v-if="msg.role === 'assistant'"><ChatDotRound /></el-icon>
          <el-icon v-else><User /></el-icon>
        </div>
        <div class="content">
          <div class="text" v-html="renderMarkdown(msg.content)"></div>
          <div class="meta">{{ msg.timestamp }}</div>
        </div>
      </div>
      <div v-if="loading" class="message assistant">
        <div class="avatar">
          <el-icon><ChatDotRound /></el-icon>
        </div>
        <div class="content">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="input-area mt-3">
      <el-input
        v-model="question"
        type="textarea"
        :rows="3"
        placeholder="随时提问，我会帮您理解... (Ctrl+Enter发送)"
        @keyup.ctrl.enter="ask"
      />
      <div class="input-actions mt-2">
        <el-button
          type="primary"
          @click="ask"
          :loading="loading"
          :disabled="!question.trim()"
        >
          <el-icon><Promotion /></el-icon>
          发送 (Ctrl+Enter)
        </el-button>
        <el-button @click="clearHistory">
          <el-icon><Delete /></el-icon>
          清空对话
        </el-button>
      </div>
    </div>

    <!-- API配置区 -->
    <div class="api-config mt-3">
      <div class="config-row">
        <el-select
          v-model="selectedProvider"
          placeholder="选择AI服务商"
          size="small"
          @change="onProviderChange"
          style="width: 200px"
        >
          <el-option
            v-for="(provider, key) in aiConfig.providers"
            :key="key"
            :label="provider.name"
            :value="key"
          >
            <span>{{ provider.name }}</span>
            <span class="provider-desc">{{ provider.description }}</span>
          </el-option>
        </el-select>

        <el-button size="small" @click="showConfigDialog = true" type="primary">
          <el-icon><Setting /></el-icon>
          配置
        </el-button>

        <el-tag v-if="isConfigured" type="success" size="small">
          ✅ 已配置
        </el-tag>
        <el-tag v-else type="warning" size="small">
          ⚠️ 未配置
        </el-tag>
      </div>

      <div v-if="isConfigured" class="context-info mt-2">
        <el-tag size="small" type="info">📊 学习进度: {{ learningProgress }}%</el-tag>
        <el-tag size="small" type="info" class="ml-2">📄 当前: {{ currentPageName }}</el-tag>
      </div>
    </div>

    <!-- 配置对话框 -->
    <el-dialog v-model="showConfigDialog" title="配置AI服务" width="600px">
      <el-form :model="apiConfig" label-width="100px">
        <el-form-item label="服务商">
          <el-input :value="aiConfig.providers[selectedProvider]?.name" disabled />
        </el-form-item>

        <el-form-item label="API地址" v-if="isCustomProvider">
          <el-input v-model="apiConfig.baseUrl" placeholder="https://api.example.com/v1" />
          <div class="form-tip">请输入完整的API基础URL（包含/v1）</div>
        </el-form-item>

        <el-form-item label="API密钥">
          <el-input
            v-model="apiConfig.apiKey"
            type="password"
            placeholder="sk-..."
            show-password
          />
          <div class="form-tip">
            <a
              v-if="providerDocs[selectedProvider]"
              :href="providerDocs[selectedProvider]"
              target="_blank"
            >
              🔑 如何获取API密钥
            </a>
          </div>
        </el-form-item>

        <el-form-item label="模型" v-if="!isCustomProvider">
          <el-select v-model="apiConfig.model" placeholder="选择模型">
            <el-option
              v-for="model in aiConfig.providers[selectedProvider]?.models"
              :key="model"
              :label="model"
              :value="model"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="模型" v-else>
          <el-input v-model="apiConfig.model" placeholder="gpt-3.5-turbo" />
          <div class="form-tip">请输入模型名称</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showConfigDialog = false">取消</el-button>
        <el-button type="primary" @click="saveConfig">保存</el-button>
        <el-button @click="testConnection" :loading="testing">
          测试连接
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import { ElMessage } from 'element-plus'
import { aiConfig, buildSystemPrompt, callOpenAICompatibleAPI } from '@/data/ai-config.js'
import MarkdownIt from 'markdown-it'

const props = defineProps({
  context: {
    type: Object,
    default: () => ({})
  }
})

const route = useRoute()
const learningStore = useLearningStore()
const md = new MarkdownIt()

// 数据
const question = ref('')
const loading = ref(false)
const messages = ref([])
const historyRef = ref(null)
const testing = ref(false)

// API配置
const selectedProvider = ref(localStorage.getItem('ai-provider') || 'deepseek')
const showConfigDialog = ref(false)
const apiConfig = ref({
  apiKey: localStorage.getItem('ai-api-key') || '',
  baseUrl: localStorage.getItem('ai-base-url') || '',
  model: localStorage.getItem('ai-model') || ''
})

// 服务商文档链接
const providerDocs = {
  openai: 'https://platform.openai.com/api-keys',
  deepseek: 'https://platform.deepseek.com/api_keys',
  moonshot: 'https://platform.moonshot.cn/console/api-keys',
  baichuan: 'https://platform.baichuan-ai.com/console/apikey'
}

// 计算属性
const isCustomProvider = computed(() => selectedProvider.value === 'custom')

const isConfigured = computed(() => {
  return apiConfig.value.apiKey &&
         (isCustomProvider.value ? apiConfig.value.baseUrl : true)
})

const learningProgress = computed(() => learningStore.progressPercent)

const currentPageName = computed(() => {
  const pageNames = {
    '/': '学习进度',
    '/knowledge': '知识库',
    '/hardware': '硬件清单',
    '/docs': '官方文档',
    '/structure': '项目结构'
  }
  return pageNames[route.path] || '未知页面'
})

// 初始化配置
onMounted(() => {
  loadConfig()
  loadHistory()
})

// 加载保存的配置
const loadConfig = () => {
  const provider = localStorage.getItem('ai-provider')
  if (provider) {
    selectedProvider.value = provider
    apiConfig.value.apiKey = localStorage.getItem('ai-api-key') || ''
    apiConfig.value.baseUrl = localStorage.getItem('ai-base-url') || ''
    apiConfig.value.model = localStorage.getItem('ai-model') || ''
  }
}

// 服务商变化时更新默认值
const onProviderChange = () => {
  const provider = aiConfig.providers[selectedProvider.value]
  if (provider && !provider.customUrl) {
    apiConfig.value.baseUrl = provider.baseUrl
    apiConfig.value.model = aiConfig.defaultModels[provider.baseUrl] || provider.models[0]
  }
}

// 保存配置
const saveConfig = () => {
  if (!apiConfig.value.apiKey) {
    ElMessage.warning('请输入API密钥')
    return
  }

  if (isCustomProvider.value && !apiConfig.value.baseUrl) {
    ElMessage.warning('请输入API地址')
    return
  }

  localStorage.setItem('ai-provider', selectedProvider.value)
  localStorage.setItem('ai-api-key', apiConfig.value.apiKey)
  localStorage.setItem('ai-base-url', apiConfig.value.baseUrl)
  localStorage.setItem('ai-model', apiConfig.value.model)

  ElMessage.success('配置已保存')
  showConfigDialog.value = false
}

// 测试连接
const testConnection = async () => {
  if (!apiConfig.value.apiKey) {
    ElMessage.warning('请先输入API密钥')
    return
  }

  testing.value = true
  try {
    await callOpenAICompatibleAPI(
      {
        apiKey: apiConfig.value.apiKey,
        baseUrl: apiConfig.value.baseUrl || aiConfig.providers[selectedProvider.value].baseUrl,
        model: apiConfig.value.model
      },
      '你好，这是一个测试连接。',
      '你是一个测试助手。'
    )
    ElMessage.success('✅ 连接成功！')
  } catch (error) {
    ElMessage.error(`❌ 连接失败：${error.message}`)
  } finally {
    testing.value = false
  }
}

// 加载历史记录
const loadHistory = () => {
  const saved = localStorage.getItem('ai-chat-history')
  if (saved) {
    messages.value = JSON.parse(saved)
  }
}

// 保存历史记录
const saveHistory = () => {
  localStorage.setItem('ai-chat-history', JSON.stringify(messages.value))
}

// 渲染Markdown
const renderMarkdown = (text) => {
  return md.render(text)
}

// 获取当前学习阶段
const getCurrentStage = () => {
  const currentStageObj = learningStore.stages.find(s => s.current)
  return currentStageObj ? `${currentStageObj.id}: ${currentStageObj.title}` : null
}

// 发送问题
const ask = async () => {
  const q = question.value.trim()
  if (!q) return

  if (!isConfigured.value) {
    ElMessage.warning('请先配置AI服务')
    showConfigDialog.value = true
    return
  }

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: q,
    timestamp: new Date().toLocaleTimeString()
  })

  question.value = ''
  saveHistory()
  scrollToBottom()

  loading.value = true

  try {
    // 构建包含上下文的系统提示
    const systemPrompt = buildSystemPrompt({
      progress: learningProgress.value,
      currentPage: currentPageName.value,
      currentStage: getCurrentStage()
    })

    const answer = await callOpenAICompatibleAPI(
      {
        apiKey: apiConfig.value.apiKey,
        baseUrl: apiConfig.value.baseUrl || aiConfig.providers[selectedProvider.value].baseUrl,
        model: apiConfig.value.model
      },
      q,
      systemPrompt
    )

    messages.value.push({
      role: 'assistant',
      content: answer,
      timestamp: new Date().toLocaleTimeString()
    })

    saveHistory()
  } catch (error) {
    ElMessage.error(`请求失败：${error.message}`)
    messages.value.push({
      role: 'assistant',
      content: `❌ **错误：** ${error.message}`,
      timestamp: new Date().toLocaleTimeString()
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

// 滚动到底部
const scrollToBottom = () => {
  setTimeout(() => {
    if (historyRef.value) {
      historyRef.value.scrollTop = historyRef.value.scrollHeight
    }
  }, 100)
}

// 清空对话
const clearHistory = () => {
  messages.value = []
  saveHistory()
  ElMessage.success('对话已清空')
}

// 快捷键支持
const onKeydown = (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    ask()
  }
}
</script>

<style scoped>
.ai-assistant {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.message {
  display: flex;
  margin-bottom: 20px;
  gap: 12px;
}

.message.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.message.assistant .avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message.user .avatar {
  background: #409eff;
  color: white;
}

.content {
  max-width: 70%;
}

.message.user .content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.text {
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.6;
  word-break: break-word;
}

.message.assistant .text {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message.user .text {
  background: #409eff;
  color: white;
}

.meta {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.input-area {
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.input-actions {
  display: flex;
  justify-content: space-between;
}

.api-config {
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.config-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.provider-desc {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.context-info {
  display: flex;
  align-items: center;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.form-tip a {
  color: #409eff;
  text-decoration: none;
}

.form-tip a:hover {
  text-decoration: underline;
}

:deep(.text pre) {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
}

:deep(.text code) {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}
</style>
