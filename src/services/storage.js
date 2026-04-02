/**
 * 本地存储管理服务
 * 提供统一的 localStorage 操作接口，支持命名空间和数据版本管理
 */

const STORAGE_PREFIX = 'aero-hand-'
const STORAGE_VERSION = 1

/**
 * 存储键名配置
 */
export const STORAGE_KEYS = {
  // 用户数据
  PREFERENCES: 'preferences',
  USER_PROFILE: 'user-profile',

  // 学习相关
  LEARNING_PROGRESS: 'learning-progress',
  ACHIEVEMENTS: 'achievements',
  NOTES: 'notes',
  BOOKMARKS: 'bookmarks',

  // 搜索相关
  SEARCH_HISTORY: 'search-history',

  // 配置相关
  SERVO_CONFIG: 'servo-config',
  CONFIG_HISTORY: 'config-history',

  // 通知相关
  NOTIFICATIONS: 'notifications',
  NOTIFICATION_SETTINGS: 'notification-settings',

  // AI 对话
  AI_CHAT_HISTORY: 'ai-chat-history',

  // 系统
  APP_STATE: 'app-state',
  DATA_VERSION: 'data-version'
}

/**
 * 存储服务类
 */
class StorageService {
  constructor() {
    this.prefix = STORAGE_PREFIX
    this.version = STORAGE_VERSION
  }

  /**
   * 获取完整的存储键名
   * @param {string} key - 键名
   * @returns {string} 带前缀的键名
   */
  getFullKey(key) {
    return `${this.prefix}${key}`
  }

  /**
   * 保存数据到 localStorage
   * @param {string} key - 键名
   * @param {any} data - 要保存的数据
   * @param {Object} options - 选项 { version?: number, timestamp?: boolean }
   */
  set(key, data, options = {}) {
    try {
      const { version = this.version, timestamp = true } = options
      const payload = {
        data,
        version,
        ...(timestamp && { savedAt: new Date().toISOString() })
      }
      localStorage.setItem(this.getFullKey(key), JSON.stringify(payload))
      return true
    } catch (error) {
      console.error(`[Storage] 保存失败 ${key}:`, error)
      return false
    }
  }

  /**
   * 从 localStorage 获取数据
   * @param {string} key - 键名
   * @param {any} defaultValue - 默认值
   * @returns {any} 获取的数据或默认值
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.getFullKey(key))
      if (!item) return defaultValue

      const parsed = JSON.parse(item)
      // 支持新旧格式兼容
      if (parsed.data !== undefined) {
        return parsed.data
      }
      return parsed
    } catch (error) {
      console.error(`[Storage] 读取失败 ${key}:`, error)
      return defaultValue
    }
  }

  /**
   * 删除指定键名的数据
   * @param {string} key - 键名
   */
  remove(key) {
    try {
      localStorage.removeItem(this.getFullKey(key))
      return true
    } catch (error) {
      console.error(`[Storage] 删除失败 ${key}:`, error)
      return false
    }
  }

  /**
   * 检查键名是否存在
   * @param {string} key - 键名
   * @returns {boolean}
   */
  has(key) {
    return localStorage.getItem(this.getFullKey(key)) !== null
  }

  /**
   * 获取存储的数据信息（不解析 data 字段）
   * @param {string} key - 键名
   * @returns {Object|null} 数据信息或 null
   */
  getMeta(key) {
    try {
      const item = localStorage.getItem(this.getFullKey(key))
      if (!item) return null

      const parsed = JSON.parse(item)
      return {
        version: parsed.version,
        savedAt: parsed.savedAt,
        size: item.length
      }
    } catch (error) {
      return null
    }
  }

  /**
   * 批量保存数据
   * @param {Object} dataMap - { key: data } 格式的对象
   */
  multiSet(dataMap) {
    const results = {}
    for (const [key, data] of Object.entries(dataMap)) {
      results[key] = this.set(key, data)
    }
    return results
  }

  /**
   * 批量获取数据
   * @param {Array<string>} keys - 键名数组
   * @returns {Object} { key: data } 格式的对象
   */
  multiGet(keys) {
    const result = {}
    for (const key of keys) {
      result[key] = this.get(key)
    }
    return result
  }

  /**
   * 批量删除数据
   * @param {Array<string>} keys - 键名数组
   */
  multiRemove(keys) {
    for (const key of keys) {
      this.remove(key)
    }
  }

  /**
   * 获取所有存储的键名
   * @returns {Array<string>} 键名数组（不含前缀）
   */
  getAllKeys() {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length))
      }
    }
    return keys
  }

  /**
   * 获取存储空间使用情况
   * @returns {Object} 使用情况信息
   */
  getStorageInfo() {
    let totalSize = 0
    let keyCount = 0
    const details = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith(this.prefix)) {
        const value = localStorage.getItem(key)
        const size = value.length
        totalSize += size
        keyCount++
        details.push({
          key: key.substring(this.prefix.length),
          size,
          sizeFormatted: this.formatSize(size)
        })
      }
    }

    return {
      totalSize,
      totalSizeFormatted: this.formatSize(totalSize),
      keyCount,
      details
    }
  }

  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的大小
   */
  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  /**
   * 检查存储空间是否足够
   * @param {number} requiredBytes - 需要的字节数
   * @returns {boolean}
   */
  hasEnoughSpace(requiredBytes = 1024 * 1024) {
    // localStorage 通常限制为 5-10MB
    const info = this.getStorageInfo()
    return (info.totalSize + requiredBytes) < 5 * 1024 * 1024
  }

  /**
   * 清除所有应用数据
   */
  clearAll() {
    const keys = this.getAllKeys()
    this.multiRemove(keys)
    console.log('[Storage] 已清除所有应用数据')
  }

  /**
   * 导出所有数据（用于备份）
   * @returns {Object} 所有数据的合并对象
   */
  exportAll() {
    const keys = this.getAllKeys()
    const data = {}
    for (const key of keys) {
      data[key] = this.get(key)
    }
    return {
      version: this.version,
      exportedAt: new Date().toISOString(),
      data
    }
  }

  /**
   * 导入数据（用于恢复）
   * @param {Object} backupData - 备份数据
   * @param {boolean} merge - 是否合并，false 则覆盖
   */
  importAll(backupData, merge = true) {
    if (!backupData || !backupData.data) {
      console.error('[Storage] 无效的备份数据')
      return false
    }

    const { data } = backupData
    let imported = 0

    for (const [key, value] of Object.entries(data)) {
      if (merge && this.has(key)) {
        // 合并策略：保留已存在的值
        continue
      }
      this.set(key, value)
      imported++
    }

    console.log(`[Storage] 已导入 ${imported} 项数据`)
    return true
  }
}

// 导出单例
export const storageService = new StorageService()

// 导出便捷方法
export const setItem = (key, data) => storageService.set(key, data)
export const getItem = (key, defaultValue) => storageService.get(key, defaultValue)
export const removeItem = (key) => storageService.remove(key)
export const clearAll = () => storageService.clearAll()
export const getStorageInfo = () => storageService.getStorageInfo()

export default storageService
