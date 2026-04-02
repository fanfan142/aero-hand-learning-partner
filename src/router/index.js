import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

// 视图组件
import Welcome from '@/views/Welcome.vue'
import Home from '@/views/Home.vue'
import KnowledgeBase from '@/views/KnowledgeBase.vue'
import HardwareChecklist from '@/views/HardwareChecklist.vue'
import OfficialDocs from '@/views/OfficialDocs.vue'
import ProjectStructure from '@/views/ProjectStructure.vue'
import MindMap from '@/views/MindMap.vue'
import TechDocs from '@/views/TechDocs.vue'
import JointMapping from '@/views/JointMapping.vue'
import FlowViewer from '@/views/FlowViewer.vue'
import Bookmarks from '@/views/Bookmarks.vue'
import Statistics from '@/views/Statistics.vue'
import Dashboard from '@/views/Dashboard.vue'
import Settings from '@/views/Settings.vue'
import NotFound from '@/views/NotFound.vue'

// 路由定义
const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: Welcome,
    meta: {
      title: '首页',
      icon: 'House',
      breadcrumb: ['首页']
    }
  },
  {
    path: '/learning',
    name: 'Learning',
    component: Home,
    meta: {
      title: '学习进度',
      icon: 'Odometer',
      breadcrumb: ['首页', '学习进度'],
      requiresAuth: true
    }
  },
  {
    path: '/knowledge',
    name: 'KnowledgeBase',
    component: KnowledgeBase,
    meta: {
      title: '知识库',
      icon: 'Reading',
      breadcrumb: ['首页', '知识库']
    }
  },
  {
    path: '/hardware',
    name: 'HardwareChecklist',
    component: HardwareChecklist,
    meta: {
      title: '硬件清单',
      icon: 'Box',
      breadcrumb: ['首页', '硬件清单']
    }
  },
  {
    path: '/docs',
    name: 'OfficialDocs',
    component: OfficialDocs,
    meta: {
      title: '官方文档',
      icon: 'Document',
      breadcrumb: ['首页', '官方文档']
    }
  },
  {
    path: '/structure',
    name: 'ProjectStructure',
    component: ProjectStructure,
    meta: {
      title: '项目结构',
      icon: 'Files',
      breadcrumb: ['首页', '项目结构']
    }
  },
  {
    path: '/mindmap',
    name: 'MindMap',
    component: MindMap,
    meta: {
      title: '知识图谱',
      icon: 'Share',
      breadcrumb: ['首页', '知识图谱']
    }
  },
  {
    path: '/techdocs',
    name: 'TechDocs',
    component: TechDocs,
    meta: {
      title: '技术文档',
      icon: 'Notebook',
      breadcrumb: ['首页', '技术文档']
    }
  },
  {
    path: '/joint-mapping',
    name: 'JointMapping',
    component: JointMapping,
    meta: {
      title: '关节映射可视化',
      icon: 'Operation',
      breadcrumb: ['首页', '关节映射']
    }
  },
  {
    path: '/flows/:flowId?',
    name: 'FlowViewer',
    component: FlowViewer,
    meta: {
      title: '技术流程可视化',
      icon: 'Connection',
      breadcrumb: ['首页', '技术流程']
    }
  },
  {
    path: '/bookmarks',
    name: 'Bookmarks',
    component: Bookmarks,
    meta: {
      title: '我的收藏',
      icon: 'Star',
      breadcrumb: ['首页', '我的收藏'],
      requiresAuth: true
    }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics,
    meta: {
      title: '学习统计',
      icon: 'DataAnalysis',
      breadcrumb: ['首页', '学习统计'],
      requiresAuth: true
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: '数据看板',
      icon: 'DataLine',
      breadcrumb: ['首页', '数据看板'],
      requiresAuth: true
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      title: '设置',
      icon: 'Setting',
      breadcrumb: ['首页', '设置']
    }
  },
  // 404 页面 - 必须放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面未找到',
      icon: 'Warning',
      breadcrumb: ['首页', '404']
    }
  }
]

// 创建路由实例
const router = createRouter({
  // 根据环境选择历史模式
  // GitHub Pages 使用 hash 模式
  history: (
    import.meta.env.VITE_USE_HASH_ROUTER === 'true' ||
    import.meta.env.BASE_URL !== '/'
  )
    ? createWebHashHistory()
    : createWebHistory(),
  routes,
  // 滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      // 保持之前的滚动位置
      return savedPosition
    } else if (to.hash) {
      // 滚动到锚点
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    } else {
      // 滚动到顶部
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 更新页面标题
  const title = to.meta?.title
  document.title = title ? `${title} - Aero Hand 智能学习伙伴` : 'Aero Hand 智能学习伙伴'

  // 检查是否需要认证（示例代码，可根据需要启用）
  // if (to.meta?.requiresAuth) {
  //   const isAuthenticated = checkAuth()
  //   if (!isAuthenticated) {
  //     next({ name: 'Login', query: { redirect: to.fullPath } })
  //     return
  //   }
  // }

  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 可选：记录访问日志
  // console.log(`路由跳转: ${from.path} -> ${to.path}`)
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
})

export default router
