/**
 * 数据初始化服务
 * 处理首次访问检测、默认数据初始化、数据迁移等
 */

import { storageService, STORAGE_KEYS } from './storage.js'

const CURRENT_DATA_VERSION = 1

/**
 * 默认通知设置
 */
const DEFAULT_NOTIFICATION_SETTINGS = {
  enabled: true,
  sound: true,
  position: 'top-right',
  duration: 5000,
  types: {
    achievement: true,
    system: true,
    tip: true,
    reminder: true,
    error: false
  }
}

/**
 * 默认用户偏好
 */
const DEFAULT_PREFERENCES = {
  version: 1,
  isDarkMode: false,
  isCompactMode: false,
  isSidebarCollapsed: false,
  locale: 'zh-CN',
  animationsEnabled: true,
  pageSize: 20
}

/**
 * 默认统计数据
 */
const DEFAULT_LEARNING_STATS = {
  totalLearningMinutes: 0,
  streakDays: 0,
  lastStudyDate: null,
  completedTasksCount: 0,
  completedStagesCount: 0,
  totalStudySessions: 0,
  codeRunsCount: 0,
  docsViewsCount: 0
}

/**
 * 检查是否是首次访问
 * @returns {boolean}
 */
export function isFirstVisit() {
  // 检查是否有过任何数据存储
  const hasVisited = storageService.get(STORAGE_KEYS.DATA_VERSION)
  return !hasVisited
}

/**
 * 获取当前数据版本
 * @returns {number}
 */
export function getDataVersion() {
  return storageService.get(STORAGE_KEYS.DATA_VERSION, 0)
}

/**
 * 初始化默认数据
 * 用于首次访问时创建默认数据
 */
export function initializeDefaultData() {
  console.log('[Initialization] 初始化默认数据...')

  // 初始化通知设置
  if (!storageService.has(STORAGE_KEYS.NOTIFICATION_SETTINGS)) {
    storageService.set(STORAGE_KEYS.NOTIFICATION_SETTINGS, DEFAULT_NOTIFICATION_SETTINGS)
    console.log('[Initialization] 通知设置已初始化')
  }

  // 初始化空的通知列表
  if (!storageService.has(STORAGE_KEYS.NOTIFICATIONS)) {
    storageService.set(STORAGE_KEYS.NOTIFICATIONS, [])
    console.log('[Initialization] 通知列表已初始化')
  }

  // 初始化空的学习进度
  if (!storageService.has(STORAGE_KEYS.LEARNING_PROGRESS)) {
    storageService.set(STORAGE_KEYS.LEARNING_PROGRESS, {
      currentStage: 'hardware',
      completedTasks: [],
      stats: DEFAULT_LEARNING_STATS
    })
    console.log('[Initialization] 学习进度已初始化')
  }

  // 初始化空的书签
  if (!storageService.has(STORAGE_KEYS.BOOKMARKS)) {
    storageService.set(STORAGE_KEYS.BOOKMARKS, {
      articles: [],
      pages: [],
      tasks: [],
      notes: {}
    })
    console.log('[Initialization] 书签已初始化')
  }

  // 初始化空的搜索历史
  if (!storageService.has(STORAGE_KEYS.SEARCH_HISTORY)) {
    storageService.set(STORAGE_KEYS.SEARCH_HISTORY, [])
    console.log('[Initialization] 搜索历史已初始化')
  }

  // 标记数据版本
  storageService.set(STORAGE_KEYS.DATA_VERSION, CURRENT_DATA_VERSION)

  console.log('[Initialization] 默认数据初始化完成')
}

/**
 * 执行数据迁移
 * 当数据版本发生变化时调用
 * @param {number} fromVersion - 旧版本号
 * @param {number} toVersion - 新版本号
 */
export function migrateData(fromVersion, toVersion) {
  console.log(`[Initialization] 数据迁移: v${fromVersion} -> v${toVersion}`)

  if (toVersion === 1) {
    // v0 -> v1 的迁移
    migrateToV1()
  }

  // 更新版本号
  storageService.set(STORAGE_KEYS.DATA_VERSION, toVersion)
  console.log('[Initialization] 数据迁移完成')
}

/**
 * 迁移到 v1
 */
function migrateToV1() {
  console.log('[Initialization] 执行 v0 -> v1 迁移')

  // 检查旧版本的成就数据格式并迁移
  const achievements = storageService.get(STORAGE_KEYS.ACHIEVEMENTS)
  if (achievements && Array.isArray(achievements)) {
    // 旧版本是数组，新版本需要是对象格式
    const newFormat = {
      unlockedAchievements: achievements,
      achievementProgress: {},
      learningStats: DEFAULT_LEARNING_STATS,
      dailyLearningRecords: [],
      studySessions: []
    }
    storageService.set(STORAGE_KEYS.ACHIEVEMENTS, newFormat)
    console.log('[Initialization] 成就数据已迁移到 v1 格式')
  }
}

/**
 * 检查并执行必要的数据迁移
 */
export function checkAndMigrate() {
  const currentVersion = getDataVersion()

  if (currentVersion < CURRENT_DATA_VERSION) {
    migrateData(currentVersion, CURRENT_DATA_VERSION)
  }
}

/**
 * 重置所有数据（谨慎使用）
 * @param {Array<string>} excludeKeys - 排除的键名数组
 */
export function resetAllData(excludeKeys = []) {
  console.log('[Initialization] 重置所有数据...')

  const allKeys = storageService.getAllKeys()
  const keysToReset = allKeys.filter(key => !excludeKeys.includes(key))

  for (const key of keysToReset) {
    storageService.remove(key)
  }

  // 重新初始化默认数据
  initializeDefaultData()

  console.log(`[Initialization] 已重置 ${keysToReset.length} 项数据`)
}

/**
 * 获取初始化状态信息
 * @returns {Object} 状态信息
 */
export function getInitializationStatus() {
  return {
    isFirstVisit: isFirstVisit(),
    dataVersion: getDataVersion(),
    targetVersion: CURRENT_DATA_VERSION,
    needsMigration: getDataVersion() < CURRENT_DATA_VERSION,
    storageInfo: storageService.getStorageInfo()
  }
}

/**
 * 完整的应用初始化
 * 在应用启动时调用
 */
export async function initializeApp() {
  console.log('[Initialization] 开始应用初始化...')

  const status = getInitializationStatus()

  if (status.isFirstVisit) {
    console.log('[Initialization] 首次访问，进行初始化...')
    initializeDefaultData()
  } else if (status.needsMigration) {
    console.log('[Initialization] 检测到数据版本差异，执行迁移...')
    checkAndMigrate()
  } else {
    console.log('[Initialization] 数据已是最新版本')
  }

  return getInitializationStatus()
}

export default {
  isFirstVisit,
  getDataVersion,
  initializeDefaultData,
  migrateData,
  checkAndMigrate,
  resetAllData,
  getInitializationStatus,
  initializeApp,
  CURRENT_DATA_VERSION
}
