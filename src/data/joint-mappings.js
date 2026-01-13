/**
 * 关节映射数据
 * 定义 Aero Hand 的 7 个关节的默认配置参数
 */

export const jointDefinitions = [
  {
    id: 0,
    name: '拇指内收',
    nameEn: 'Thumb Abduction',
    description: '控制拇指的内外展运动',
    servoId: 0,
    maxAngle: 90,
    defaultExtendCount: 3800,
    defaultGraspCount: 1200,
    gearRatio: 1.0,
    color: '#FF6B6B',
    icon: 'Circle'
  },
  {
    id: 1,
    name: '拇指弯曲',
    nameEn: 'Thumb Flexion',
    description: '控制拇指的弯曲运动',
    servoId: 1,
    maxAngle: 90,
    defaultExtendCount: 3800,
    defaultGraspCount: 1200,
    gearRatio: 1.0,
    color: '#4ECDC4',
    icon: 'SemiCircle'
  },
  {
    id: 2,
    name: '食指',
    nameEn: 'Index Finger',
    description: '控制食指的弯曲运动',
    servoId: 2,
    maxAngle: 150,
    defaultExtendCount: 3800,
    defaultGraspCount: 1200,
    gearRatio: 1.0,
    color: '#45B7D1',
    icon: 'Pointer'
  },
  {
    id: 3,
    name: '中指',
    nameEn: 'Middle Finger',
    description: '控制中指的弯曲运动',
    servoId: 3,
    maxAngle: 150,
    defaultExtendCount: 3800,
    defaultGraspCount: 1200,
    gearRatio: 1.0,
    color: '#96CEB4',
    icon: 'MiddleFinger'
  },
  {
    id: 4,
    name: '无名指',
    nameEn: 'Ring Finger',
    description: '控制无名指的弯曲运动',
    servoId: 4,
    maxAngle: 150,
    defaultExtendCount: 3800,
    defaultGraspCount: 1200,
    gearRatio: 1.0,
    color: '#FFEAA7',
    icon: 'Back'
  },
  {
    id: 5,
    name: '小指',
    nameEn: 'Pinky Finger',
    description: '控制小指的弯曲运动',
    servoId: 5,
    maxAngle: 150,
    defaultExtendCount: 3800,
    defaultGraspCount: 1200,
    gearRatio: 1.0,
    color: '#DDA0DD',
    icon: 'LittleFinger'
  },
  {
    id: 6,
    name: '手腕',
    nameEn: 'Wrist',
    description: '控制手腕的屈伸运动',
    servoId: 6,
    maxAngle: 120,
    defaultExtendCount: 3800,
    defaultGraspCount: 1200,
    gearRatio: 1.0,
    color: '#F39C12',
    icon: 'RefreshRight'
  }
]

/**
 * 预设动作配置
 */
export const presetActions = {
  open: {
    name: '张开',
    nameEn: 'Open',
    description: '所有关节完全伸展',
    positions: [0, 0, 0, 0, 0, 0, 0], // 位置百分比 (0-1)
    icon: 'Open'
  },
  halfGrasp: {
    name: '半握',
    nameEn: 'Half Grasp',
    description: '手指半弯曲，拇指保持展开',
    positions: [0.2, 0.2, 0.5, 0.5, 0.5, 0.5, 0],
    icon: 'Crop'
  },
  fullGrasp: {
    name: '握拳',
    nameEn: 'Full Grasp',
    description: '所有手指完全弯曲，拇指对握',
    positions: [0.8, 1, 1, 1, 1, 1, 0.5],
    icon: 'CircleChecked'
  },
  pinch: {
    name: '捏取',
    nameEn: 'Pinch',
    description: '拇指和食指配合捏取',
    positions: [0.9, 0.9, 0.8, 0, 0, 0, 0],
    icon: 'Scissor'
  },
  point: {
    name: '指向',
    nameEn: 'Point',
    description: '食指伸展，其他手指弯曲',
    positions: [0.5, 0.5, 0, 0.8, 0.8, 0.8, 0],
    icon: 'Pointer'
  },
  thumbsUp: {
    name: '点赞',
    nameEn: 'Thumbs Up',
    description: '拇指伸展，其他手指弯曲',
    positions: [0, 0, 1, 1, 1, 1, 0],
    icon: 'CircleCheck'
  }
}

/**
 * 获取关节配置
 * @param {number} jointId - 关节ID
 * @returns {Object|null} 关节配置
 */
export function getJointConfig(jointId) {
  return jointDefinitions.find(j => j.id === jointId) || null
}

/**
 * 获取所有关节ID
 * @returns {Array<number>} 关节ID数组
 */
export function getAllJointIds() {
  return jointDefinitions.map(j => j.id)
}

/**
 * 获取手指关节ID（不包括拇指和手腕）
 * @returns {Array<number>} 手指关节ID数组
 */
export function getFingerJointIds() {
  return [2, 3, 4, 5] // 食指、中指、无名指、小指
}

/**
 * 获取拇指关节ID
 * @returns {Array<number>} 拇指关节ID数组
 */
export function getThumbJointIds() {
  return [0, 1] // 拇指内收、拇指弯曲
}

/**
 * 默认导出
 */
export default {
  jointDefinitions,
  presetActions,
  getJointConfig,
  getAllJointIds,
  getFingerJointIds,
  getThumbJointIds
}
