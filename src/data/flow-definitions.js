/**
 * 技术流程定义数据
 * 定义各种技术流程的节点和边
 */

/**
 * 线性流程图：关节-舵机-脉冲映射
 */
export const jointMappingFlow = {
  id: 'joint-mapping',
  name: '关节映射流程',
  nameEn: 'Joint Mapping Flow',
  description: '从用户指令到舵机运动的完整数据流',
  type: 'linear',
  direction: 'TB', // top to bottom
  nodes: [
    {
      id: 'user-input',
      label: '用户指令',
      description: '0-100% 的位置指令',
      type: 'input',
      data: { range: '0-100%', unit: '%' }
    },
    {
      id: 'sdk-api',
      label: 'SDK API',
      description: '位置百分比接口',
      type: 'process',
      data: { method: 'setJointPosition(id, percent)' }
    },
    {
      id: 'endpoint-transform',
      label: '端点转换',
      description: 'grasp_count/extend_count 转换',
      type: 'process',
      data: { formula: 'pulse = grasp + percent * (extend - grasp)' }
    },
    {
      id: 'pulse-count',
      label: '脉冲数量',
      description: '0-4095 PWM 脉冲',
      type: 'process',
      data: { range: '0-4095', unit: 'pulse' }
    },
    {
      id: 'serial-protocol',
      label: '串口协议帧',
      description: '16 字节固定帧格式',
      type: 'process',
      data: { format: '[0xAA][0x55][id][cmd][data...]' }
    },
    {
      id: 'pwm-signal',
      label: 'PWM 信号',
      description: '脉宽调制信号',
      type: 'process',
      data: { frequency: '50Hz', range: '500-2500μs' }
    },
    {
      id: 'servo-angle',
      label: '舵机角度',
      description: '舵机旋转角度',
      type: 'process',
      data: { range: '0-270°', unit: '°' }
    },
    {
      id: 'joint-angle',
      label: '关节角度',
      description: '实际关节运动角度',
      type: 'output',
      data: { range: '0-150°', unit: '°' }
    }
  ],
  edges: [
    { from: 'user-input', to: 'sdk-api', label: '传递' },
    { from: 'sdk-api', to: 'endpoint-transform', label: '转换' },
    { from: 'endpoint-transform', to: 'pulse-count', label: '计算' },
    { from: 'pulse-count', to: 'serial-protocol', label: '封装' },
    { from: 'serial-protocol', to: 'pwm-signal', label: '发送' },
    { from: 'pwm-signal', to: 'servo-angle', label: '驱动' },
    { from: 'servo-angle', to: 'joint-angle', label: '传动' }
  ]
}

/**
 * 并行泳道图：强化学习训练流程
 */
export const rlTrainingFlow = {
  id: 'rl-training',
  name: '强化学习训练流程',
  nameEn: 'RL Training Flow',
  description: 'Sim2Real 强化学习训练的完整流程',
  type: 'parallel',
  lanes: [
    {
      id: 'env',
      name: '环境配置',
      color: '#3498db'
    },
    {
      id: 'policy',
      name: '策略网络',
      color: '#e74c3c'
    },
    {
      id: 'data',
      name: '数据采集',
      color: '#2ecc71'
    },
    {
      id: 'deployment',
      name: '部署',
      color: '#f39c12'
    }
  ],
  nodes: [
    // 环境配置泳道
    {
      id: 'mujoco-setup',
      lane: 'env',
      label: 'MuJoCo 环境搭建',
      order: 0
    },
    {
      id: 'domain-randomization',
      lane: 'env',
      label: '域随机化',
      order: 1
    },
    {
      id: 'reward-design',
      lane: 'env',
      label: '奖励函数设计',
      order: 2
    },

    // 策略网络泳道
    {
      id: 'network-init',
      lane: 'policy',
      label: '网络初始化',
      order: 0
    },
    {
      id: 'policy-update',
      lane: 'policy',
      label: '策略更新',
      order: 1
    },

    // 数据采集泳道
    {
      id: 'rollout',
      lane: 'data',
      label: '轨迹采集',
      order: 0
    },
    {
      id: 'buffer-storage',
      lane: 'data',
      label: '经验回放缓冲',
      order: 1
    },

    // 部署泳道
    {
      id: 'policy-eval',
      lane: 'deployment',
      label: '策略评估',
      order: 0
    },
    {
      id: 'sim2real',
      lane: 'deployment',
      label: 'Sim2Real 转移',
      order: 1
    }
  ],
  edges: [
    { from: 'mujoco-setup', to: 'domain-randomization', lane: 'env' },
    { from: 'domain-randomization', to: 'reward-design', lane: 'env' },

    { from: 'network-init', to: 'policy-update', lane: 'policy' },

    { from: 'rollout', to: 'buffer-storage', lane: 'data' },

    { from: 'policy-eval', to: 'sim2real', lane: 'deployment' },

    // 跨泳道连接
    { from: 'reward-design', to: 'rollout', crossLane: true },
    { from: 'rollout', to: 'policy-update', crossLane: true },
    { from: 'policy-update', to: 'rollout', crossLane: true },
    { from: 'buffer-storage', to: 'policy-update', crossLane: true },
    { from: 'policy-update', to: 'policy-eval', crossLane: true }
  ]
}

/**
 * 树形配置图：ROS2 配置树
 */
export const ros2ConfigFlow = {
  id: 'ros2-config',
  name: 'ROS2 配置结构',
  nameEn: 'ROS2 Configuration Tree',
  description: 'Aero Hand ROS2 工作空间配置',
  type: 'tree',
  nodes: [
    {
      id: 'workspace',
      label: 'ROS2 工作空间',
      description: 'aero_hand_ws',
      type: 'root',
      children: ['aero-hand', 'dependencies']
    },
    {
      id: 'aero-hand',
      label: 'aero_hand 包',
      description: '主控制包',
      type: 'package',
      parent: 'workspace',
      children: ['nodes', 'topics', 'services', 'actions']
    },
    {
      id: 'dependencies',
      label: '依赖包',
      description: '外部依赖',
      type: 'package',
      parent: 'workspace',
      children: ['sensor-msgs', 'std-msgs', 'geometry-msgs']
    },
    {
      id: 'nodes',
      label: '节点',
      type: 'category',
      parent: 'aero-hand',
      children: ['hand-controller', 'teleop-node', 'state-publisher']
    },
    {
      id: 'topics',
      label: '话题',
      type: 'category',
      parent: 'aero-hand',
      children: ['command-topic', 'state-topic', 'joint-states']
    },
    {
      id: 'services',
      label: '服务',
      type: 'category',
      parent: 'aero-hand',
      children: ['calibrate-service', 'home-service']
    },
    {
      id: 'actions',
      label: '动作',
      type: 'category',
      parent: 'aero-hand',
      children: ['grasp-action', 'sequence-action']
    },
    // 叶子节点
    { id: 'hand-controller', label: 'hand_controller', type: 'leaf', parent: 'nodes' },
    { id: 'teleop-node', label: 'teleop', type: 'leaf', parent: 'nodes' },
    { id: 'state-publisher', label: 'joint_state_publisher', type: 'leaf', parent: 'nodes' },
    { id: 'command-topic', label: '/hand/command', type: 'leaf', parent: 'topics' },
    { id: 'state-topic', label: '/hand/state', type: 'leaf', parent: 'topics' },
    { id: 'joint-states', label: '/joint_states', type: 'leaf', parent: 'topics' },
    { id: 'calibrate-service', label: '/calibrate', type: 'leaf', parent: 'services' },
    { id: 'home-service', label: '/home', type: 'leaf', parent: 'services' },
    { id: 'grasp-action', label: '/grasp', type: 'leaf', parent: 'actions' },
    { id: 'sequence-action', label: '/sequence', type: 'leaf', parent: 'actions' },
    { id: 'sensor-msgs', label: 'sensor_msgs', type: 'leaf', parent: 'dependencies' },
    { id: 'std-msgs', label: 'std_msgs', type: 'leaf', parent: 'dependencies' },
    { id: 'geometry-msgs', label: 'geometry_msgs', type: 'leaf', parent: 'dependencies' }
  ]
}

/**
 * 流程列表
 */
export const flowList = [
  {
    id: 'joint-mapping',
    name: '关节映射流程',
    description: '了解从用户指令到关节运动的完整数据流',
    type: 'linear',
    difficulty: 'beginner',
    duration: '10 分钟',
    icon: 'Connection',
    color: '#3498db'
  },
  {
    id: 'rl-training',
    name: '强化学习训练',
    description: 'Sim2Real 强化学习训练流程',
    type: 'parallel',
    difficulty: 'advanced',
    duration: '25 分钟',
    icon: 'Cpu',
    color: '#e74c3c'
  },
  {
    id: 'ros2-config',
    name: 'ROS2 配置',
    description: 'ROS2 工作空间和节点配置',
    type: 'tree',
    difficulty: 'intermediate',
    duration: '15 分钟',
    icon: 'FolderOpened',
    color: '#2ecc71'
  }
]

/**
 * 获取流程定义
 * @param {string} flowId - 流程ID
 * @returns {Object|null} 流程定义
 */
export function getFlowDefinition(flowId) {
  const flows = {
    'joint-mapping': jointMappingFlow,
    'rl-training': rlTrainingFlow,
    'ros2-config': ros2ConfigFlow
  }
  return flows[flowId] || null
}

export default {
  jointMappingFlow,
  rlTrainingFlow,
  ros2ConfigFlow,
  flowList,
  getFlowDefinition
}
