<template>
  <div class="ai-assistant">
    <!-- 聊天历史 -->
    <div class="chat-history" ref="historyRef">
      <!-- 空状态 -->
      <div v-if="chatStore.messageCount === 0" class="empty-state">
        <div class="empty-icon">
          <el-icon :size="64"><ChatDotRound /></el-icon>
        </div>
        <h3>开始与AI助手对话</h3>
        <p>我可以帮助您理解Aero Hand项目、解答技术问题、排查故障等</p>

        <!-- 快捷问题 -->
        <div class="quick-suggestions">
          <div class="suggestions-title">快捷问题</div>
          <div class="suggestions-grid">
            <button
              v-for="suggestion in chatStore.quickSuggestions"
              :key="suggestion.id"
              class="suggestion-chip"
              @click="askSuggestion(suggestion.text)"
            >
              <el-icon>
                <component :is="getIcon(suggestion.icon)" />
              </el-icon>
              {{ suggestion.text }}
            </button>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <template v-else>
        <div
          v-for="msg in chatStore.messages"
          :key="msg.id"
          :class="['message', msg.role, msg.status]"
        >
          <!-- 头像 -->
          <div class="avatar">
            <el-icon v-if="msg.role === 'assistant'"><ChatDotRound /></el-icon>
            <el-icon v-else><User /></el-icon>
          </div>

          <!-- 消息内容 -->
          <div class="message-content">
            <div class="bubble" :class="{ 'failed': msg.status === chatStore.MessageStatus.FAILED }">
              <!-- 加载中 -->
              <template v-if="msg.status === chatStore.MessageStatus.SENDING && msg.role === 'user'">
                <div class="sending-indicator">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>
              </template>

              <!-- 打字机效果的消息 -->
              <template v-else-if="msg.role === 'assistant' && streamingId === msg.id">
                <div class="text" v-html="renderMarkdownWithCopy(partialContent || msg.content)"></div>
              </template>

              <!-- 正常消息 -->
              <template v-else>
                <div class="text" v-html="renderMarkdownWithCopy(msg.content)"></div>
              </template>

              <!-- 发送失败 -->
              <div v-if="msg.status === chatStore.MessageStatus.FAILED" class="error-banner">
                <el-icon><WarnTriangleFilled /></el-icon>
                <span>发送失败</span>
                <el-button size="small" @click="retryMessage(msg.id)" link>重试</el-button>
              </div>
            </div>

            <!-- 元信息 -->
            <div class="meta">
              <span class="time">{{ chatStore.formatTimestamp(msg.timestamp) }}</span>
              <span v-if="msg.status === chatStore.MessageStatus.SENT" class="status sent">
                <el-icon><CircleCheck /></el-icon>
              </span>
              <span v-if="msg.role === 'user'" class="actions">
                <el-button
                  size="small"
                  link
                  @click="regenerateMessage(msg)"
                  :disabled="loading"
                >
                  <el-icon><RefreshRight /></el-icon>
                </el-button>
              </span>
            </div>

            <!-- 表情反应 -->
            <div class="reactions" v-if="msg.role === 'assistant'">
              <button
                v-for="emoji in reactions"
                :key="emoji"
                :class="['reaction-btn', { active: msg.reaction === emoji }]"
                @click="addReaction(msg.id, emoji)"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
        </div>

        <!-- AI思考中 -->
        <div v-if="loading && !streamingId" class="message assistant thinking">
          <div class="avatar">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="message-content">
            <div class="bubble">
              <div class="thinking-indicator">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
              <span class="thinking-text">正在思考...</span>
            </div>
          </div>
        </div>
      </template>

      <!-- 滚动锚点 -->
      <div ref="bottomAnchor"></div>
    </div>

    <!-- 输入区 -->
    <div class="input-area">
      <div class="input-wrapper">
        <el-input
          v-model="question"
          type="textarea"
          :rows="3"
          resize="none"
          placeholder="输入您的问题... (Ctrl+Enter发送, Shift+Enter换行)"
          @keydown="handleKeydown"
          @input="handleInput"
        />
        <div class="input-actions">
          <div class="left-actions">
            <el-tooltip content="清空对话">
              <el-button
                size="small"
                circle
                @click="confirmClearHistory"
                :disabled="chatStore.messageCount === 0"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
          <div class="right-actions">
            <span class="char-count" :class="{ warning: question.length > 2000 }">
              {{ question.length }}/2000
            </span>
            <el-button
              type="primary"
              @click="ask"
              :loading="loading"
              :disabled="!question.trim() || question.length > 2000"
            >
              <el-icon><Promotion /></el-icon>
              发送
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- API配置区 -->
    <div class="api-config">
      <div class="config-row">
        <el-select
          v-model="selectedProvider"
          placeholder="选择AI服务商"
          size="small"
          @change="onProviderChange"
          style="width: 180px"
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

        <div class="status-tags">
          <el-tag v-if="isConfigured" type="success" size="small" effect="light">
            <el-icon><CircleCheck /></el-icon>
            已配置
          </el-tag>
          <el-tag v-else type="warning" size="small" effect="light">
            <el-icon><Warning /></el-icon>
            未配置
          </el-tag>
        </div>

        <div class="context-info">
          <el-tooltip content="学习进度">
            <el-tag size="small" type="info">
              <el-icon><DataAnalysis /></el-icon>
              {{ learningProgress }}%
            </el-tag>
          </el-tooltip>
          <el-tooltip :content="`当前页面: ${currentPageName}`">
            <el-tag size="small" type="info">
              <el-icon><Document /></el-icon>
              {{ currentPageName }}
            </el-tag>
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- 配置对话框 -->
    <el-dialog
      v-model="showConfigDialog"
      title="配置AI服务"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="apiConfig" label-width="100px" class="config-form">
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
              rel="noopener"
            >
              <el-icon><Link /></el-icon>
              如何获取API密钥
            </a>
          </div>
        </el-form-item>

        <el-form-item label="模型" v-if="!isCustomProvider">
          <el-select v-model="apiConfig.model" placeholder="选择模型" style="width: 100%">
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

        <el-form-item label="上下文窗口">
          <el-slider
            v-model="chatStore.contextWindow"
            :min="4"
            :max="20"
            :step="2"
            show-stops
          />
          <div class="form-tip">保留最近N轮对话作为上下文（影响AI回复质量）</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showConfigDialog = false">取消</el-button>
        <el-button @click="testConnection" :loading="testing" :disabled="!apiConfig.apiKey">
          测试连接
        </el-button>
        <el-button type="primary" @click="saveConfig">
          保存配置
        </el-button>
      </template>
    </el-dialog>

    <!-- 复制成功提示 -->
    <el-message v-model:visible="showCopySuccess" type="success" duration="2000">
      代码已复制到剪贴板
    </el-message>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import { useAIChatStore } from '@/stores/ai-chat'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  aiConfig,
  buildSystemPrompt,
  callOpenAICompatibleAPI
} from '@/data/ai-config.js'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'
// 导入常用语言高亮
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import cpp from 'highlight.js/lib/languages/cpp'
import bash from 'highlight.js/lib/languages/bash'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'

// 注册语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('c', cpp)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('json', json)

const props = defineProps({
  context: {
    type: Object,
    default: () => ({})
  }
})

const route = useRoute()
const learningStore = useLearningStore()
const chatStore = useAIChatStore()

// 初始化Markdown解析器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs-code"><div class="code-header"><span class="code-lang">${lang}</span><button class="copy-btn" onclick="copyCode(this)"><el-icon><DocumentCopy /></el-icon>复制</button></div><code class="hljs language-${lang}">${
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        }</code></pre>`
      } catch (__) {}
    }
    return `<pre class="hljs-code"><div class="code-header"><span class="code-lang">code</span><button class="copy-btn" onclick="copyCode(this)"><el-icon><DocumentCopy /></el-icon>复制</button></div><code>${
      md.utils.escapeHtml(str)
    }</code></pre>`
  }
})

// 表情反应选项
const reactions = ['👍', '❤️', '🎉', '🤔', '💡']

// 数据
const question = ref('')
const loading = ref(false)
const streamingId = ref(null)
const partialContent = ref('')
const historyRef = ref(null)
const bottomAnchor = ref(null)
const testing = ref(false)
const showConfigDialog = ref(false)
const showCopySuccess = ref(false)

// API配置
const selectedProvider = ref(localStorage.getItem('ai-provider') || 'deepseek')
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
  setupCopyHandler()
})

// 设置代码复制处理器
function setupCopyHandler() {
  window.copyCode = async (btn) => {
    const codeBlock = btn.closest('.hljs-code').querySelector('code')
    const text = codeBlock.textContent
    try {
      await navigator.clipboard.writeText(text)
      ElMessage.success('代码已复制到剪贴板')
    } catch (e) {
      ElMessage.error('复制失败')
    }
  }
}

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
    ElMessage.success('连接成功')
  } catch (error) {
    ElMessage.error(`连接失败：${error.message}`)
  } finally {
    testing.value = false
  }
}

// 渲染Markdown（带代码复制功能）
const renderMarkdownWithCopy = (text) => {
  return md.render(text)
}

// 获取图标
const getIcon = (iconName) => {
  const iconMap = {
    'Code': 'Code',
    'WarnTriangle': 'WarnTriangle',
    'DataAnalysis': 'DataAnalysis',
    'Guide': 'Guide',
    'InfoFilled': 'InfoFilled',
    'Connection': 'Connection'
  }
  return iconMap[iconName] || 'ChatDotRound'
}

// 处理键盘事件
const handleKeydown = (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault()
    ask()
  }
}

// 处理输入
const handleInput = () => {
  // 实时字符计数已在模板中处理
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
  const userMsgId = chatStore.addUserMessage(q)
  question.value = ''
  scrollToBottom()

  loading.value = true
  chatStore.updateMessageStatus(userMsgId, chatStore.MessageStatus.SENT)

  try {
    // 构建包含上下文的系统提示
    const systemPrompt = buildSystemPrompt({
      progress: learningProgress.value,
      currentPage: currentPageName.value,
      currentStage: getCurrentStage()
    })

    // 构建消息历史（用于上下文）
    const messagesForApi = [
      { role: 'system', content: systemPrompt },
      ...chatStore.trimmedMessages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: q }
    ]

    const answer = await callOpenAICompatibleAPI(
      {
        apiKey: apiConfig.value.apiKey,
        baseUrl: apiConfig.value.baseUrl || aiConfig.providers[selectedProvider.value].baseUrl,
        model: apiConfig.value.model
      },
      null, // 问题已在messages中
      systemPrompt,
      messagesForApi // 传递完整上下文
    )

    chatStore.addAssistantMessage(answer, userMsgId)
  } catch (error) {
    ElMessage.error(`请求失败：${error.message}`)
    chatStore.markMessageFailed(userMsgId, error.message)
  } finally {
    loading.value = false
    streamingId.value = null
    partialContent.value = ''
    scrollToBottom()
  }
}

// 重试失败的消息
const retryMessage = (msgId) => {
  const content = chatStore.retryMessage(msgId)
  if (content) {
    question.value = content
    ask()
  }
}

// 重新生成AI回复
const regenerateMessage = async (msg) => {
  // 找到这条用户消息对应的AI回复
  const msgIndex = chatStore.messages.findIndex(m => m.id === msg.id)
  if (msgIndex > 0 && chatStore.messages[msgIndex - 1].role === 'user') {
    const userMsg = chatStore.messages[msgIndex - 1]
    question.value = userMsg.content
    // 删除当前AI消息
    chatStore.messages.splice(msgIndex, 1)
    ask()
  }
}

// 快捷问题
const askSuggestion = (text) => {
  question.value = text
  ask()
}

// 添加表情反应
const addReaction = (msgId, emoji) => {
  const msg = chatStore.messages.find(m => m.id === msgId)
  if (msg) {
    if (msg.reaction === emoji) {
      delete msg.reaction
    } else {
      msg.reaction = emoji
    }
    chatStore.saveToLocalStorage()
  }
}

// 确认清空对话
const confirmClearHistory = () => {
  ElMessageBox.confirm(
    '确定要清空所有对话记录吗？此操作不可恢复。',
    '清空对话',
    {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    chatStore.clearMessages()
    ElMessage.success('对话已清空')
  }).catch(() => {})
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (bottomAnchor.value) {
      bottomAnchor.value.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

// 监听消息变化自动滚动
watch(() => chatStore.messageCount, () => {
  scrollToBottom()
})
</script>

<style scoped>
.ai-assistant {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;
}

/* 聊天历史区域 */
.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  position: relative;
}

.chat-history::-webkit-scrollbar {
  width: 6px;
}

.chat-history::-webkit-scrollbar-track {
  background: transparent;
}

.chat-history::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #606266;
}

.empty-icon {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px;
  color: #909399;
  max-width: 400px;
}

/* 快捷问题建议 */
.quick-suggestions {
  margin-top: 32px;
  width: 100%;
  max-width: 600px;
}

.suggestions-title {
  font-size: 12px;
  color: #909399;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.suggestions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.suggestion-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 20px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-chip:hover {
  background: #667eea;
  border-color: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 消息样式 */
.message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: messageIn 0.3s ease;
}

@keyframes messageIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  flex-direction: row-reverse;
}

.message.assistant {
  flex-direction: row;
}

/* 头像 */
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.message.assistant .avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message.user .avatar {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: white;
}

.message.failed .avatar {
  background: #f56c6c;
  color: white;
}

/* 消息内容 */
.message-content {
  display: flex;
  flex-direction: column;
  max-width: 75%;
  min-width: 200px;
}

.message.user .message-content {
  align-items: flex-end;
}

/* 气泡 */
.bubble {
  padding: 12px 16px;
  border-radius: 16px;
  position: relative;
}

.message.assistant .bubble {
  background: white;
  border-top-left-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.message.user .bubble {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: white;
  border-top-right-radius: 4px;
}

.bubble.failed {
  background: #fef0f0 !important;
  border: 1px solid #fde2e2;
}

/* 文字 */
.text {
  line-height: 1.7;
  word-break: break-word;
  color: #303133;
}

.message.user .text {
  color: white;
}

.text :deep(p) {
  margin: 0 0 8px 0;
}

.text :deep(p:last-child) {
  margin-bottom: 0;
}

.text :deep(ul), .text :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.text :deep(strong) {
  color: #409eff;
}

.message.user .text :deep(strong) {
  color: #ffd04b;
}

/* 元信息 */
.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

.message.user .meta {
  flex-direction: row-reverse;
}

.meta .time {
  opacity: 0.8;
}

.meta .status {
  display: flex;
  align-items: center;
}

.meta .status.sent {
  color: #67c23a;
}

.meta .actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.message.user:hover .meta .actions {
  opacity: 1;
}

/* 错误提示 */
.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef0f0;
  border-radius: 8px;
  font-size: 12px;
  color: #f56c6c;
}

/* 表情反应 */
.reactions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.message.assistant:hover .reactions {
  opacity: 1;
}

.reaction-btn {
  padding: 4px 8px;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.reaction-btn:hover {
  background: #f5f7fa;
  transform: scale(1.1);
}

.reaction-btn.active {
  background: #ecf5ff;
  border-color: #409eff;
}

/* 思考中动画 */
.thinking-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.thinking-indicator .dot {
  width: 8px;
  height: 8px;
  background: #909399;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.thinking-indicator .dot:nth-child(1) {
  animation-delay: -0.32s;
}

.thinking-indicator .dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.thinking-text {
  color: #909399;
  font-size: 13px;
  margin-left: 8px;
}

/* 发送中动画 */
.sending-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.sending-indicator .dot {
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  animation: pulse 1s infinite ease-in-out;
}

.sending-indicator .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.sending-indicator .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 输入区域 */
.input-area {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-actions, .right-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.char-count {
  font-size: 12px;
  color: #909399;
}

.char-count.warning {
  color: #f56c6c;
}

/* API配置区 */
.api-config {
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.config-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.provider-desc {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.status-tags {
  display: flex;
  gap: 8px;
}

.context-info {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

/* 配置表单 */
.config-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.form-tip a {
  color: #409eff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.form-tip a:hover {
  text-decoration: underline;
}

/* 代码高亮样式 */
:deep(.hljs-code) {
  margin: 12px 0;
  border-radius: 8px;
  overflow: hidden;
  background: #1e1e1e;
}

:deep(.code-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
}

:deep(.code-lang) {
  font-size: 12px;
  color: #858585;
  font-family: 'Consolas', monospace;
}

:deep(.copy-btn) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: transparent;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  color: #858585;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

:deep(.copy-btn:hover) {
  background: #3d3d3d;
  color: #fff;
}

:deep(.hljs-code code) {
  display: block;
  padding: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #d4d4d4;
  overflow-x: auto;
}

:deep(.hljs-keyword) {
  color: #569cd6;
}

:deep(.hljs-string) {
  color: #ce9178;
}

:deep(.hljs-number) {
  color: #b5cea8;
}

:deep(.hljs-comment) {
  color: #6a9955;
}

:deep(.hljs-function) {
  color: #dcdcaa;
}

:deep(.hljs-title) {
  color: #dcdcaa;
}

:deep(.hljs-params) {
  color: #9cdcfe;
}

:deep(.hljs-built_in) {
  color: #4ec9b0;
}

:deep(.hljs-attr) {
  color: #9cdcfe;
}

:deep(.hljs-variable) {
  color: #9cdcfe;
}

:deep(.hljs-tag) {
  color: #569cd6;
}

:deep(.hljs-name) {
  color: #569cd6;
}

:deep(.hljs-selector-class) {
  color: #d7ba7d;
}

:deep(.hljs-selector-id) {
  color: #d7ba7d;
}

/* 响应式 */
@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }

  .context-info {
    display: none;
  }

  .suggestions-grid {
    flex-direction: column;
  }

  .suggestion-chip {
    width: 100%;
    justify-content: center;
  }
}
</style>
