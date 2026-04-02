<template>
  <div class="ws-control-page">
    <!-- 页面标题 -->
    <div class="page-header card mb-3">
      <div class="header-content">
        <h2>🔌 WebSocket 控制面板</h2>
        <p>通过 WiFi 连接 ESP32，实时控制 Aero Hand</p>
      </div>
      <div class="header-actions">
        <el-tag :type="connected ? 'success' : 'danger'" effect="dark">
          {{ connected ? '已连接' : '未连接' }}
        </el-tag>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 连接控制面板 -->
      <el-col :span="8">
        <el-card shadow="hover" class="connection-card">
          <template #header>
            <span>
              <el-icon><Connection /></el-icon>
              连接设置
            </span>
          </template>

          <el-form label-position="top">
            <el-form-item label="ESP32 IP 地址">
              <el-input v-model="host" placeholder="192.168.4.1">
                <template #prefix>
                  <el-icon><Monitor /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="端口">
              <el-input-number v-model="port" :min="1" :max="65535" style="width: 100%" />
            </el-form-item>

            <el-form-item>
              <el-button
                :type="connected ? 'danger' : 'primary'"
                :icon="connected ? 'Close' : 'Connection'"
                style="width: 100%"
                @click="toggleConnection"
                :loading="connecting"
              >
                {{ connected ? '断开连接' : '连接' }}
              </el-button>
            </el-form-item>
          </el-form>

          <el-divider />

          <div class="connection-info">
            <p><strong>状态:</strong> <span :class="connected ? 'text-success' : 'text-danger'">{{ connected ? '已连接' : '未连接' }}</span></p>
            <p v-if="connected"><strong>服务器:</strong> {{ serverInfo }}</p>
            <p><strong>协议:</strong> SDK 风格 7DoF → 15关节</p>
          </div>
        </el-card>

        <!-- 快捷操作 -->
        <el-card shadow="hover" class="mt-3">
          <template #header>
            <span>
              <el-icon><MagicStick /></el-icon>
              快捷操作
            </span>
          </template>

          <div class="action-buttons">
            <el-button type="success" @click="sendHoming" :disabled="!connected">
              <el-icon><RefreshRight /></el-icon>
              归零 (Homing)
            </el-button>
            <el-button type="primary" @click="sendAllZeros" :disabled="!connected">
              <el-icon><Minus /></el-icon>
              全部归零
            </el-button>
            <el-button type="info" @click="requestStates" :disabled="!connected">
              <el-icon><Refresh /></el-icon>
              获取状态
            </el-button>
            <el-button type="warning" @click="clearLog">
              <el-icon><Delete /></el-icon>
              清空日志
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 关节控制面板 -->
      <el-col :span="16">
        <el-card shadow="hover" class="control-card">
          <template #header>
            <span>
              <el-icon><Operation /></el-icon>
              关节控制 (7DoF → 15关节)
            </span>
          </template>

          <div class="control-hint">
            <el-alert type="info" :closable="false" show-icon>
              <template #title>
                SDK 风格控制语义：拇指 3 维 + 四指各 1 维，页面内部自动展开为固件 15 个关节协议
              </template>
            </el-alert>
          </div>

          <div class="slider-grid">
            <div v-for="control in compactControls" :key="control.id" class="slider-card">
              <div class="slider-header">
                <span class="slider-name">{{ control.label }}</span>
                <el-tag size="small" type="info">{{ control.key }}</el-tag>
              </div>

              <div class="slider-meta">
                <span>范围: {{ control.min }} ~ {{ control.max }}{{ control.unit }}</span>
                <span class="angle-value">{{ controlValues[control.id] }}{{ control.unit }}</span>
              </div>

              <div class="slider-row">
                <el-slider
                  v-model="controlValues[control.id]"
                  :min="control.min"
                  :max="control.max"
                  :step="1"
                  :disabled="!connected"
                  @input="scheduleSendAllCurrent"
                />
              </div>
            </div>
          </div>

          <!-- 协议预览 -->
          <el-divider content-position="left">
            <el-icon><Document /></el-icon>
            展开的 15 关节协议预览
          </el-divider>

          <div class="protocol-preview">
            <el-input
              type="textarea"
              v-model="protocolPreview"
              :rows="6"
              readonly
              class="protocol-textarea"
            />
            <div class="protocol-actions">
              <el-button size="small" @click="copyProtocol">
                <el-icon><DocumentCopy /></el-icon>
                复制协议
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 日志面板 -->
        <el-card shadow="hover" class="mt-3">
          <template #header>
            <div class="log-header">
              <span>
                <el-icon><List /></el-icon>
                通信日志
              </span>
              <el-badge :value="logCount" :hidden="logCount === 0" type="primary" />
            </div>
          </template>

          <div class="log-panel" ref="logPanelRef">
            <div
              v-for="(log, index) in logs"
              :key="index"
              :class="['log-entry', `log-${log.type}`]"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
            <div v-if="logs.length === 0" class="log-empty">
              等待连接...
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Connection, Monitor, MagicStick, RefreshRight, Minus, Delete,
  Refresh, Operation, Document, DocumentCopy, List, Close
} from '@element-plus/icons-vue'

// 连接状态
const host = ref('192.168.4.1')
const port = ref(8765)
const connected = ref(false)
const connecting = ref(false)
const serverInfo = ref('-')

// WebSocket 实例
let ws = null
let pendingSendTimer = null

// 紧凑控制定义 (7DoF)
const compactControls = [
  { id: 'thumb_cmc_abd', label: '拇指外展', key: 'thumb_abduction', min: 0, max: 100, defaultValue: 0, unit: '°' },
  { id: 'thumb_cmc_flex', label: '拇指屈曲', key: 'thumb_flex', min: 0, max: 55, defaultValue: 0, unit: '°' },
  { id: 'thumb_mcp_ip', label: '拇指肌腱', key: 'thumb_tendon', min: 0, max: 90, defaultValue: 0, unit: '°' },
  { id: 'index_flexion', label: '食指', key: 'index_finger', min: 0, max: 90, defaultValue: 0, unit: '°' },
  { id: 'middle_flexion', label: '中指', key: 'middle_finger', min: 0, max: 90, defaultValue: 0, unit: '°' },
  { id: 'ring_flexion', label: '无名指', key: 'ring_finger', min: 0, max: 90, defaultValue: 0, unit: '°' },
  { id: 'pinky_flexion', label: '小指', key: 'pinky_finger', min: 0, max: 90, defaultValue: 0, unit: '°' },
]

// 控制值
const controlValues = reactive({})
compactControls.forEach(c => {
  controlValues[c.id] = c.defaultValue
})

// 日志
const logs = ref([])
const logPanelRef = ref(null)
const logCount = computed(() => logs.value.length)

// 协议预览
const protocolPreview = computed(() => {
  const expanded = expandCompactStateToProtocolJoints(controlValues)
  return JSON.stringify(expanded, null, 2)
})

// 辅助函数
function mapRange(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin
  const normalized = (value - inMin) / (inMax - inMin)
  return outMin + normalized * (outMax - outMin)
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

// 展开 7DoF 到 15 关节协议
function expandCompactStateToProtocolJoints(state) {
  const thumbRotation = mapRange(state.thumb_cmc_abd, 0, 100, -30, 30)

  const fingerTriple = (prefix, value) => [
    { joint_id: `${prefix}_proximal`, angle: value },
    { joint_id: `${prefix}_middle`, angle: value },
    { joint_id: `${prefix}_distal`, angle: value },
  ]

  return [
    { joint_id: 'thumb_proximal', angle: state.thumb_cmc_flex },
    { joint_id: 'thumb_distal', angle: state.thumb_mcp_ip },
    ...fingerTriple('index', state.index_flexion),
    ...fingerTriple('middle', state.middle_flexion),
    ...fingerTriple('ring', state.ring_flexion),
    ...fingerTriple('pinky', state.pinky_flexion),
    { joint_id: 'thumb_rotation', angle: parseFloat(thumbRotation.toFixed(1)) },
  ]
}

// 构建协议载荷
function buildPayload() {
  return {
    type: 'multi_joint_control',
    timestamp: Date.now(),
    data: {
      joints: expandCompactStateToProtocolJoints(controlValues),
      duration_ms: 500,
    },
  }
}

// WebSocket 连接
function toggleConnection() {
  if (connected.value || connecting.value) {
    disconnect()
  } else {
    connect()
  }
}

function connect() {
  if (connecting.value || connected.value) return

  const url = `ws://${host.value}:${port.value}`
  addLog(`连接中: ${url}...`, 'info')

  connecting.value = true

  try {
    ws = new WebSocket(url)
  } catch (error) {
    addLog(`无效的 WebSocket URL: ${error.message}`, 'error')
    connecting.value = false
    return
  }

  ws.onopen = () => {
    connecting.value = false
    connected.value = true
    serverInfo.value = `${host.value}:${port.value}`
    addLog('连接成功!', 'success')
    requestStates()
  }

  ws.onclose = () => {
    ws = null
    connecting.value = false
    connected.value = false
    serverInfo.value = '-'
    addLog('连接已断开', 'warning')
  }

  ws.onerror = () => {
    addLog('WebSocket 错误', 'error')
  }

  ws.onmessage = (event) => {
    addLog(`接收: ${event.data}`, 'recv')
    handleServerMessage(event.data)
  }
}

function disconnect() {
  if (pendingSendTimer) {
    clearTimeout(pendingSendTimer)
    pendingSendTimer = null
  }

  if (ws) {
    ws.close()
  }
}

function handleServerMessage(rawMessage) {
  try {
    const message = JSON.parse(rawMessage)
    if (message.type === 'states_response' && Array.isArray(message.data)) {
      setCompactStateFromJoints(message.data)
    }
  } catch (e) {
    // 忽略解析错误
  }
}

// 从关节状态设置紧凑控制值
function setCompactStateFromJoints(joints) {
  const jointMap = {}
  joints.forEach(joint => {
    jointMap[joint.joint_id] = Number(joint.angle ?? 0)
  })

  const newState = {
    thumb_cmc_abd: clamp(mapRange(jointMap.thumb_rotation ?? 0, -30, 30, 0, 100), 0, 100),
    thumb_cmc_flex: clamp(jointMap.thumb_proximal ?? 0, 0, 55),
    thumb_mcp_ip: clamp(jointMap.thumb_distal ?? 0, 0, 90),
    index_flexion: clamp(jointMap.index_proximal ?? 0, 0, 90),
    middle_flexion: clamp(jointMap.middle_proximal ?? 0, 0, 90),
    ring_flexion: clamp(jointMap.ring_proximal ?? 0, 0, 90),
    pinky_flexion: clamp(jointMap.pinky_proximal ?? 0, 0, 90),
  }

  Object.keys(newState).forEach(key => {
    controlValues[key] = newState[key]
  })
}

// 发送命令
function sendCommand(command) {
  if (!connected.value || !ws || ws.readyState !== WebSocket.OPEN) {
    ElMessage.warning('未连接!')
    return false
  }

  const json = JSON.stringify(command)
  try {
    ws.send(json)
    addLog(`发送: ${json}`, 'send')
    return true
  } catch (error) {
    addLog(`发送失败: ${error.message}`, 'error')
    return false
  }
}

function sendCompactState() {
  const payload = buildPayload()
  return sendCommand(payload)
}

function sendAllCurrent() {
  sendCompactState()
}

function scheduleSendAllCurrent() {
  if (pendingSendTimer) {
    clearTimeout(pendingSendTimer)
  }
  pendingSendTimer = setTimeout(() => {
    pendingSendTimer = null
    sendAllCurrent()
  }, 60)
}

function sendHoming() {
  sendCommand({
    type: 'homing',
    timestamp: Date.now(),
  })
}

function sendAllZeros() {
  compactControls.forEach(c => {
    controlValues[c.id] = c.defaultValue
  })
  sendCompactState()
}

function requestStates() {
  sendCommand({
    type: 'get_states',
    timestamp: Date.now(),
  })
}

function clearLog() {
  logs.value = []
}

// 添加日志
function addLog(message, type = 'info') {
  const time = new Date().toLocaleTimeString()
  logs.value.push({ time, message, type })

  // 限制日志数量
  if (logs.value.length > 100) {
    logs.value = logs.value.slice(-100)
  }

  // 自动滚动
  nextTick(() => {
    if (logPanelRef.value) {
      logPanelRef.value.scrollTop = logPanelRef.value.scrollHeight
    }
  })
}

// 复制协议
function copyProtocol() {
  navigator.clipboard.writeText(protocolPreview.value).then(() => {
    ElMessage.success('协议已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 组件卸载时断开连接
onUnmounted(() => {
  disconnect()
})
</script>

<style scoped>
.ws-control-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0 0 8px 0;
}

.header-content p {
  margin: 0;
  color: #909399;
}

.connection-info {
  font-size: 14px;
  color: #606266;
}

.connection-info p {
  margin: 8px 0;
}

.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.control-hint {
  margin-bottom: 20px;
}

.slider-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.slider-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 14px;
  transition: all 0.3s;
}

.slider-card:hover {
  background: #ecf5ff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.slider-name {
  font-weight: 600;
  color: #303133;
}

.slider-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.angle-value {
  font-weight: 600;
  color: #409eff;
}

.protocol-preview {
  background: #1d1d1d;
  border-radius: 8px;
  padding: 16px;
}

.protocol-textarea :deep(.el-textarea__inner) {
  background: transparent;
  color: #e0e0e0;
  font-family: 'Consolas', monospace;
  font-size: 12px;
}

.protocol-actions {
  margin-top: 10px;
  text-align: right;
}

.log-panel {
  max-height: 250px;
  overflow-y: auto;
  background: #1a1a1a;
  border-radius: 8px;
  padding: 12px;
  font-family: 'Consolas', monospace;
  font-size: 12px;
}

.log-entry {
  margin-bottom: 4px;
  display: flex;
  gap: 8px;
}

.log-time {
  color: #666;
  flex-shrink: 0;
}

.log-message {
  word-break: break-word;
}

.log-info .log-message { color: #e0e0e0; }
.log-success .log-message { color: #67c23a; }
.log-warning .log-message { color: #e6a23c; }
.log-error .log-message { color: #f56c6c; }
.log-send .log-message { color: #409eff; }
.log-recv .log-message { color: #67c23a; }

.log-empty {
  color: #666;
  text-align: center;
  padding: 20px;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mt-3 {
  margin-top: 24px;
}

/* 暗黑模式适配 */
html.dark-mode .slider-card {
  background: #2d2d2d;
}

html.dark-mode .slider-card:hover {
  background: #3d3d3d;
}

html.dark-mode .slider-name {
  color: #e0e0e0;
}

html.dark-mode .protocol-preview {
  background: #0d0d0d;
}
</style>
