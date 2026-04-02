/**
 * 用户偏好 Store
 * 管理主题、语言、显示设置等用户偏好
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'aero-hand-preferences'

export const usePreferencesStore = defineStore('preferences', () => {
  // ========== 状态 ==========

  // 主题
  const isDarkMode = ref(false)

  // 紧凑模式
  const isCompactMode = ref(false)

  // 侧边栏折叠
  const isSidebarCollapsed = ref(false)

  // 语言
  const locale = ref('zh-CN')

  // 动画效果
  const animationsEnabled = ref(true)

  // 每页显示条数
  const pageSize = ref(20)

  // 最后活动 timestamp
  const lastActivity = ref(Date.now())

  // 主题过渡是否在进行中
  const isThemeTransitioning = ref(false)

  // 存储版本（用于迁移）
  const storageVersion = ref(1)

  // ========== 计算属性 ==========

  const theme = computed(() => isDarkMode.value ? 'dark' : 'light')

  const themeClass = computed(() => isDarkMode.value ? 'dark-theme' : 'light-theme')

  // ========== 方法 ==========

  /**
   * 切换主题 - 带平滑过渡
   */
  function toggleTheme() {
    isDarkMode.value = !isDarkMode.value
    applyTheme(true)
    saveToLocalStorage()
  }

  /**
   * 设置深色模式
   */
  function setDarkMode(value) {
    if (isDarkMode.value === value) return
    isDarkMode.value = value
    applyTheme(true)
    saveToLocalStorage()
  }

  /**
   * 应用主题到 DOM
   * @param {boolean} withTransition - 是否带过渡动画
   */
  function applyTheme(withTransition = false) {
    if (withTransition) {
      isThemeTransitioning.value = true
      // 添加过渡类
      document.documentElement.classList.add('theme-transitioning')
    }

    if (isDarkMode.value) {
      document.documentElement.classList.add('dark-mode')
      document.documentElement.classList.remove('light-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
      document.documentElement.classList.add('light-mode')
    }

    // 移除过渡状态
    if (withTransition) {
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning')
        isThemeTransitioning.value = false
      }, 300)
    }
  }

  /**
   * 切换紧凑模式
   */
  function toggleCompactMode() {
    isCompactMode.value = !isCompactMode.value
    saveToLocalStorage()
  }

  /**
   * 切换侧边栏
   */
  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
    saveToLocalStorage()
  }

  /**
   * 更新语言
   */
  function setLocale(newLocale) {
    locale.value = newLocale
    saveToLocalStorage()
  }

  /**
   * 切换动画
   */
  function toggleAnimations() {
    animationsEnabled.value = !animationsEnabled.value
    applyAnimations()
    saveToLocalStorage()
  }

  /**
   * 应用动画设置
   */
  function applyAnimations() {
    if (animationsEnabled.value) {
      document.documentElement.classList.remove('animations-disabled')
    } else {
      document.documentElement.classList.add('animations-disabled')
    }
  }

  /**
   * 更新活动状态
   */
  function updateActivity() {
    lastActivity.value = Date.now()
  }

  /**
   * 保存到本地存储
   */
  function saveToLocalStorage() {
    try {
      const preferences = {
        version: storageVersion.value,
        isDarkMode: isDarkMode.value,
        isCompactMode: isCompactMode.value,
        isSidebarCollapsed: isSidebarCollapsed.value,
        locale: locale.value,
        animationsEnabled: animationsEnabled.value,
        pageSize: pageSize.value,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    } catch (error) {
      console.error('保存偏好设置失败:', error)
    }
  }

  /**
   * 从本地存储加载
   */
  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const preferences = JSON.parse(saved)

        // 版本迁移检查
        const version = preferences.version || 0
        if (version < storageVersion.value) {
          // 执行迁移
          migratePreferences(preferences, version)
        } else {
          // 直接加载
          isDarkMode.value = preferences.isDarkMode ?? false
          isCompactMode.value = preferences.isCompactMode ?? false
          isSidebarCollapsed.value = preferences.isSidebarCollapsed ?? false
          locale.value = preferences.locale ?? 'zh-CN'
          animationsEnabled.value = preferences.animationsEnabled ?? true
          pageSize.value = preferences.pageSize ?? 20
        }

        applyTheme()
        applyAnimations()
      } else {
        // 默认设置
        applyTheme()
        applyAnimations()
      }
    } catch (error) {
      console.error('加载偏好设置失败:', error)
      applyTheme()
      applyAnimations()
    }
  }

  /**
   * 迁移旧版本偏好设置
   */
  function migratePreferences(oldPreferences, fromVersion) {
    // 当前版本是1，没有需要迁移的内容，为未来迁移预留
    isDarkMode.value = oldPreferences.isDarkMode ?? false
    isCompactMode.value = oldPreferences.isCompactMode ?? false
    isSidebarCollapsed.value = oldPreferences.isSidebarCollapsed ?? false
    locale.value = oldPreferences.locale ?? 'zh-CN'
    animationsEnabled.value = oldPreferences.animationsEnabled ?? true
    pageSize.value = oldPreferences.pageSize ?? 20
  }

  /**
   * 重置为默认值
   */
  function resetToDefaults() {
    isDarkMode.value = false
    isCompactMode.value = false
    isSidebarCollapsed.value = false
    locale.value = 'zh-CN'
    animationsEnabled.value = true
    pageSize.value = 20
    applyTheme()
    applyAnimations()
    saveToLocalStorage()
  }

  /**
   * 导出偏好设置
   */
  function exportPreferences() {
    return {
      version: storageVersion.value,
      isDarkMode: isDarkMode.value,
      isCompactMode: isCompactMode.value,
      isSidebarCollapsed: isSidebarCollapsed.value,
      locale: locale.value,
      animationsEnabled: animationsEnabled.value,
      pageSize: pageSize.value,
      exportedAt: new Date().toISOString()
    }
  }

  /**
   * 导入偏好设置
   */
  function importPreferences(data) {
    if (!data) return false

    try {
      isDarkMode.value = data.isDarkMode ?? false
      isCompactMode.value = data.isCompactMode ?? false
      isSidebarCollapsed.value = data.isSidebarCollapsed ?? false
      locale.value = data.locale ?? 'zh-CN'
      animationsEnabled.value = data.animationsEnabled ?? true
      pageSize.value = data.pageSize ?? 20

      applyTheme()
      applyAnimations()
      saveToLocalStorage()
      return true
    } catch (error) {
      console.error('导入偏好设置失败:', error)
      return false
    }
  }

  // 初始化时加载
  loadFromLocalStorage()

  // 监听变化自动保存（防抖）
  let saveTimeout = null
  watch([isDarkMode, isCompactMode, isSidebarCollapsed, locale, animationsEnabled, pageSize], () => {
    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      saveToLocalStorage()
    }, 500)
  }, { deep: true })

  return {
    // 状态
    isDarkMode,
    isCompactMode,
    isSidebarCollapsed,
    locale,
    animationsEnabled,
    pageSize,
    lastActivity,
    isThemeTransitioning,
    storageVersion,

    // 计算属性
    theme,
    themeClass,

    // 方法
    toggleTheme,
    setDarkMode,
    toggleCompactMode,
    toggleSidebar,
    setLocale,
    toggleAnimations,
    updateActivity,
    applyTheme,
    applyAnimations,
    saveToLocalStorage,
    loadFromLocalStorage,
    resetToDefaults,
    exportPreferences,
    importPreferences
  }
})
