<template>
  <div class="settings-page">
    <div class="settings-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">
          <el-icon><Setting /></el-icon>
          设置
        </h1>
        <p class="page-description">个性化你的学习体验</p>
      </div>

      <!-- 设置内容 -->
      <div class="settings-content">
        <!-- 左侧导航 -->
        <div class="settings-nav">
          <div
            v-for="section in sections"
            :key="section.key"
            :class="['nav-item', { active: activeSection === section.key }]"
            @click="activeSection = section.key"
          >
            <el-icon><component :is="section.icon" /></el-icon>
            <span>{{ section.label }}</span>
          </div>
        </div>

        <!-- 右侧内容 -->
        <div class="settings-panel">
          <!-- 主题设置 -->
          <div v-if="activeSection === 'theme'" class="section-panel">
            <div class="section-title">
              <el-icon><Sunny /></el-icon>
              主题设置
            </div>
            <div class="section-description">选择你喜欢的界面外观</div>

            <div class="theme-options">
              <div
                v-for="theme in themeOptions"
                :key="theme.value"
                :class="['theme-card', { active: currentTheme === theme.value }]"
                @click="handleThemeChange(theme.value)"
              >
                <div class="theme-preview" :class="`theme-${theme.value}`">
                  <div class="preview-header"></div>
                  <div class="preview-body">
                    <div class="preview-sidebar"></div>
                    <div class="preview-content"></div>
                  </div>
                </div>
                <div class="theme-name">{{ theme.label }}</div>
                <el-icon v-if="currentTheme === theme.value" class="theme-check"><Check /></el-icon>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <el-icon><Brush /></el-icon>
                <div>
                  <div class="setting-label">跟随系统</div>
                  <div class="setting-desc">自动匹配系统深色/浅色模式</div>
                </div>
              </div>
              <el-switch v-model="followSystem" @change="handleFollowSystemChange" />
            </div>
          </div>

          <!-- 动画设置 -->
          <div v-if="activeSection === 'animation'" class="section-panel">
            <div class="section-title">
              <el-icon><VideoPlay /></el-icon>
              动画效果
            </div>
            <div class="section-description">控制界面动画和过渡效果</div>

            <div class="setting-item">
              <div class="setting-info">
                <el-icon><VideoPlay /></el-icon>
                <div>
                  <div class="setting-label">启用动画</div>
                  <div class="setting-desc">页面切换和元素过渡动画</div>
                </div>
              </div>
              <el-switch v-model="animationsEnabled" @change="handleAnimationsChange" />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <el-icon><Grid /></el-icon>
                <div>
                  <div class="setting-label">简化模式</div>
                  <div class="setting-desc">减少视觉元素，提升性能</div>
                </div>
              </div>
              <el-switch v-model="compactMode" @change="handleCompactModeChange" />
            </div>
          </div>

          <!-- 通知设置 -->
          <div v-if="activeSection === 'notification'" class="section-panel">
            <div class="section-title">
              <el-icon><Bell /></el-icon>
              通知设置
            </div>
            <div class="section-description">管理你希望接收的通知类型</div>

            <div class="setting-item">
              <div class="setting-info">
                <el-icon><Trophy /></el-icon>
                <div>
                  <div class="setting-label">成就解锁</div>
                  <div class="setting-desc">获得新成就时的通知</div>
                </div>
              </div>
              <el-switch v-model="notificationSettings.achievementEnabled" @change="saveNotificationSettings" />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <el-icon><Check /></el-icon>
                <div>
                  <div class="setting-label">任务完成</div>
                  <div class="setting-desc">完成任务时的通知</div>
                </div>
              </div>
              <el-switch v-model="notificationSettings.taskEnabled" @change="saveNotificationSettings" />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <el-icon><Setting /></el-icon>
                <div>
                  <div class="setting-label">系统通知</div>
                  <div class="setting-desc">系统更新和维护通知</div>
                </div>
              </div>
              <el-switch v-model="notificationSettings.systemEnabled" @change="saveNotificationSettings" />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <el-icon><MagicStick /></el-icon>
                <div>
                  <div class="setting-label">教程通知</div>
                  <div class="setting-desc">教程完成和提示通知</div>
                </div>
              </div>
              <el-switch v-model="notificationSettings.tutorialEnabled" @change="saveNotificationSettings" />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <el-icon><Bell /></el-icon>
                <div>
                  <div class="setting-label">学习提醒</div>
                  <div class="setting-desc">定时学习提醒通知</div>
                </div>
              </div>
              <el-switch v-model="notificationSettings.reminderEnabled" @change="saveNotificationSettings" />
            </div>

            <el-divider />

            <div class="setting-item">
              <div class="setting-info">
                <el-icon><Speaker /></el-icon>
                <div>
                  <div class="setting-label">声音提醒</div>
                  <div class="setting-desc">通知时播放提示音</div>
                </div>
              </div>
              <el-switch v-model="notificationSettings.soundEnabled" @change="saveNotificationSettings" />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <el-icon><CircleCheck /></el-icon>
                <div>
                  <div class="setting-label">显示红点</div>
                  <div class="setting-desc">未读通知时显示红点标记</div>
                </div>
              </div>
              <el-switch v-model="notificationSettings.showBadge" @change="saveNotificationSettings" />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <el-icon><Delete /></el-icon>
                <div>
                  <div class="setting-label">清空通知</div>
                  <div class="setting-desc">删除所有通知记录</div>
                </div>
              </div>
              <el-button type="danger" text @click="handleClearNotifications">清空</el-button>
            </div>
          </div>

          <!-- 语言设置 -->
          <div v-if="activeSection === 'language'" class="section-panel">
            <div class="section-title">
              <el-icon><Translate /></el-icon>
              语言设置
            </div>
            <div class="section-description">选择界面显示语言（预留功能）</div>

            <div class="language-options">
              <div
                v-for="lang in languageOptions"
                :key="lang.value"
                :class="['language-card', { active: currentLocale === lang.value, disabled: !lang.available }]"
                @click="lang.available && handleLocaleChange(lang.value)"
              >
                <div class="language-flag">{{ lang.flag }}</div>
                <div class="language-name">{{ lang.label }}</div>
                <div v-if="!lang.available" class="language-soon">即将推出</div>
                <el-icon v-if="currentLocale === lang.value && lang.available" class="language-check"><Check /></el-icon>
              </div>
            </div>
          </div>

          <!-- 数据管理 -->
          <div v-if="activeSection === 'data'" class="section-panel">
            <div class="section-title">
              <el-icon><Folder /></el-icon>
              数据管理
            </div>
            <div class="section-description">导入导出你的设置和进度</div>

            <div class="setting-item">
              <div class="setting-info">
                <el-icon><Download /></el-icon>
                <div>
                  <div class="setting-label">导出设置</div>
                  <div class="setting-desc">下载你的所有设置和偏好</div>
                </div>
              </div>
              <el-button type="primary" @click="handleExportSettings">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <el-icon><Upload /></el-icon>
                <div>
                  <div class="setting-label">导入设置</div>
                  <div class="setting-desc">从文件恢复你的设置</div>
                </div>
              </div>
              <el-button @click="triggerImport">
                <el-icon><Upload /></el-icon>
                导入
              </el-button>
              <input
                ref="importInputRef"
                type="file"
                accept=".json"
                style="display: none"
                @change="handleImportSettings"
              />
            </div>

            <el-divider />

            <div class="danger-zone">
              <div class="danger-title">
                <el-icon><Warning /></el-icon>
                危险区域
              </div>
              <div class="setting-item danger">
                <div class="setting-info">
                  <el-icon><RefreshLeft /></el-icon>
                  <div>
                    <div class="setting-label">重置所有设置</div>
                    <div class="setting-desc">恢复所有设置为默认值</div>
                  </div>
                </div>
                <el-button type="danger" @click="handleResetAllSettings">重置</el-button>
              </div>
            </div>
          </div>

          <!-- 关于页面 -->
          <div v-if="activeSection === 'about'" class="section-panel">
            <div class="section-title">
              <el-icon><InfoFilled /></el-icon>
              关于
            </div>

            <div class="about-card">
              <div class="about-logo">
                <el-icon :size="60"><MagicStick /></el-icon>
              </div>
              <h2 class="about-name">Aero Hand 智能学习伙伴</h2>
              <p class="about-version">版本 1.0.0</p>
              <p class="about-desc">
                一个开源、肌腱驱动的灵巧机械手学习平台。
                由 TetherIA 设计开发，专注于简单性、可靠性和可访问性。
              </p>
            </div>

            <div class="about-links">
              <div class="link-item">
                <span class="link-label">官方网站</span>
                <a href="#" class="link-value">aero-hand.com</a>
              </div>
              <div class="link-item">
                <span class="link-label">GitHub</span>
                <a href="#" class="link-value">github.com/tetheria/aero-hand-open</a>
              </div>
              <div class="link-item">
                <span class="link-label">文档</span>
                <a href="#" class="link-value">docs.aero-hand.com</a>
              </div>
            </div>

            <div class="about-tech">
              <div class="tech-title">技术栈</div>
              <div class="tech-tags">
                <el-tag v-for="tech in techStack" :key="tech" type="info">{{ tech }}</el-tag>
              </div>
            </div>

            <div class="about-license">
              <el-icon><Document /></el-icon>
              <div>
                <div class="license-title">许可证</div>
                <div class="license-text">
                  软件：Apache-2.0 | 设计文件：CC BY-NC-SA 4.0
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { usePreferencesStore } from '@/stores/preferences'
import { useNotificationsStore } from '@/stores/notifications'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting, Sunny, Moon, VideoPlay, Bell, Translate,
  Folder, Download, Upload, RefreshLeft, Warning,
  InfoFilled, Check, Brush, Grid, CircleCheck,
  Delete, Trophy, MagicStick, Document
} from '@element-plus/icons-vue'

const preferencesStore = usePreferencesStore()
const notificationsStore = useNotificationsStore()

// 当前激活的设置分区
const activeSection = ref('theme')

// 导入文件输入引用
const importInputRef = ref(null)

// 设置分区定义
const sections = [
  { key: 'theme', label: '主题', icon: Sunny },
  { key: 'animation', label: '动画', icon: VideoPlay },
  { key: 'notification', label: '通知', icon: Bell },
  { key: 'language', label: '语言', icon: Translate },
  { key: 'data', label: '数据', icon: Folder },
  { key: 'about', label: '关于', icon: InfoFilled }
]

// 主题选项
const themeOptions = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'auto', label: '自动' }
]

// 语言选项
const languageOptions = [
  { value: 'zh-CN', label: '简体中文', flag: '🇨🇳', available: true },
  { value: 'en-US', label: 'English', flag: '🇺🇸', available: false },
  { value: 'ja-JP', label: '日本語', flag: '🇯🇵', available: false }
]

// 技术栈
const techStack = ['Vue 3', 'Element Plus', 'Pinia', 'Vue Router', 'Vite']

// 状态
const followSystem = ref(false)
const animationsEnabled = ref(true)
const compactMode = ref(false)
const currentLocale = ref('zh-CN')
const notificationSettings = reactive({ ...notificationsStore.notificationSettings })

// 计算属性
const currentTheme = computed(() => {
  if (followSystem.value) return 'auto'
  return preferencesStore.isDarkMode ? 'dark' : 'light'
})

// 处理主题变更
function handleThemeChange(theme) {
  if (theme === 'auto') {
    followSystem.value = true
    handleFollowSystemChange()
  } else {
    followSystem.value = false
    preferencesStore.setDarkMode(theme === 'dark')
    ElMessage({
      message: theme === 'dark' ? '已切换到深色模式' : '已切换到浅色模式',
      type: 'success',
      duration: 2000
    })
  }
}

// 处理跟随系统变更
function handleFollowSystemChange() {
  if (followSystem.value) {
    // 检测系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    preferencesStore.setDarkMode(prefersDark)

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (followSystem.value) {
        preferencesStore.setDarkMode(e.matches)
      }
    })

    ElMessage({
      message: '已开启跟随系统主题',
      type: 'success',
      duration: 2000
    })
  }
}

// 处理动画变更
function handleAnimationsChange() {
  preferencesStore.toggleAnimations()
  ElMessage({
    message: animationsEnabled.value ? '已启用动画' : '已禁用动画',
    type: 'success',
    duration: 2000
  })
}

// 处理简化模式变更
function handleCompactModeChange() {
  preferencesStore.toggleCompactMode()
  ElMessage({
    message: compactMode.value ? '已开启简化模式' : '已关闭简化模式',
    type: 'success',
    duration: 2000
  })
}

// 处理语言变更
function handleLocaleChange(locale) {
  currentLocale.value = locale
  preferencesStore.setLocale(locale)
  ElMessage({
    message: '语言设置已更新（预留功能）',
    type: 'success',
    duration: 2000
  })
}

// 保存通知设置
function saveNotificationSettings() {
  notificationsStore.updateSettings(notificationSettings)
  ElMessage({
    message: '通知设置已保存',
    type: 'success',
    duration: 2000
  })
}

// 清空通知
async function handleClearNotifications() {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有通知吗？此操作不可撤销。',
      '清空通知',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    notificationsStore.clearAllNotifications()
    ElMessage({ message: '通知已清空', type: 'success', duration: 2000 })
  } catch {
    // 用户取消
  }
}

// 触发导入
function triggerImport() {
  importInputRef.value?.click()
}

// 导出设置
function handleExportSettings() {
  try {
    const data = {
      preferences: preferencesStore.exportPreferences(),
      notifications: notificationsStore.exportData(),
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aero-hand-settings-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    ElMessage({ message: '设置已导出', type: 'success', duration: 2000 })
  } catch (error) {
    ElMessage({ message: '导出失败', type: 'error', duration: 2000 })
  }
}

// 导入设置
async function handleImportSettings(event) {
  const file = event.target.files[0]
  if (!file) return

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    if (data.preferences) {
      preferencesStore.importPreferences(data.preferences)
    }
    if (data.notifications) {
      notificationsStore.importData(data.notifications)
    }

    // 刷新本地状态
    Object.assign(notificationSettings, notificationsStore.notificationSettings)
    animationsEnabled.value = preferencesStore.animationsEnabled
    compactMode.value = preferencesStore.isCompactMode

    ElMessage({ message: '设置已导入', type: 'success', duration: 2000 })
  } catch (error) {
    ElMessage({ message: '导入失败：文件格式错误', type: 'error', duration: 2000 })
  }

  // 清空 input
  event.target.value = ''
}

// 重置所有设置
async function handleResetAllSettings() {
  try {
    await ElMessageBox.confirm(
      '确定要重置所有设置吗？你的学习进度和成就不会被删除，但所有偏好设置将恢复默认值。',
      '重置设置',
      {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    preferencesStore.resetToDefaults()
    notificationsStore.resetSettings()

    // 刷新本地状态
    Object.assign(notificationSettings, notificationsStore.notificationSettings)
    animationsEnabled.value = preferencesStore.animationsEnabled
    compactMode.value = preferencesStore.isCompactMode

    ElMessage({ message: '所有设置已重置', type: 'success', duration: 2000 })
  } catch {
    // 用户取消
  }
}

// 初始化状态
onMounted(() => {
  animationsEnabled.value = preferencesStore.animationsEnabled
  compactMode.value = preferencesStore.isCompactMode
  Object.assign(notificationSettings, notificationsStore.notificationSettings)
})
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: var(--bg-base);
  padding: 24px;
}

.settings-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.page-description {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

.settings-content {
  display: flex;
  gap: 24px;
}

/* 左侧导航 */
.settings-nav {
  width: 200px;
  flex-shrink: 0;
  background: var(--bg-surface);
  border-radius: 12px;
  padding: 12px;
  box-shadow: var(--card-shadow);
  height: fit-content;
  position: sticky;
  top: 24px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-regular);
  font-size: 14px;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: var(--primary-color);
  font-weight: 600;
}

/* 右侧面板 */
.settings-panel {
  flex: 1;
  min-width: 0;
}

.section-panel {
  background: var(--bg-surface);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--card-shadow);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.section-description {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 24px;
  padding-left: 34px;
}

/* 主题选项 */
.theme-options {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.theme-card {
  flex: 1;
  padding: 16px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
}

.theme-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.theme-card.active {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.theme-preview {
  height: 80px;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
  position: relative;
}

.theme-preview.theme-light {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
}

.theme-preview.theme-dark {
  background: linear-gradient(180deg, #4a4a6a 0%, #5a4a7a 100%);
}

.theme-preview.theme-auto {
  background: linear-gradient(135deg, #667eea 0%, #4a4a6a 100%);
}

.preview-header {
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
}

.preview-body {
  display: flex;
  height: calc(100% - 20px);
}

.preview-sidebar {
  width: 30%;
  background: rgba(255, 255, 255, 0.1);
}

.preview-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
}

.theme-dark .preview-content {
  background: rgba(0, 0, 0, 0.3);
}

.theme-name {
  text-align: center;
  font-size: 13px;
  color: var(--text-primary);
}

.theme-check {
  position: absolute;
  top: 8px;
  right: 8px;
  color: var(--primary-color);
  font-size: 18px;
}

/* 设置项 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.setting-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

/* 语言选项 */
.language-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.language-card {
  padding: 20px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
}

.language-card:hover:not(.disabled) {
  border-color: var(--primary-color);
}

.language-card.active {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.language-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.language-flag {
  font-size: 32px;
  margin-bottom: 8px;
}

.language-name {
  font-size: 14px;
  color: var(--text-primary);
}

.language-soon {
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.language-check {
  position: absolute;
  top: 8px;
  right: 8px;
  color: var(--primary-color);
}

/* 危险区域 */
.danger-zone {
  margin-top: 24px;
  padding: 16px;
  border: 1px solid var(--danger-color);
  border-radius: 8px;
  background: rgba(245, 108, 108, 0.05);
}

.danger-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--danger-color);
  font-weight: 600;
  margin-bottom: 16px;
}

.setting-item.danger {
  border-bottom: none;
  padding: 12px 0;
}

/* 关于页面 */
.about-card {
  text-align: center;
  padding: 32px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 12px;
  margin-bottom: 24px;
}

.about-logo {
  width: 100px;
  height: 100px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.about-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.about-version {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 16px 0;
}

.about-desc {
  font-size: 14px;
  color: var(--text-regular);
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto;
}

.about-links {
  margin-bottom: 24px;
}

.link-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.link-label {
  color: var(--text-secondary);
  font-size: 14px;
}

.link-value {
  color: var(--primary-color);
  font-size: 14px;
  text-decoration: none;
}

.link-value:hover {
  text-decoration: underline;
}

.about-tech {
  margin-bottom: 24px;
}

.tech-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.about-license {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: var(--bg-hover);
  border-radius: 8px;
  color: var(--text-secondary);
}

.license-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.license-text {
  font-size: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  .settings-content {
    flex-direction: column;
  }

  .settings-nav {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    position: static;
  }

  .nav-item {
    flex: 1;
    min-width: 100px;
    justify-content: center;
  }

  .theme-options {
    flex-direction: column;
  }

  .language-options {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
