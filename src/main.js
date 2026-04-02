import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

// 导入所有 stores（确保初始化）
import {
  useConfigStore,
  useNotesStore,
  useTasksStore,
  useBookmarksStore,
  useSearchStore,
  useAIChatStore,
  usePreferencesStore,
  useLearningStore,
  useAchievementsStore,
  useNotificationsStore
} from './stores'

// 导入初始化服务
import { initializeApp } from './services/initialization.js'

const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册 Pinia
app.use(pinia)

// 注册 Router
app.use(router)

// 注册 Element Plus
app.use(ElementPlus)

// 初始化所有 stores（确保它们在应用启动前加载本地存储数据）
const stores = [
  usePreferencesStore(),
  useConfigStore(),
  useNotesStore(),
  useTasksStore(),
  useBookmarksStore(),
  useSearchStore(),
  useAIChatStore(),
  useLearningStore(),
  useAchievementsStore(),
  useNotificationsStore()
]

// 打印 stores 初始化完成（调试用）
console.log('Stores initialized:', stores.length)

// 初始化应用数据（在挂载前完成）
initializeApp().then(status => {
  console.log('[App] 数据初始化状态:', status)
  app.mount('#app')
}).catch(error => {
  console.error('[App] 数据初始化失败:', error)
  // 即使初始化失败也继续挂载应用
  app.mount('#app')
})
