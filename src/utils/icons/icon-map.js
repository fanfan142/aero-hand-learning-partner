/**
 * 图标映射
 * 将字符串名称映射到 Element Plus 图标组件
 */

import {
  Circle,
  SemiCircle,
  Pointer,
  Back,
  RefreshRight,
  Crop,
  CircleChecked,
  Scissor,
  CircleCheck,
  Operation,
  Connection,
  Search,
  Download,
  Upload,
  Edit,
  Delete,
  Memo,
  Star,
  ArrowRight,
  ArrowLeft
} from '@element-plus/icons-vue'

/**
 * 图标映射表
 */
export const iconMap = {
  // 基础图标
  Circle,
  SemiCircle,
  Pointer,
  Back,
  RefreshRight,
  Crop,
  CircleChecked,
  Scissor,
  CircleCheck,
  Operation,
  Connection,
  Search,
  Download,
  Upload,
  Edit,
  Delete,
  Memo,
  Star,
  ArrowRight,
  ArrowLeft,
  
  // 别名
  Open: RefreshRight,
  LittleFinger: Pointer,
  MiddleFinger: Pointer
}

/**
 * 获取图标组件
 * @param {string} iconName - 图标名称
 * @returns {Component|null} 图标组件
 */
export function getIcon(iconName) {
  return iconMap[iconName] || Circle
}

/**
 * 获取所有可用图标名称
 * @returns {Array<string>} 图标名称数组
 */
export function getAvailableIcons() {
  return Object.keys(iconMap)
}

export default iconMap
