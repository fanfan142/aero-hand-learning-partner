/**
 * 通知系统 Store
 * 管理通知消息、成就解锁、学习提醒等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Logger from '@/utils/logger.js'

const LOG_LABEL = 'NotificationsStore'

// 通知类型
export const NotificationType = {
  ACHIEVEMENT: 'achievement',     // 成就解锁
  TASK: 'task',                   // 任务完成
  SYSTEM: 'system',               // 系统通知
  TUTORIAL: 'tutorial',           // 教程完成
  REMINDER: 'reminder',          // 学习提醒
  NEWS: 'news'                   // 系统公告（预留）
}

// 通知分类
export const NotificationCategory = {
  ACHIEVEMENT: { label: '成就', icon: 'Trophy', color: '#f56c6c' },
  TASK: { label: '任务', icon: 'Check', color: '#67c23a' },
  SYSTEM: { label: '系统', icon: 'Setting', color: '#409eff' },
  TUTORIAL: { label: '教程', icon: 'MagicStick', color: '#e6a23c' },
  REMINDER: { label: '提醒', icon: 'Bell', color: '#909399' },
  NEWS: { label: '公告', icon: 'Promotion', color: '#9933ff' }
}

const STORAGE_KEY = 'aero-hand-notifications'

export const useNotificationsStore = defineStore('notifications', () => {
  // ========== 状态 ==========

  // 通知列表
  const notifications = ref([])

  // 通知设置
  const notificationSettings = ref({
    achievementEnabled: true,      // 成就通知
    taskEnabled: true,             // 任务通知
    systemEnabled: true,           // 系统通知
    tutorialEnabled: true,         // 教程通知
    reminderEnabled: true,         // 学习提醒
    newsEnabled: false,            // 系统公告（预留）
    soundEnabled: true,             // 声音提醒
    showBadge: true                // 显示未读红点
  })

  // 统计
  const stats = ref({
    totalCount: 0,
    unreadCount: 0
  })

  // ========== 计算属性 ==========

  /**
   * 未读通知列表
   */
  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.read)
  )

  /**
   * 未读数量
   */
  const unreadCount = computed(() => unreadNotifications.value.length)

  /**
   * 按类型分组的通知
   */
  const notificationsByType = computed(() => {
    const grouped = {}
    Object.keys(NotificationType).forEach(type => {
      grouped[type] = notifications.value.filter(n => n.type === type)
    })
    return grouped
  })

  /**
   * 最近通知（最近7天）
   */
  const recentNotifications = computed(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return notifications.value
      .filter(n => n.timestamp > sevenDaysAgo)
      .sort((a, b) => b.timestamp - a.timestamp)
  })

  /**
   * 是否显示红点
   */
  const showBadge = computed(() =>
    notificationSettings.value.showBadge && unreadCount.value > 0
  )

  // ========== 方法 ==========

  /**
   * 添加通知
   */
  function addNotification(notification) {
    const newNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: notification.title || '新通知',
      content: notification.content || '',
      type: notification.type || NotificationType.SYSTEM,
      icon: notification.icon || getIconForType(notification.type),
      color: notification.color || getColorForType(notification.type),
      read: false,
      timestamp: Date.now(),
      data: notification.data || null,
      autoRemove: notification.autoRemove || false  // 是否自动消失
    }

    notifications.value.unshift(newNotification)
    updateStats()
    saveToLocalStorage()

    Logger.info(LOG_LABEL, `添加通知: ${newNotification.title}`)

    // 如果是成就解锁，显示特殊处理
    if (newNotification.type === NotificationType.ACHIEVEMENT) {
      triggerAchievementNotification(newNotification)
    }

    return newNotification.id
  }

  /**
   * 根据类型获取图标
   */
  function getIconForType(type) {
    const icons = {
      [NotificationType.ACHIEVEMENT]: 'Trophy',
      [NotificationType.TASK]: 'Check',
      [NotificationType.SYSTEM]: 'Setting',
      [NotificationType.TUTORIAL]: 'MagicStick',
      [NotificationType.REMINDER]: 'Bell',
      [NotificationType.NEWS]: 'Promotion'
    }
    return icons[type] || 'Bell'
  }

  /**
   * 根据类型获取颜色
   */
  function getColorForType(type) {
    const colors = {
      [NotificationType.ACHIEVEMENT]: '#f56c6c',
      [NotificationType.TASK]: '#67c23a',
      [NotificationType.SYSTEM]: '#409eff',
      [NotificationType.TUTORIAL]: '#e6a23c',
      [NotificationType.REMINDER]: '#909399',
      [NotificationType.NEWS]: '#9933ff'
    }
    return colors[type] || '#409eff'
  }

  /**
   * 成就解锁通知特殊处理
   */
  function triggerAchievementNotification(notification) {
    // 这里可以触发声音或其他效果
    if (notificationSettings.value.soundEnabled) {
      playAchievementSound()
    }
  }

  /**
   * 播放成就音效
   */
  function playAchievementSound() {
    try {
      // 使用 Web Audio API 播放简短音效
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2)

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      // 忽略音频播放失败
    }
  }

  /**
   * 标记通知为已读
   */
  function markAsRead(notificationId) {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification && !notification.read) {
      notification.read = true
      notification.readAt = Date.now()
      updateStats()
      saveToLocalStorage()
    }
  }

  /**
   * 标记所有通知为已读
   */
  function markAllAsRead() {
    const now = Date.now()
    notifications.value.forEach(n => {
      if (!n.read) {
        n.read = true
        n.readAt = now
      }
    })
    updateStats()
    saveToLocalStorage()
    Logger.info(LOG_LABEL, '标记所有通知为已读')
  }

  /**
   * 删除通知
   */
  function removeNotification(notificationId) {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index > -1) {
      notifications.value.splice(index, 1)
      updateStats()
      saveToLocalStorage()
    }
  }

  /**
   * 清空所有通知
   */
  function clearAllNotifications() {
    notifications.value = []
    updateStats()
    saveToLocalStorage()
    Logger.info(LOG_LABEL, '清空所有通知')
  }

  /**
   * 清空指定类型的通知
   */
  function clearByType(type) {
    notifications.value = notifications.value.filter(n => n.type !== type)
    updateStats()
    saveToLocalStorage()
  }

  /**
   * 更新统计
   */
  function updateStats() {
    stats.value.totalCount = notifications.value.length
    stats.value.unreadCount = notifications.value.filter(n => !n.read).length
  }

  /**
   * 更新通知设置
   */
  function updateSettings(newSettings) {
    notificationSettings.value = {
      ...notificationSettings.value,
      ...newSettings
    }
    saveSettingsToLocalStorage()
  }

  /**
   * 重置通知设置
   */
  function resetSettings() {
    notificationSettings.value = {
      achievementEnabled: true,
      taskEnabled: true,
      systemEnabled: true,
      tutorialEnabled: true,
      reminderEnabled: true,
      newsEnabled: false,
      soundEnabled: true,
      showBadge: true
    }
    saveSettingsToLocalStorage()
  }

  /**
   * 成就解锁通知
   */
  function notifyAchievement(achievement) {
    if (!notificationSettings.value.achievementEnabled) return null

    return addNotification({
      title: '成就解锁',
      content: `${achievement.icon || ''} ${achievement.title} - ${achievement.description || '恭喜获得新成就！'}`,
      type: NotificationType.ACHIEVEMENT,
      icon: 'Trophy',
      color: '#f56c6c',
      data: achievement
    })
  }

  /**
   * 任务完成通知
   */
  function notifyTaskComplete(task) {
    if (!notificationSettings.value.taskEnabled) return null

    return addNotification({
      title: '任务完成',
      content: `已完成任务：${task.title || '未知任务'}`,
      type: NotificationType.TASK,
      icon: 'Check',
      color: '#67c23a',
      data: task
    })
  }

  /**
   * 教程完成通知
   */
  function notifyTutorialComplete(tutorialName) {
    if (!notificationSettings.value.tutorialEnabled) return null

    return addNotification({
      title: '教程完成',
      content: `恭喜完成「${tutorialName || '新手教程'}」！`,
      type: NotificationType.TUTORIAL,
      icon: 'MagicStick',
      color: '#e6a23c'
    })
  }

  /**
   * 系统通知
   */
  function notifySystem(title, content) {
    if (!notificationSettings.value.systemEnabled) return null

    return addNotification({
      title,
      content,
      type: NotificationType.SYSTEM,
      icon: 'Setting',
      color: '#409eff'
    })
  }

  /**
   * 学习提醒
   */
  function notifyReminder(message) {
    if (!notificationSettings.value.reminderEnabled) return null

    return addNotification({
      title: '学习提醒',
      content: message,
      type: NotificationType.REMINDER,
      icon: 'Bell',
      color: '#909399'
    })
  }

  /**
   * 保存通知到本地存储
   */
  function saveToLocalStorage() {
    try {
      const data = {
        notifications: notifications.value,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      Logger.error(LOG_LABEL, '保存通知失败:', error)
    }
  }

  /**
   * 保存设置到本地存储
   */
  function saveSettingsToLocalStorage() {
    try {
      localStorage.setItem(`${STORAGE_KEY}-settings`, JSON.stringify(notificationSettings.value))
    } catch (error) {
      Logger.error(LOG_LABEL, '保存通知设置失败:', error)
    }
  }

  /**
   * 从本地存储加载
   */
  function loadFromLocalStorage() {
    try {
      // 加载通知
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        notifications.value = data.notifications || []
      }

      // 加载设置
      const savedSettings = localStorage.getItem(`${STORAGE_KEY}-settings`)
      if (savedSettings) {
        notificationSettings.value = {
          ...notificationSettings.value,
          ...JSON.parse(savedSettings)
        }
      }

      updateStats()
    } catch (error) {
      Logger.error(LOG_LABEL, '加载通知失败:', error)
    }
  }

  /**
   * 导出通知数据
   */
  function exportData() {
    return {
      notifications: notifications.value,
      settings: notificationSettings.value,
      exportedAt: new Date().toISOString()
    }
  }

  /**
   * 导入通知数据
   */
  function importData(data) {
    if (!data) return false

    try {
      if (data.notifications) {
        notifications.value = data.notifications
      }
      if (data.settings) {
        notificationSettings.value = {
          ...notificationSettings.value,
          ...data.settings
        }
      }
      updateStats()
      saveToLocalStorage()
      saveSettingsToLocalStorage()
      return true
    } catch (error) {
      Logger.error(LOG_LABEL, '导入通知数据失败:', error)
      return false
    }
  }

  // 初始化时加载
  loadFromLocalStorage()

  return {
    // 状态
    notifications,
    notificationSettings,
    stats,

    // 计算属性
    unreadNotifications,
    unreadCount,
    notificationsByType,
    recentNotifications,
    showBadge,

    // 方法
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    clearByType,
    updateSettings,
    resetSettings,
    notifyAchievement,
    notifyTaskComplete,
    notifyTutorialComplete,
    notifySystem,
    notifyReminder,
    saveToLocalStorage,
    loadFromLocalStorage,
    exportData,
    importData
  }
})
