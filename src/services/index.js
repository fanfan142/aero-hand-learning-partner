/**
 * 服务层统一导出
 */

// 存储服务
export { storageService, STORAGE_KEYS, setItem, getItem, removeItem, clearAll, getStorageInfo } from './storage.js'

// 数据服务
export {
  ExportFormat,
  MergeStrategy,
  exportAllData,
  exportAsJSONFile,
  exportAsCSVFile,
  exportAsMarkdownFile,
  importFromFile,
  importData,
  copyToClipboard,
  pasteFromClipboard
} from './data.js'

// 验证服务
export {
  ValidationResult,
  validateNotification,
  validateAchievement,
  validateNote,
  validateBookmark,
  validateLearningProgress,
  validateImportData,
  validateServoConfig,
  validatePreferences,
  validateNotifications,
  isValidUrl
} from './validation.js'

// 初始化服务
export {
  isFirstVisit,
  getDataVersion,
  initializeDefaultData,
  migrateData,
  checkAndMigrate,
  resetAllData,
  getInitializationStatus,
  initializeApp,
  CURRENT_DATA_VERSION
} from './initialization.js'

// 默认导出
export { default as storageService } from './storage.js'
export { default as dataService } from './data.js'
export { default as validationService } from './validation.js'
export { default as initService } from './initialization.js'
