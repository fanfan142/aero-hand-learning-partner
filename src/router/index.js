import { createRouter, createWebHistory } from 'vue-router'
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

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: Welcome,
    meta: { title: '首页' }
  },
  {
    path: '/learning',
    name: 'Learning',
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
  },
  {
    path: '/mindmap',
    name: 'MindMap',
    component: MindMap,
    meta: { title: '知识图谱' }
  },
  {
    path: '/techdocs',
    name: 'TechDocs',
    component: TechDocs,
    meta: { title: '技术文档' }
  },
  {
    path: '/joint-mapping',
    name: 'JointMapping',
    component: JointMapping,
    meta: { title: '关节映射可视化' }
  },
  {
    path: '/flows/:flowId?',
    name: 'FlowViewer',
    component: FlowViewer,
    meta: { title: '技术流程可视化' }
  },
  {
    path: '/bookmarks',
    name: 'Bookmarks',
    component: Bookmarks,
    meta: { title: '我的收藏' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
