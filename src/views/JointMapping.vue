<template>
  <div class="joint-mapping-page">
    <el-page-header @back="$router.back()" title="返回">
      <template #content>
        <span class="page-title">关节映射可视化</span>
      </template>
    </el-page-header>

    <div class="mapping-container">
      <!-- 左栏：手部可视化 -->
      <div class="hand-visualization-panel">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>手部模型</span>
              <el-button text type="primary" @click="resetAllJoints" :icon="Refresh">
                重置
              </el-button>
            </div>
          </template>

          <div class="hand-svg-container">
            <svg viewBox="0 0 400 450" class="hand-svg">
              <!-- 手掌 -->
              <g class="palm">
                <path d="M120 180 Q100 250 110 320 Q120 350 150 360 L250 360 Q280 350 290 320 Q300 250 280 180 Q260 150 200 145 Q140 150 120 180Z"
                      fill="#FFE4C4" stroke="#DEB887" stroke-width="2"/>
              </g>

              <!-- 拇指 (ID: 0,1) -->
              <g class="thumb" :class="{ active: selectedJoints.includes(0) || selectedJoints.includes(1) }">
                <!-- 拇指基部 -->
                <path :d="getThumbBasePath()"
                      fill="#FFB6A3" stroke="#E8A090" stroke-width="2"
                      @click="selectJoint(0)"/>
                <!-- 拇指远端 -->
                <path :d="getThumbDistalPath()"
                      fill="#FFB6A3" stroke="#E8A090" stroke-width="2"
                      @click="selectJoint(1)"/>
                <!-- 拇指角度指示 -->
                <text :x="thumbAngleText.x" :y="thumbAngleText.y" class="angle-text" fill="#C44">
                  {{ getJointAngle(1) }}°
                </text>
              </g>

              <!-- 食指 (ID: 2) -->
              <g class="finger finger-index" :class="{ active: selectedJoints.includes(2) }">
                <path :d="getFingerPath(2)" fill="#87CEEB" stroke="#5CACEE" stroke-width="2"/>
                <text :x="getFingerTextPos(2).x" :y="getFingerTextPos(2).y" class="angle-text">
                  {{ getJointAngle(2) }}°
                </text>
              </g>

              <!-- 中指 (ID: 3) -->
              <g class="finger finger-middle" :class="{ active: selectedJoints.includes(3) }">
                <path :d="getFingerPath(3)" fill="#90EE90" stroke="#6BBF6B" stroke-width="2"/>
                <text :x="getFingerTextPos(3).x" :y="getFingerTextPos(3).y" class="angle-text">
                  {{ getJointAngle(3) }}°
                </text>
              </g>

              <!-- 无名指 (ID: 4) -->
              <g class="finger finger-ring" :class="{ active: selectedJoints.includes(4) }">
                <path :d="getFingerPath(4)" fill="#FFE4B5" stroke="#D4A574" stroke-width="2"/>
                <text :x="getFingerTextPos(4).x" :y="getFingerTextPos(4).y" class="angle-text">
                  {{ getJointAngle(4) }}°
                </text>
              </g>

              <!-- 小指 (ID: 5) -->
              <g class="finger finger-pinky" :class="{ active: selectedJoints.includes(5) }">
                <path :d="getFingerPath(5)" fill="#DDA0DD" stroke="#BA55D3" stroke-width="2"/>
                <text :x="getFingerTextPos(5).x" :y="getFingerTextPos(5).y" class="angle-text">
                  {{ getJointAngle(5) }}°
                </text>
              </g>

              <!-- 手腕 (ID: 6) -->
              <g class="wrist" :class="{ active: selectedJoints.includes(6) }">
                <rect x="130" y="360" width="140" height="40" rx="10"
                      fill="#F39C12" stroke="#D68910" stroke-width="2"/>
                <text x="200" y="385" class="angle-text wrist-text">
                  {{ getJointAngle(6) }}°
                </text>
              </g>

              <!-- 肌腱路径指示 (虚线) -->
              <g class="tendons">
                <path d="M200 170 L200 360" stroke="#CCC" stroke-width="1" stroke-dasharray="4,4" fill="none"/>
                <path d="M150 200 Q120 250 110 290" stroke="#CCC" stroke-width="1" stroke-dasharray="4,4" fill="none"/>
              </g>
            </svg>
          </div>

          <!-- 关节信息弹窗 -->
          <el-popover
            placement="right"
            :width="280"
            trigger="click"
            v-model:visible="jointDetailVisible">
            <template #reference>
              <div class="joint-detail-hint">点击关节查看详情</div>
            </template>
            <div class="joint-detail-panel" v-if="selectedJointDetail">
              <h4 :style="{ color: selectedJointDetail.color }">
                {{ selectedJointDetail.name }}
              </h4>
              <p class="joint-detail-en">{{ selectedJointDetail.nameEn }}</p>
              <el-divider/>
              <div class="detail-row">
                <span>舵机ID:</span>
                <span>{{ selectedJointDetail.servoId }}</span>
              </div>
              <div class="detail-row">
                <span>最大角度:</span>
                <span>{{ selectedJointDetail.maxAngle }}°</span>
              </div>
              <div class="detail-row">
                <span>齿轮比:</span>
                <span>{{ selectedJointDetail.gearRatio }}</span>
              </div>
              <div class="detail-row">
                <span>当前位置:</span>
                <span>{{ getJointAngle(selectedJointDetail.id) }}°</span>
              </div>
              <div class="detail-row">
                <span>位置百分比:</span>
                <span>{{ Math.round((getJointAngle(selectedJointDetail.id) / selectedJointDetail.maxAngle) * 100) }}%</span>
              </div>
              <div class="detail-row">
                <span>脉冲数:</span>
                <span>{{ getJointPulse(selectedJointDetail.id) }}</span>
              </div>
            </div>
          </el-popover>
        </el-card>

        <!-- 舵机状态面板 -->
        <el-card shadow="hover" class="servo-status-card">
          <template #header>
            <span>舵机状态</span>
          </template>
          <div class="servo-grid">
            <div
              v-for="joint in jointDefinitions"
              :key="joint.id"
              class="servo-item"
              :class="{ active: selectedJoints.includes(joint.id) }"
              :style="{ borderColor: joint.color }"
              @click="toggleJointSelection(joint.id)"
            >
              <div class="servo-color" :style="{ background: joint.color }"></div>
              <div class="servo-info">
                <div class="servo-name">{{ joint.name }}</div>
                <div class="servo-angle">{{ getJointAngle(joint.id) }}°</div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 中栏：关节控制 -->
      <div class="control-panel">
        <el-card shadow="hover">
          <template #header>
            <span>关节控制</span>
          </template>

          <div class="joint-controls">
            <div v-for="joint in jointDefinitions" :key="joint.id" class="joint-control-item">
              <div class="joint-control-header">
                <span class="joint-color-dot" :style="{ background: joint.color }"></span>
                <span class="joint-control-name">{{ joint.name }}</span>
                <span class="joint-control-en">({{ joint.nameEn }})</span>
              </div>

              <div class="slider-container">
                <el-slider
                  v-model="jointPositions[joint.id]"
                  :min="0"
                  :max="100"
                  :step="1"
                  :show-tooltip="false"
                  :colors="[joint.color, joint.color]"
                  @change="onJointPositionChange(joint.id, $event)"
                />
                <div class="slider-labels">
                  <span>0°</span>
                  <span class="current-angle">{{ getJointAngle(joint.id) }}°</span>
                  <span>{{ joint.maxAngle }}°</span>
                </div>
              </div>

              <div class="joint-info-row">
                <span class="info-label">脉冲:</span>
                <span class="info-value">{{ getJointPulse(joint.id) }}</span>
                <span class="info-label">舵机:</span>
                <span class="info-value">{{ getServoAngle(joint.id) }}°</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 角度计算器 -->
        <el-card shadow="hover">
          <template #header>
            <span>角度计算器</span>
          </template>

          <div class="calculator">
            <div class="calc-row">
              <el-input-number
                v-model="calcInput.angle"
                :min="0"
                :max="180"
                size="small"
                placeholder="角度"
              />
              <span class="calc-label">角度 (°)</span>
              <el-button @click="calculateFromAngle" type="primary" size="small">计算</el-button>
            </div>
            <div class="calc-result" v-if="calcResult">
              <div class="calc-result-item">
                <span>位置:</span>
                <span>{{ calcResult.position }}%</span>
              </div>
              <div class="calc-result-item">
                <span>脉冲:</span>
                <span>{{ calcResult.pulse }}</span>
              </div>
              <div class="calc-result-item">
                <span>舵机角度:</span>
                <span>{{ calcResult.servoAngle }}°</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 坐标系说明 -->
        <el-card shadow="hover">
          <template #header>
            <span>坐标系说明</span>
          </template>
          <div class="coordinate-info">
            <div class="coord-item">
              <div class="coord-icon" style="background: #FF6B6B;">+</div>
              <div class="coord-text">
                <strong>拇指内收 (0-90°)</strong>
                <p>正值表示内收，负值表示外展</p>
              </div>
            </div>
            <div class="coord-item">
              <div class="coord-icon" style="background: #4ECDC4;">↻</div>
              <div class="coord-text">
                <strong>关节弯曲方向</strong>
                <p>顺时针为正，逆时针为负</p>
              </div>
            </div>
            <div class="coord-item">
              <div class="coord-icon" style="background: #45B7D1;">↑</div>
              <div class="coord-text">
                <strong>手腕旋转</strong>
                <p>向上为屈，向下为伸</p>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右栏：预设姿势与配置 -->
      <div class="preset-panel">
        <el-card shadow="hover">
          <template #header>
            <span>预设姿势</span>
          </template>

          <div class="preset-grid">
            <div
              v-for="(preset, key) in presetActions"
              :key="key"
              class="preset-item"
              :class="{ active: currentPreset === key }"
              @click="applyPreset(key)"
            >
              <div class="preset-icon">{{ preset.icon }}</div>
              <div class="preset-name">{{ preset.name }}</div>
              <div class="preset-name-en">{{ preset.nameEn }}</div>
            </div>
          </div>
        </el-card>

        <!-- 运动范围 -->
        <el-card shadow="hover">
          <template #header>
            <span>运动范围</span>
          </template>

          <div class="range-chart">
            <div v-for="joint in jointDefinitions" :key="joint.id" class="range-item">
              <div class="range-label">
                <span class="range-color" :style="{ background: joint.color }"></span>
                {{ joint.name }}
              </div>
              <div class="range-bar-container">
                <div
                  class="range-bar"
                  :style="{
                    width: getRangeWidth(joint),
                    background: joint.color,
                    marginLeft: '0%'
                  }"
                ></div>
                <div
                  class="range-indicator"
                  :style="{ left: getRangePosition(joint) + '%' }"
                ></div>
              </div>
              <div class="range-value">{{ getJointAngle(joint.id) }}° / {{ joint.maxAngle }}°</div>
            </div>
          </div>
        </el-card>

        <!-- 配置管理 -->
        <el-card shadow="hover">
          <template #header>
            <span>配置管理</span>
          </template>

          <div class="config-actions">
            <el-button type="primary" @click="exportConfig" :icon="Download" class="config-btn">
              导出配置
            </el-button>
            <el-button @click="importConfig" :icon="Upload" class="config-btn">
              导入配置
            </el-button>
            <el-button @click="resetConfig" :icon="Refresh" class="config-btn">
              重置默认
            </el-button>
          </div>

          <el-divider/>

          <div class="quick-info">
            <div class="info-title">当前状态</div>
            <div class="info-row">
              <span>选中关节:</span>
              <el-tag size="small">{{ selectedJoints.length }} 个</el-tag>
            </div>
            <div class="info-row">
              <span>平均位置:</span>
              <el-tag size="small" type="success">{{ averagePosition }}%</el-tag>
            </div>
            <div class="info-row" v-if="outOfRangeJoints.length">
              <span>超限关节:</span>
              <el-tag size="small" type="danger">{{ outOfRangeJoints.length }} 个</el-tag>
            </div>
          </div>
        </el-card>

        <!-- 肌腱传动路径 -->
        <el-card shadow="hover">
          <template #header>
            <span>肌腱传动</span>
          </template>

          <div class="tendon-diagram">
            <svg viewBox="0 0 200 180" class="tendon-svg">
              <!-- 舵机到关节的肌腱路径 -->
              <g class="tendon-lines">
                <!-- 拇指肌腱 -->
                <path d="M30 160 Q50 100 80 80" stroke="#FF6B6B" stroke-width="2" fill="none"/>
                <circle cx="80" cy="80" r="8" fill="#FF6B6B"/>
                <text x="85" y="75" class="tendon-label" fill="#FF6B6B">T</text>

                <!-- 食指肌腱 -->
                <path d="M60 160 L60 60" stroke="#45B7D1" stroke-width="2" fill="none"/>
                <circle cx="60" cy="60" r="8" fill="#45B7D1"/>
                <text x="65" y="55" class="tendon-label" fill="#45B7D1">I</text>

                <!-- 中指肌腱 -->
                <path d="M90 160 L90 55" stroke="#90EE90" stroke-width="2" fill="none"/>
                <circle cx="90" cy="55" r="8" fill="#90EE90"/>
                <text x="95" y="50" class="tendon-label" fill="#90EE90">M</text>

                <!-- 无名指肌腱 -->
                <path d="M120 160 L120 60" stroke="#FFE4B5" stroke-width="2" fill="none"/>
                <circle cx="120" cy="60" r="8" fill="#FFE4B5"/>
                <text x="125" y="55" class="tendon-label" fill="#D4A574">R</text>

                <!-- 小指肌腱 -->
                <path d="M150 160 L150 70" stroke="#DDA0DD" stroke-width="2" fill="none"/>
                <circle cx="150" cy="70" r="8" fill="#DDA0DD"/>
                <text x="155" y="65" class="tendon-label" fill="#BA55D3">P</text>
              </g>

              <!-- 舵机框 -->
              <rect x="10" y="150" width="180" height="25" rx="5" fill="#333" stroke="#555" stroke-width="1"/>
              <text x="100" y="167" fill="#FFF" text-anchor="middle" font-size="12">舵机阵列 (7个)</text>
            </svg>

            <div class="tendon-legend">
              <div class="legend-item">
                <span class="legend-color" style="background:#FF6B6B">T</span>
                <span>拇指</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background:#45B7D1">I</span>
                <span>食指</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background:#90EE90">M</span>
                <span>中指</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background:#FFE4B5">R</span>
                <span>无名指</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background:#DDA0DD">P</span>
                <span>小指</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { Refresh, Download, Upload } from '@element-plus/icons-vue'
import {
  jointDefinitions,
  presetActions
} from '@/data/joint-mappings.js'
import { useMultiJointMapping } from '@/composables/useJointMapping.js'
import { useConfigStore } from '@/stores/config.js'
import { exportAsJSON, importFromJSON } from '@/utils/export.js'
import Logger from '@/utils/logger.js'

const LOG_LABEL = 'JointMapping'

// Store
const configStore = useConfigStore()

// 状态
const selectedJoints = ref([0, 1, 2, 3, 4, 5, 6]) // 默认全选
const jointPositions = reactive({}) // 各关节位置百分比 0-100
const currentPreset = ref(null)
const jointDetailVisible = ref(false)
const selectedJointDetail = ref(null)

// 计算器
const calcInput = reactive({ angle: 0 })
const calcResult = ref(null)

// 多关节映射
const {
  jointStates,
  syncJointIds
} = useMultiJointMapping(selectedJoints.value)

// 初始化关节位置
jointDefinitions.forEach(joint => {
  jointPositions[joint.id] = 0
})

// ========== 计算属性 ==========

const averagePosition = computed(() => {
  if (!selectedJoints.value.length) return 0
  const total = selectedJoints.value.reduce((sum, jointId) => {
    return sum + (jointPositions[jointId] || 0)
  }, 0)
  return Math.round(total / selectedJoints.value.length)
})

const outOfRangeJoints = computed(() => (
  selectedJoints.value.filter(jointId => jointStates.value[jointId]?.isOutOfRange?.value)
))

// ========== 方法 ==========

function getJointAngle(jointId) {
  const state = jointStates.value[jointId]?.getStateSummary()
  return state ? Math.round(state.jointAngle || 0) : 0
}

function getJointPulse(jointId) {
  const state = jointStates.value[jointId]?.getStateSummary()
  return state ? state.pulse : 0
}

function getServoAngle(jointId) {
  const state = jointStates.value[jointId]?.getStateSummary()
  return state ? Math.round(state.servoAngle || 0) : 0
}

function getJointConfig(jointId) {
  return configStore.getJointConfig(jointId) || {}
}

function selectJoint(jointId) {
  selectedJointDetail.value = jointDefinitions.find(j => j.id === jointId)
  jointDetailVisible.value = true
}

function toggleJointSelection(jointId) {
  const index = selectedJoints.value.indexOf(jointId)
  if (index > -1) {
    if (selectedJoints.value.length > 1) {
      selectedJoints.value.splice(index, 1)
    }
  } else {
    selectedJoints.value.push(jointId)
  }
  syncJointIds(selectedJoints.value)
}

function onJointPositionChange(jointId, value) {
  const percent = value / 100
  if (jointStates.value[jointId]) {
    jointStates.value[jointId].setPosition(percent)
  }
}

function applyPreset(presetKey) {
  const preset = presetActions[presetKey]
  if (preset) {
    currentPreset.value = presetKey
    preset.positions.forEach((pos, index) => {
      jointPositions[index] = Math.round(pos * 100)
      if (jointStates.value[index]) {
        jointStates.value[index].setPosition(pos)
      }
    })
  }
}

function resetAllJoints() {
  currentPreset.value = null
  jointDefinitions.forEach(joint => {
    jointPositions[joint.id] = 0
    if (jointStates.value[joint.id]) {
      jointStates.value[joint.id].setPosition(0)
    }
  })
}

function calculateFromAngle() {
  const jointId = selectedJoints.value[0] || 0
  const config = getJointConfig(jointId)
  if (!config.maxAngle) return

  const angle = calcInput.angle
  const position = angle / config.maxAngle
  const pulse = Math.round(position * (config.extendCount - config.graspCount) + config.graspCount)
  const servoAngle = angle / config.gearRatio

  calcResult.value = {
    position: Math.round(position * 100),
    pulse,
    servoAngle: Math.round(servoAngle)
  }
}

function getRangeWidth(joint) {
  return '100%'
}

function getRangePosition(joint) {
  const angle = getJointAngle(joint.id)
  return (angle / joint.maxAngle) * 100
}

// ========== SVG 手部路径计算 ==========

function getFingerPath(fingerId) {
  const pos = jointPositions[fingerId] || 0
  const angle = (pos / 100) * 150 // maxAngle is 150

  const baseX = [145, 175, 205, 235][fingerId - 2] || 175
  const baseY = 170

  // 简化的手指路径
  const fingerLength = 100
  const bendAngle = (angle / 180) * Math.PI

  const endX = baseX + Math.sin(bendAngle) * fingerLength
  const endY = baseY + Math.cos(bendAngle) * fingerLength

  // 绘制弯曲的手指
  if (fingerId === 5) {
    // 小指更短
    return `M${baseX - 8} ${baseY}
            Q${baseX - 10} ${baseY + 50} ${endX} ${endY}
            Q${baseX + 8} ${baseY + 50} ${baseX + 8} ${baseY}
            Z`
  }

  return `M${baseX - 10} ${baseY}
          Q${baseX - 12} ${baseY + 50} ${endX} ${endY}
          Q${baseX + 10} ${baseY + 50} ${baseX + 10} ${baseY}
          Z`
}

function getFingerTextPos(fingerId) {
  const baseX = [145, 175, 205, 235][fingerId - 2] || 175
  return { x: baseX, y: 140 }
}

function getThumbBasePath() {
  const pos = jointPositions[0] || 0
  const angle = (pos / 100) * 45
  return `M120 180 Q100 200 ${110 + angle} ${220 - angle} L140 210 Q130 195 130 180 Z`
}

function getThumbDistalPath() {
  const pos = jointPositions[1] || 0
  const angle = (pos / 100) * 60
  const baseX = 125
  const baseY = 210
  return `M${baseX} ${baseY}
          Q${baseX - 20} ${baseY + 30} ${baseX - 10 + angle} ${baseY + 50 + angle * 0.5}
          Q${baseX + 15} ${baseY + 40} ${baseX + 10} ${baseY}
          Z`
}

const thumbAngleText = computed(() => ({
  x: 100,
  y: 200
}))

// ========== 配置管理 ==========

function exportConfig() {
  const config = configStore.exportConfig()
  exportAsJSON(config, `aero-hand-joint-config-${Date.now()}.json`)
}

async function importConfig() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const data = await importFromJSON(file)
        configStore.importConfig(data)
        Logger.info(LOG_LABEL, '配置导入成功')
      } catch (error) {
        Logger.error(LOG_LABEL, '导入配置失败:', error)
      }
    }
  }
  input.click()
}

function resetConfig() {
  configStore.resetAllConfig()
  resetAllJoints()
  Logger.info(LOG_LABEL, '配置已重置')
}

// ========== 生命周期 ==========

onMounted(() => {
  syncJointIds(selectedJoints.value)
})
</script>

<style scoped>
.joint-mapping-page {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.mapping-container {
  display: grid;
  grid-template-columns: 320px 1fr 300px;
  gap: 20px;
  margin-top: 20px;
}

/* 卡片通用样式 */
:deep(.el-card) {
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  border-bottom: none;
  border-radius: 16px 16px 0 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 手部可视化 */
.hand-visualization-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hand-svg-container {
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hand-svg {
  width: 100%;
  max-width: 280px;
  height: auto;
}

.angle-text {
  font-size: 10px;
  font-weight: bold;
  fill: #333;
  text-anchor: middle;
}

.wrist-text {
  font-size: 12px;
}

.g.active path,
.g.active rect {
  filter: brightness(1.1);
  stroke-width: 3;
}

.joint-detail-hint {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin-top: 12px;
  cursor: pointer;
}

.joint-detail-panel h4 {
  margin: 0 0 4px 0;
}

.joint-detail-en {
  color: #666;
  font-size: 12px;
  margin: 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 8px;
}

.detail-row span:first-child {
  color: #666;
}

/* 舵机状态面板 */
.servo-status-card :deep(.el-card__body) {
  padding: 12px;
}

.servo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.servo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  background: #f5f7fa;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.servo-item:hover {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.servo-item.active {
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.servo-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.servo-info {
  flex: 1;
  min-width: 0;
}

.servo-name {
  font-size: 11px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.servo-angle {
  font-size: 14px;
  font-weight: bold;
  color: #409EFF;
}

/* 控制面板 */
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.joint-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.joint-control-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px;
}

.joint-control-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.joint-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.joint-control-name {
  font-weight: 600;
  font-size: 13px;
}

.joint-control-en {
  color: #999;
  font-size: 11px;
}

.slider-container {
  margin-bottom: 8px;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #666;
  margin-top: 4px;
}

.current-angle {
  font-weight: bold;
  color: #409EFF;
}

.joint-info-row {
  display: flex;
  gap: 12px;
  font-size: 11px;
}

.info-label {
  color: #999;
}

.info-value {
  font-weight: 600;
  color: #333;
}

/* 计算器 */
.calculator {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.calc-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.calc-label {
  color: #666;
  font-size: 13px;
  flex: 1;
}

.calc-result {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  background: #f5f7fa;
  padding: 12px;
  border-radius: 8px;
}

.calc-result-item {
  text-align: center;
}

.calc-result-item span:first-child {
  display: block;
  font-size: 11px;
  color: #666;
}

.calc-result-item span:last-child {
  font-size: 16px;
  font-weight: bold;
  color: #409EFF;
}

/* 坐标系说明 */
.coordinate-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coord-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.coord-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  flex-shrink: 0;
}

.coord-text {
  font-size: 12px;
}

.coord-text strong {
  display: block;
  margin-bottom: 2px;
}

.coord-text p {
  margin: 0;
  color: #666;
}

/* 预设面板 */
.preset-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.preset-item {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.preset-item:hover {
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.preset-item.active {
  border-color: #409EFF;
  background: white;
}

.preset-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.preset-name {
  font-size: 13px;
  font-weight: 600;
}

.preset-name-en {
  font-size: 10px;
  color: #999;
}

/* 运动范围 */
.range-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.range-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.range-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.range-color {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.range-bar-container {
  position: relative;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.range-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.range-indicator {
  position: absolute;
  top: -2px;
  width: 4px;
  height: 12px;
  background: #333;
  border-radius: 2px;
  transform: translateX(-50%);
  transition: left 0.3s;
}

.range-value {
  font-size: 10px;
  color: #666;
  text-align: right;
}

/* 配置管理 */
.config-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-btn {
  width: 100%;
}

.quick-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-title {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 4px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

/* 肌腱传动图 */
.tendon-diagram {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tendon-svg {
  width: 100%;
  background: #f8f9fa;
  border-radius: 8px;
}

.tendon-label {
  font-size: 8px;
  font-weight: bold;
}

.tendon-legend {
  display: flex;
  justify-content: space-around;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 9px;
  font-weight: bold;
}

/* 响应式 */
@media (max-width: 1400px) {
  .mapping-container {
    grid-template-columns: 1fr 1fr;
  }

  .preset-panel {
    grid-column: 1 / -1;
  }
}

@media (max-width: 900px) {
  .mapping-container {
    grid-template-columns: 1fr;
  }
}
</style>
