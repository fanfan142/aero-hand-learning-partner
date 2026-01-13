/**
 * 配置管理 Store
 * 管理舵机配置、关节参数等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jointDefinitions } from '@/data/joint-mappings.js'

export const useConfigStore = defineStore('config', () => {
  // ========== 状态 ==========
  const servoConfig = ref({})
  const configHistory = ref([])
  const currentConfigName = ref('默认配置')

  // 初始化默认配置
  function initDefaultConfig() {
    const config = {}
    jointDefinitions.forEach(joint => {
      config[joint.id] = {
        servoId: joint.servoId,
        extendCount: joint.defaultExtendCount,
        graspCount: joint.defaultGraspCount,
        maxAngle: joint.maxAngle,
        gearRatio: joint.gearRatio,
        enabled: true
      }
    })
    servoConfig.value = config
    saveToLocalStorage()
  }

  // ========== 计算属性 ==========
  const enabledJoints = computed(() => {
    return Object.entries(servoConfig.value)
      .filter(([_, config]) => config.enabled)
      .map(([id, _]) => parseInt(id))
  })

  const jointConfigs = computed(() => {
    return Object.entries(servoConfig.value).map(([id, config]) => ({
      jointId: parseInt(id),
      ...config
    }))
  })

  // ========== 方法 ==========

  /**
   * 获取关节配置
   * @param {number} jointId - 关节ID
   * @returns {Object|null} 配置对象
   */
  function getJointConfig(jointId) {
    return servoConfig.value[jointId] || null
  }

  /**
   * 更新关节配置
   * @param {number} jointId - 关节ID
   * @param {Object} params - 配置参数
   */
  function updateJointConfig(jointId, params) {
    if (!servoConfig.value[jointId]) {
      console.warn(`关节 ${jointId} 不存在`)
      return
    }

    servoConfig.value[jointId] = {
      ...servoConfig.value[jointId],
      ...params
    }

    saveToLocalStorage()
  }

  /**
   * 批量更新关节配置
   * @param {Array} configs - 配置数组 [{jointId, ...params}]
   */
  function batchUpdateConfig(configs) {
    configs.forEach(({ jointId, ...params }) => {
      if (servoConfig.value[jointId]) {
        servoConfig.value[jointId] = {
          ...servoConfig.value[jointId],
          ...params
        }
      }
    })
    saveToLocalStorage()
  }

  /**
   * 重置关节配置为默认值
   * @param {number} jointId - 关节ID
   */
  function resetJointConfig(jointId) {
    const jointDef = jointDefinitions.find(j => j.id === jointId)
    if (!jointDef) return

    servoConfig.value[jointId] = {
      servoId: jointDef.servoId,
      extendCount: jointDef.defaultExtendCount,
      graspCount: jointDef.defaultGraspCount,
      maxAngle: jointDef.maxAngle,
      gearRatio: jointDef.gearRatio,
      enabled: true
    }

    saveToLocalStorage()
  }

  /**
   * 重置所有配置
   */
  function resetAllConfig() {
    initDefaultConfig()
  }

  /**
   * 启用/禁用关节
   * @param {number} jointId - 关节ID
   * @param {boolean} enabled - 是否启用
   */
  function setJointEnabled(jointId, enabled) {
    if (servoConfig.value[jointId]) {
      servoConfig.value[jointId].enabled = enabled
      saveToLocalStorage()
    }
  }

  /**
   * 保存配置到历史记录
   * @param {string} name - 配置名称
   */
  function saveConfigToHistory(name) {
    const snapshot = {
      name: name || `配置 ${configHistory.value.length + 1}`,
      timestamp: Date.now(),
      config: JSON.parse(JSON.stringify(servoConfig.value))
    }
    configHistory.value.push(snapshot)

    // 限制历史记录数量
    if (configHistory.value.length > 10) {
      configHistory.value.shift()
    }

    saveHistoryToLocalStorage()
  }

  /**
   * 从历史记录恢复配置
   * @param {number} index - 历史记录索引
   */
  function restoreFromHistory(index) {
    if (index >= 0 && index < configHistory.value.length) {
      servoConfig.value = JSON.parse(JSON.stringify(configHistory.value[index].config))
      currentConfigName.value = configHistory.value[index].name
      saveToLocalStorage()
    }
  }

  /**
   * 导出配置
   * @returns {Object} 配置对象
   */
  function exportConfig() {
    return {
      name: currentConfigName.value,
      timestamp: Date.now(),
      version: '1.0',
      config: JSON.parse(JSON.stringify(servoConfig.value))
    }
  }

  /**
   * 导入配置
   * @param {Object} data - 配置数据
   */
  function importConfig(data) {
    if (data.config) {
      servoConfig.value = data.config
      currentConfigName.value = data.name || '导入的配置'
      saveToLocalStorage()
    }
  }

  /**
   * 保存到本地存储
   */
  function saveToLocalStorage() {
    try {
      localStorage.setItem('aero-hand-config', JSON.stringify(servoConfig.value))
      localStorage.setItem('aero-hand-config-name', currentConfigName.value)
    } catch (error) {
      console.error('保存配置失败:', error)
    }
  }

  /**
   * 从本地存储加载
   */
  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('aero-hand-config')
      const name = localStorage.getItem('aero-hand-config-name')

      if (saved) {
        servoConfig.value = JSON.parse(saved)
      } else {
        initDefaultConfig()
      }

      if (name) {
        currentConfigName.value = name
      }
    } catch (error) {
      console.error('加载配置失败:', error)
      initDefaultConfig()
    }
  }

  /**
   * 保存历史记录到本地存储
   */
  function saveHistoryToLocalStorage() {
    try {
      localStorage.setItem('aero-hand-config-history', JSON.stringify(configHistory.value))
    } catch (error) {
      console.error('保存历史记录失败:', error)
    }
  }

  /**
   * 从本地存储加载历史记录
   */
  function loadHistoryFromLocalStorage() {
    try {
      const saved = localStorage.getItem('aero-hand-config-history')
      if (saved) {
        configHistory.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('加载历史记录失败:', error)
    }
  }

  /**
   * 清除历史记录
   */
  function clearHistory() {
    configHistory.value = []
    saveHistoryToLocalStorage()
  }

  // 初始化
  loadFromLocalStorage()
  loadHistoryFromLocalStorage()

  return {
    // 状态
    servoConfig,
    configHistory,
    currentConfigName,

    // 计算属性
    enabledJoints,
    jointConfigs,

    // 方法
    getJointConfig,
    updateJointConfig,
    batchUpdateConfig,
    resetJointConfig,
    resetAllConfig,
    setJointEnabled,
    saveConfigToHistory,
    restoreFromHistory,
    exportConfig,
    importConfig,
    saveToLocalStorage,
    loadFromLocalStorage,
    clearHistory
  }
})
