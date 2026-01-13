/**
 * 关节映射 Composable
 * 处理关节位置、角度、脉冲之间的转换
 */

import { ref, computed, watch } from 'vue'
import { useConfigStore } from '@/stores/config.js'
import {
  positionToPulse,
  pulseToPosition,
  pulseToAngle,
  positionToAngle,
  angleToServoAngle
} from '@/utils/math.js'
import { checkRangeLimit } from '@/utils/validation.js'

/**
 * 关节映射 Composable
 * @param {number} jointId - 关节ID
 * @returns {Object} 映射方法和状态
 */
export function useJointMapping(jointId) {
  const configStore = useConfigStore()

  // ========== 状态 ==========
  const positionPercent = ref(0) // 0-1
  const pulseCount = ref(0)
  const jointAngle = ref(0)
  const servoAngle = ref(0)
  const isOutOfRange = ref(false)
  const rangeWarning = ref('')

  // 获取关节配置
  const jointConfig = computed(() => configStore.getJointConfig(jointId))

  // ========== 计算方法 ==========

  /**
   * 根据位置百分比计算所有相关值
   */
  function calculateFromPosition(percent) {
    if (!jointConfig.value) return

    const config = jointConfig.value
    positionPercent.value = percent

    // 计算脉冲数量
    const pulse = positionToPulse(percent, config.extendCount, config.graspCount)
    pulseCount.value = pulse

    // 计算关节角度
    const angle = positionToAngle(percent, config.maxAngle)
    jointAngle.value = angle

    // 计算舵机角度
    servoAngle.value = angleToServoAngle(angle, config.gearRatio)

    // 检查是否超限
    const rangeCheck = checkRangeLimit(pulse, config.extendCount, config.graspCount)
    isOutOfRange.value = rangeCheck.outOfRange
    rangeWarning.value = rangeCheck.message || ''
  }

  /**
   * 根据脉冲数量计算所有相关值
   */
  function calculateFromPulse(pulse) {
    if (!jointConfig.value) return

    const config = jointConfig.value
    pulseCount.value = pulse

    // 计算位置百分比
    const percent = pulseToPosition(pulse, config.extendCount, config.graspCount)
    positionPercent.value = Math.max(0, Math.min(1, percent))

    // 计算关节角度
    jointAngle.value = pulseToAngle(pulse, config.extendCount, config.graspCount, config.maxAngle)

    // 计算舵机角度
    servoAngle.value = angleToServoAngle(jointAngle.value, config.gearRatio)

    // 检查是否超限
    const rangeCheck = checkRangeLimit(pulse, config.extendCount, config.graspCount)
    isOutOfRange.value = rangeCheck.outOfRange
    rangeWarning.value = rangeCheck.message || ''
  }

  /**
   * 根据关节角度计算所有相关值
   */
  function calculateFromAngle(angle) {
    if (!jointConfig.value) return

    const config = jointConfig.value
    jointAngle.value = angle

    // 计算位置百分比
    const percent = angle / config.maxAngle
    positionPercent.value = Math.max(0, Math.min(1, percent))

    // 计算脉冲数量
    pulseCount.value = positionToPulse(positionPercent.value, config.extendCount, config.graspCount)

    // 计算舵机角度
    servoAngle.value = angleToServoAngle(angle, config.gearRatio)

    // 检查是否超限
    const rangeCheck = checkRangeLimit(pulseCount.value, config.extendCount, config.graspCount)
    isOutOfRange.value = rangeCheck.outOfRange
    rangeWarning.value = rangeCheck.message || ''
  }

  /**
   * 设置位置百分比
   */
  function setPosition(percent) {
    calculateFromPosition(Math.max(0, Math.min(1, percent)))
  }

  /**
   * 设置脉冲数量
   */
  function setPulse(pulse) {
    calculateFromPulse(pulse)
  }

  /**
   * 设置关节角度
   */
  function setAngle(angle) {
    calculateFromAngle(angle)
  }

  /**
   * 重置为初始状态
   */
  function reset() {
    calculateFromPosition(0)
  }

  /**
   * 获取当前状态摘要
   */
  function getStateSummary() {
    return {
      jointId,
      position: positionPercent.value,
      pulse: pulseCount.value,
      jointAngle: jointAngle.value,
      servoAngle: servoAngle.value,
      isOutOfRange: isOutOfRange.value,
      warning: rangeWarning.value
    }
  }

  /**
   * 获取配置信息
   */
  function getConfigInfo() {
    if (!jointConfig.value) return null
    return {
      extendCount: jointConfig.value.extendCount,
      graspCount: jointConfig.value.graspCount,
      maxAngle: jointConfig.value.maxAngle,
      gearRatio: jointConfig.value.gearRatio,
      pulseRange: jointConfig.value.extendCount - jointConfig.value.graspCount
    }
  }

  // 初始化
  if (jointConfig.value) {
    calculateFromPosition(0)
  }

  // 监听配置变化
  watch(jointConfig, () => {
    if (jointConfig.value) {
      calculateFromPosition(positionPercent.value)
    }
  }, { deep: true })

  return {
    // 状态
    positionPercent,
    pulseCount,
    jointAngle,
    servoAngle,
    isOutOfRange,
    rangeWarning,
    jointConfig,

    // 方法
    calculateFromPosition,
    calculateFromPulse,
    calculateFromAngle,
    setPosition,
    setPulse,
    setAngle,
    reset,
    getStateSummary,
    getConfigInfo
  }
}

/**
 * 多关节映射 Composable
 * 用于同时控制多个关节
 */
export function useMultiJointMapping(jointIds = []) {
  const jointStates = ref({})
  const activeJointIds = ref([...jointIds])

  // 初始化每个关节的状态
  function initializeJoints(ids = activeJointIds.value) {
    ids.forEach(id => {
      if (!jointStates.value[id]) {
        jointStates.value[id] = useJointMapping(id)
      }
    })
  }

  function syncJointIds(ids = []) {
    activeJointIds.value = [...ids]
    initializeJoints(ids)
  }

  /**
   * 设置多个关节的位置
   * @param {Object} positions - { jointId: percent }
   */
  function setMultiplePositions(positions) {
    Object.entries(positions).forEach(([id, percent]) => {
      if (jointStates.value[id]) {
        jointStates.value[id].setPosition(percent)
      }
    })
  }

  /**
   * 应用预设动作
   * @param {Array} positions - 位置百分比数组
   */
  function applyPreset(positions) {
    activeJointIds.value.forEach((id, index) => {
      if (positions[index] !== undefined && jointStates.value[id]) {
        jointStates.value[id].setPosition(positions[index])
      }
    })
  }

  /**
   * 获取所有关节状态
   */
  function getAllStates() {
    const states = {}
    Object.entries(jointStates.value).forEach(([id, mapping]) => {
      states[id] = mapping.getStateSummary()
    })
    return states
  }

  /**
   * 获取状态数组（用于图表）
   */
  function getStatesArray() {
    return activeJointIds.value.map(id => ({
      jointId: id,
      ...jointStates.value[id]?.getStateSummary()
    })).filter(state => state.jointId !== undefined)
  }

  // 初始化
  initializeJoints()

  return {
    jointStates,
    syncJointIds,
    setMultiplePositions,
    applyPreset,
    getAllStates,
    getStatesArray
  }
}
