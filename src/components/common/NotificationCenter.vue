<template>
  <el-drawer
    v-model="drawerVisible"
    title="通知中心"
    direction="rtl"
    :size="drawerSize"
    class="notification-drawer"
  >
    <template #header>
      <div class="notification-header">
        <span class="header-title">
          <el-icon><Bell /></el-icon>
          通知中心
        </span>
        <el-badge
          v-if="unreadCount > 0"
          :value="unreadCount > 99 ? '99+' : unreadCount"
          :max="99"
          class="unread-badge"
        />
      </div>
    </template>

    <div class="notification-content">
      <!-- 通知设置入口 -->
      <div class="notification-settings-row">
        <el-button text @click="showSettings = true">
          <el-icon><Setting /></el-icon>
          通知设置
        </el-button>
        <el-button
          v-if="unreadCount > 0"
          text
          type="primary"
          @click="handleMarkAllAsRead"
        >
          全部已读
        </el-button>
      </div>

      <!-- 通知分类标签 -->
      <el-tabs v-model="activeTab" class="notification-tabs">
        <el-tab-pane label="全部" name="all">
          <template #label>
            <span class="tab-label">
              全部
              <el-badge v-if="unreadCount > 0" :value="unreadCount" :max="99" />
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane
          v-for="category in categories"
          :key="category.key"
          :label="category.label"
          :name="category.key"
        >
          <template #label>
            <span class="tab-label">
              <el-icon><component :is="category.icon" /></el-icon>
              {{ category.label }}
              <el-badge
                v-if="getUnreadCountByType(category.type) > 0"
                :value="getUnreadCountByType(category.type)"
                :max="99"
              />
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 通知列表 -->
      <div class="notification-list" ref="listRef">
        <div v-if="filteredNotifications.length === 0" class="notification-empty">
          <el-empty description="暂无通知" :image-size="80">
            <template #image>
              <el-icon :size="60" color="#c0c4cc"><Bell /></el-icon>
            </template>
          </el-empty>
        </div>

        <transition-group name="notification" tag="div" class="notification-items">
          <div
            v-for="notification in filteredNotifications"
            :key="notification.id"
            :class="['notification-item', { unread: !notification.read }]"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon" :style="{ backgroundColor: notification.color + '20', color: notification.color }">
              <el-icon><component :is="notification.icon || 'Bell'" /></el-icon>
            </div>
            <div class="notification-body">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-content-text">{{ notification.content }}</div>
              <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
            </div>
            <div class="notification-actions">
              <el-button
                v-if="!notification.read"
                text
                size="small"
                type="primary"
                @click.stop="handleMarkAsRead(notification.id)"
              >
                已读
              </el-button>
              <el-button
                text
                size="small"
                type="danger"
                @click.stop="handleRemove(notification.id)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- 通知设置对话框 -->
    <el-dialog
      v-model="showSettings"
      title="通知设置"
      width="400px"
      class="notification-settings-dialog"
    >
      <div class="settings-list">
        <div class="settings-item">
          <div class="settings-item-info">
            <el-icon><Trophy /></el-icon>
            <span>成就通知</span>
          </div>
          <el-switch v-model="settings.achievementEnabled" />
        </div>
        <div class="settings-item">
          <div class="settings-item-info">
            <el-icon><Check /></el-icon>
            <span>任务通知</span>
          </div>
          <el-switch v-model="settings.taskEnabled" />
        </div>
        <div class="settings-item">
          <div class="settings-item-info">
            <el-icon><Setting /></el-icon>
            <span>系统通知</span>
          </div>
          <el-switch v-model="settings.systemEnabled" />
        </div>
        <div class="settings-item">
          <div class="settings-item-info">
            <el-icon><MagicStick /></el-icon>
            <span>教程通知</span>
          </div>
          <el-switch v-model="settings.tutorialEnabled" />
        </div>
        <div class="settings-item">
          <div class="settings-item-info">
            <el-icon><Bell /></el-icon>
            <span>学习提醒</span>
          </div>
          <el-switch v-model="settings.reminderEnabled" />
        </div>
        <el-divider />
        <div class="settings-item">
          <div class="settings-item-info">
            <el-icon><ChatLineSquare /></el-icon>
            <span>声音提醒</span>
          </div>
          <el-switch v-model="settings.soundEnabled" />
        </div>
        <div class="settings-item">
          <div class="settings-item-info">
            <el-icon><CircleCheck /></el-icon>
            <span>显示红点</span>
          </div>
          <el-switch v-model="settings.showBadge" />
        </div>
      </div>
      <template #footer>
        <el-button @click="handleResetSettings">重置</el-button>
        <el-button type="primary" @click="handleSaveSettings">保存</el-button>
      </template>
    </el-dialog>
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useNotificationsStore, NotificationType, NotificationCategory } from '@/stores/notifications'
import {
  Bell, Setting, Delete, Trophy, Check, MagicStick,
  CircleCheck, ChatLineSquare
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const notificationsStore = useNotificationsStore()

// 抽屉可见性
const drawerVisible = ref(false)
const showSettings = ref(false)
const activeTab = ref('all')
const listRef = ref(null)

// 设置表单
const settings = ref({ ...notificationsStore.notificationSettings })

// 分类定义
const categories = computed(() => {
  return Object.entries(NotificationCategory).map(([key, value]) => ({
    key: key.toLowerCase(),
    label: value.label,
    icon: value.icon,
    type: NotificationType[key]
  }))
})

// 计算属性
const unreadCount = computed(() => notificationsStore.unreadCount)

const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') {
    return notificationsStore.notifications
  }

  const typeMap = {
    achievement: NotificationType.ACHIEVEMENT,
    task: NotificationType.TASK,
    system: NotificationType.SYSTEM,
    tutorial: NotificationType.TUTORIAL,
    reminder: NotificationType.REMINDER,
    news: NotificationType.NEWS
  }

  const type = typeMap[activeTab.value]
  return notificationsStore.notifications.filter(n => n.type === type)
})

// 抽屉尺寸
const drawerSize = computed(() => {
  return window.innerWidth < 768 ? '85%' : '400px'
})

// 获取指定类型的未读数量
function getUnreadCountByType(type) {
  return notificationsStore.notifications.filter(n => n.type === type && !n.read).length
}

// 格式化时间
function formatTime(timestamp) {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`

  const date = new Date(timestamp)
  return `${date.getMonth() + 1}-${date.getDate()}`
}

// 处理通知点击
function handleNotificationClick(notification) {
  if (!notification.read) {
    handleMarkAsRead(notification.id)
  }
}

// 标记单条已读
function handleMarkAsRead(id) {
  notificationsStore.markAsRead(id)
}

// 标记全部已读
function handleMarkAllAsRead() {
  notificationsStore.markAllAsRead()
  ElMessage({ message: '已全部标记为已读', type: 'success', duration: 2000 })
}

// 删除通知
function handleRemove(id) {
  notificationsStore.removeNotification(id)
}

// 保存设置
function handleSaveSettings() {
  notificationsStore.updateSettings(settings.value)
  showSettings.value = false
  ElMessage({ message: '通知设置已保存', type: 'success', duration: 2000 })
}

// 重置设置
function handleResetSettings() {
  notificationsStore.resetSettings()
  settings.value = { ...notificationsStore.notificationSettings }
  ElMessage({ message: '通知设置已重置', type: 'info', duration: 2000 })
}

// 监听设置弹窗关闭，同步最新设置
watch(showSettings, (val) => {
  if (val) {
    settings.value = { ...notificationsStore.notificationSettings }
  }
})

// 暴露方法
defineExpose({
  open: () => {
    drawerVisible.value = true
  },
  close: () => {
    drawerVisible.value = false
  },
  isVisible: () => drawerVisible.value
})
</script>

<style scoped>
.notification-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.unread-badge {
  transform: translateY(-2px);
}

.notification-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.notification-settings-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.notification-tabs {
  margin-bottom: 12px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.notification-list {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
}

.notification-empty {
  padding: 60px 20px;
  text-align: center;
}

.notification-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  background: var(--bg-surface);
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid var(--border-color);
}

.notification-item:hover {
  background: var(--bg-hover);
  transform: translateX(-2px);
}

.notification-item.unread {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-color: rgba(102, 126, 234, 0.2);
}

.notification-item.unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--primary-color);
  border-radius: 3px 0 0 3px;
}

.notification-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
  font-size: 18px;
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.notification-content-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
}

.notification-time {
  font-size: 11px;
  color: var(--text-secondary);
}

.notification-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

/* 动画 */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* 设置对话框样式 */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.settings-item-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-primary);
}

/* 抽屉样式覆盖 */
:deep(.notification-drawer .el-drawer__header) {
  padding: 16px 20px;
  margin-bottom: 0;
  border-bottom: 1px solid var(--border-color);
}

:deep(.notification-drawer .el-drawer__body) {
  padding: 0 20px 20px;
}

/* 深色模式适配 */
html.dark-mode .notification-item {
  background: var(--bg-surface);
}

html.dark-mode .notification-item.unread {
  background: linear-gradient(135deg, rgba(143, 164, 240, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}
</style>
