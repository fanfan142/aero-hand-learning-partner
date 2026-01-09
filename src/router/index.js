import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import KnowledgeBase from '@/views/KnowledgeBase.vue'
import HardwareChecklist from '@/views/HardwareChecklist.vue'
import OfficialDocs from '@/views/OfficialDocs.vue'
import ProjectStructure from '@/views/ProjectStructure.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '学习进度' }
  },
  {
    path: '/knowledge',
    name: 'KnowledgeBase',
    component: KnowledgeBase,
    meta: { title: '知识库' }
  },
  {
    path: '/hardware',
    name: 'HardwareChecklist',
    component: HardwareChecklist,
    meta: { title: '硬件清单' }
  },
  {
    path: '/docs',
    name: 'OfficialDocs',
    component: OfficialDocs,
    meta: { title: '官方文档' }
  },
  {
    path: '/structure',
    name: 'ProjectStructure',
    component: ProjectStructure,
    meta: { title: '项目结构' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
