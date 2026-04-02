/**
 * 用户偏好 Store
 * 管理主题、语言、显示设置等用户偏好
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

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

  // ========== 计算属性 ==========

  const theme = computed(() => isDarkMode.value ? 'dark' : 'light')

  const themeClass = computed(() => isDarkMode.value ? 'dark-theme' : 'light-theme')

  // ========== 方法 ==========

  /**
   * 切换主题
   */
  function toggleTheme() {
    isDarkMode.value = !isDarkMode.value
    applyTheme()
    saveToLocalStorage()
  }

  /**
   * 设置深色模式
   */
  function setDarkMode(value) {
    isDarkMode.value = value
    applyTheme()
    saveToLocalStorage()
  }

  /**
   * 应用主题到 DOM
   */
  function applyTheme() {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark-mode')
      document.documentElement.classList.remove('light-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
      document.documentElement.classList.add('light-mode')
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
    saveToLocalStorage()
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
        isDarkMode: isDarkMode.value,
        isCompactMode: isCompactMode.value,
        isSidebarCollapsed: isSidebarCollapsed.value,
        locale: locale.value,
        animationsEnabled: animationsEnabled.value,
        pageSize: pageSize.value
      }
      localStorage.setItem('aero-hand-preferences', JSON.stringify(preferences))
    } catch (error) {
      console.error('保存偏好设置失败:', error)
    }
  }

  /**
   * 从本地存储加载
   */
  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('aero-hand-preferences')
      if (saved) {
        const preferences = JSON.parse(saved)
        isDarkMode.value = preferences.isDarkMode ?? false
        isCompactMode.value = preferences.isCompactMode ?? false
        isSidebarCollapsed.value = preferences.isSidebarCollapsed ?? false
        locale.value = preferences.locale ?? 'zh-CN'
        animationsEnabled.value = preferences.animationsEnabled ?? true
        pageSize.value = preferences.pageSize ?? 20
        applyTheme()
      }
    } catch (error) {
      console.error('加载偏好设置失败:', error)
    }
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
    saveToLocalStorage()
  }

  // 初始化时加载
  loadFromLocalStorage()

  // 监听变化自动保存
  watch([isDarkMode, isCompactMode, isSidebarCollapsed, locale, animationsEnabled, pageSize], () => {
    saveToLocalStorage()
  })

  return {
    // 状态
    isDarkMode,
    isCompactMode,
    isSidebarCollapsed,
    locale,
    animationsEnabled,
    pageSize,
    lastActivity,

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
    saveToLocalStorage,
    loadFromLocalStorage,
    resetToDefaults
  }
})
