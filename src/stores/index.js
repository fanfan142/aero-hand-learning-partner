/**
 * Stores 模块导出
 * 统一导出所有 Pinia stores
 */

// 配置管理 Store
export { useConfigStore } from './config.js'

// 笔记系统 Store
export { useNotesStore } from './notes.js'

// 任务管理 Store
export { useTasksStore } from './tasks.js'

// 书签 Store
export { useBookmarksStore } from './bookmarks.js'

// 搜索 Store
export { useSearchStore } from './search.js'

// AI 对话 Store
export { useAIChatStore } from './ai-chat.js'

// 用户偏好 Store
export { usePreferencesStore } from './preferences.js'

// 学习管理 Store
export { useLearningStore } from './learning.js'

// 成就系统 Store
export { useAchievementsStore } from './achievements.js'

// 通知系统 Store
export { useNotificationsStore, NotificationType, NotificationCategory } from './notifications.js'
