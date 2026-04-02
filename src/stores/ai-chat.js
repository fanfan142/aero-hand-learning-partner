/**
 * AI对话Store - 管理对话历史和上下文
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAIChatStore = defineStore('ai-chat', () => {
  // 对话历史
  const messages = ref([])
  const conversationId = ref(Date.now().toString())

  // 上下文管理
  const contextWindow = ref(10) // 保留最近N轮对话
  const systemPrompt = ref('')

  // 快捷问题建议
  const quickSuggestions = ref([
    {
      id: 'code-explain',
      text: '解释这段代码的工作原理',
      icon: 'Code'
    },
    {
      id: 'debug-help',
      text: '帮我排查舵机通信问题',
      icon: 'WarnTriangle'
    },
    {
      id: 'progress-query',
      text: '我当前的学习进度如何？',
      icon: 'DataAnalysis'
    },
    {
      id: 'next-step',
      text: '我下一步应该做什么？',
      icon: 'Guide'
    },
    {
      id: 'concept-explain',
      text: '什么是肌腱驱动？',
      icon: 'InfoFilled'
    },
    {
      id: 'sim2real',
      text: 'Sim2Real是什么？',
      icon: 'Connection'
    }
  ])

  // 消息状态枚举
  const MessageStatus = {
    SENDING: 'sending',
    SENT: 'sent',
    FAILED: 'failed'
  }

  // 计算消息数量
  const messageCount = computed(() => messages.value.length)

  // 获取裁剪后的上下文（用于API调用）
  const trimmedMessages = computed(() => {
    const userAssistantMsgs = messages.value.filter(m => m.role !== 'system')
    if (userAssistantMsgs.length <= contextWindow.value) {
      return messages.value
    }
    // 保留系统消息 + 最近N轮
    const systemMsgs = messages.value.filter(m => m.role === 'system')
    const recentMsgs = userAssistantMsgs.slice(-contextWindow.value)
    return [...systemMsgs, ...recentMsgs]
  })

  // 添加用户消息
  function addUserMessage(content) {
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      status: MessageStatus.SENDING
    }
    messages.value.push(msg)
    saveToLocalStorage()
    return msg.id
  }

  // 添加AI消息
  function addAssistantMessage(content, parentId = null) {
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      status: MessageStatus.SENT,
      parentId
    }
    messages.value.push(msg)
    saveToLocalStorage()
    return msg.id
  }

  // 更新消息状态
  function updateMessageStatus(msgId, status) {
    const msg = messages.value.find(m => m.id === msgId)
    if (msg) {
      msg.status = status
    }
  }

  // 更新消息内容（用于打字机效果）
  function updateMessageContent(msgId, content) {
    const msg = messages.value.find(m => m.id === msgId)
    if (msg) {
      msg.content = content
    }
  }

  // 更新消息状态为失败
  function markMessageFailed(msgId, errorContent) {
    const msg = messages.value.find(m => m.id === msgId)
    if (msg) {
      msg.status = MessageStatus.FAILED
      msg.errorContent = errorContent
    }
    saveToLocalStorage()
  }

  // 重新发送失败的消息
  function retryMessage(msgId) {
    const msg = messages.value.find(m => m.id === msgId)
    if (msg && msg.status === MessageStatus.FAILED) {
      msg.status = MessageStatus.SENDING
      msg.errorContent = null
      return msg.content
    }
    return null
  }

  // 清空对话
  function clearMessages() {
    messages.value = []
    conversationId.value = Date.now().toString()
    saveToLocalStorage()
  }

  // 删除某条消息及其后续
  function deleteMessage(msgId) {
    const index = messages.value.findIndex(m => m.id === msgId)
    if (index !== -1) {
      messages.value = messages.value.slice(0, index)
      saveToLocalStorage()
    }
  }

  // 设置系统提示
  function setSystemPrompt(prompt) {
    systemPrompt.value = prompt
    // 更新或添加系统消息
    const existingSysIndex = messages.value.findIndex(m => m.role === 'system')
    if (existingSysIndex !== -1) {
      messages.value[existingSysIndex].content = prompt
    } else {
      messages.value.unshift({
        id: `sys-${Date.now()}`,
        role: 'system',
        content: prompt,
        timestamp: new Date().toISOString()
      })
    }
    saveToLocalStorage()
  }

  // 保存到localStorage
  function saveToLocalStorage() {
    const data = {
      messages: messages.value,
      conversationId: conversationId.value,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('ai-chat-history', JSON.stringify(data))
  }

  // 从localStorage加载
  function loadFromLocalStorage() {
    const saved = localStorage.getItem('ai-chat-history')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        messages.value = data.messages || []
        conversationId.value = data.conversationId || Date.now().toString()
      } catch (e) {
        console.error('Failed to load chat history:', e)
      }
    }
  }

  // 获取对话摘要（用于显示）
  function getConversationSummary() {
    if (messages.value.length === 0) return '新对话'
    const firstUserMsg = messages.value.find(m => m.role === 'user')
    if (firstUserMsg) {
      return firstUserMsg.content.substring(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')
    }
    return '新对话'
  }

  // 格式化时间戳
  function formatTimestamp(isoString) {
    const date = new Date(isoString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) +
      ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 初始化加载
  loadFromLocalStorage()

  return {
    // 状态
    messages,
    conversationId,
    contextWindow,
    systemPrompt,
    quickSuggestions,
    MessageStatus,

    // 计算属性
    messageCount,
    trimmedMessages,

    // 方法
    addUserMessage,
    addAssistantMessage,
    updateMessageStatus,
    updateMessageContent,
    markMessageFailed,
    retryMessage,
    clearMessages,
    deleteMessage,
    setSystemPrompt,
    saveToLocalStorage,
    loadFromLocalStorage,
    getConversationSummary,
    formatTimestamp
  }
})
