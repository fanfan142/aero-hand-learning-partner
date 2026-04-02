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
  direction: 'TB',
  nodes: [
    {
      id: 'user-input',
      label: '用户指令',
      description: '0-100% 的位置指令',
      type: 'input',
      data: { range: '0-100%', unit: '%' },
      files: [
        { path: 'sdk/examples/demo.py', functions: ['setJointPosition', 'moveHand'] }
      ]
    },
    {
      id: 'sdk-api',
      label: 'SDK API',
      description: '位置百分比接口',
      type: 'process',
      data: { method: 'setJointPosition(id, percent)' },
      files: [
        { path: 'sdk/src/aero_open_sdk/hand.py', functions: ['set_joint_position', '_send_command'] }
      ]
    },
    {
      id: 'endpoint-transform',
      label: '端点转换',
      description: 'grasp_count/extend_count 转换',
      type: 'process',
      data: { formula: 'pulse = grasp + percent * (extend - grasp)' },
      files: [
        { path: 'sdk/src/aero_open_sdk/hand.py', functions: ['_percent_to_pulse'] }
      ]
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
      data: { format: '[0xAA][0x55][id][cmd][data...]' },
      files: [
        { path: 'firmware/main/Protocol.cpp', functions: ['encodeFrame', 'decodeFrame'] }
      ]
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
 * 控制流：用户→SDK→固件→舵机→手指
 */
export const controlFlow = {
  id: 'control',
  name: '控制流',
  nameEn: 'Control Flow',
  description: '用户指令到手指动作的完整控制链路',
  type: 'control',
  direction: 'TB',
  nodes: [
    {
      id: 'user',
      label: '用户',
      description: '操作人员或控制程序',
      type: 'input',
      data: { role: '指令发起者' },
      files: [
        { path: 'sdk/examples/basic_control.py', functions: ['main', 'send_command'] }
      ]
    },
    {
      id: 'sdk',
      label: 'SDK',
      description: 'Python 控制接口层',
      type: 'process',
      data: { language: 'Python', interface: 'REST/串口' },
      files: [
        { path: 'sdk/src/aero_open_sdk/__init__.py', functions: ['AeroHand', 'connect', 'disconnect'] },
        { path: 'sdk/src/aero_open_sdk/hand.py', functions: ['set_joint_position', 'get_joint_state'] }
      ]
    },
    {
      id: 'protocol',
      label: '通信协议',
      description: '16字节帧格式的串口协议',
      type: 'process',
      data: { format: 'AA 55 [id] [cmd] [data]', speed: '921600 baud' },
      files: [
        { path: 'firmware/main/Protocol.h', functions: ['encode', 'decode', 'validate'] },
        { path: 'firmware/main/Protocol.cpp', functions: ['buildFrame', 'parseFrame'] }
      ]
    },
    {
      id: 'firmware',
      label: '固件',
      description: 'ESP32-S3 固件处理',
      type: 'process',
      data: { platform: 'ESP32-S3', framework: 'Arduino' },
      files: [
        { path: 'firmware/main/HandControl.cpp', functions: ['processCommand', 'updateServos'] },
        { path: 'firmware/main/HandControl.h', functions: ['handlePositionCmd', 'handleReadCmd'] }
      ]
    },
    {
      id: 'servo',
      label: '舵机',
      description: 'Feetech 智能舵机 (STS3215)',
      type: 'process',
      data: { model: 'STS3215', protocol: 'TTL UART' },
      files: [
        { path: 'firmware/main/FeetechServo.cpp', functions: ['setPosition', 'getPosition'] }
      ]
    },
    {
      id: 'finger',
      label: '手指',
      description: '肌腱驱动的手指机构',
      type: 'output',
      data: { drive: 'tendon', dof: '3 per finger' }
    }
  ],
  edges: [
    { from: 'user', to: 'sdk', label: '指令' },
    { from: 'sdk', to: 'protocol', label: 'API调用' },
    { from: 'protocol', to: 'firmware', label: '串口发送' },
    { from: 'firmware', to: 'servo', label: 'PWM/UART' },
    { from: 'servo', to: 'finger', label: '驱动' }
  ]
}

/**
 * 反馈流：手指→舵机→固件→SDK→用户
 */
export const feedbackFlow = {
  id: 'feedback',
  name: '反馈流',
  nameEn: 'Feedback Flow',
  description: '传感器数据回传到用户界面的完整链路',
  type: 'linear',
  direction: 'TB',
  nodes: [
    {
      id: 'sensors',
      label: '传感器',
      description: '关节角度传感器和力传感器',
      type: 'input',
      data: { types: ['角度传感器', '力传感器'] },
      files: [
        { path: 'hardware/PCB/sensor_test.c', functions: ['readAngleSensor', 'readForceSensor'] }
      ]
    },
    {
      id: 'servo-feedback',
      label: '舵机反馈',
      description: '舵机内部编码器数据',
      type: 'process',
      data: { resolution: '12-bit', accuracy: '±0.1°' }
    },
    {
      id: 'firmware-collect',
      label: '固件采集',
      description: 'ESP32 定时采集传感器数据',
      type: 'process',
      data: { frequency: '100Hz', buffer: 'FIFO' },
      files: [
        { path: 'firmware/main/StateManager.cpp', functions: ['collectState', 'updateBuffer'] }
      ]
    },
    {
      id: 'state-publish',
      label: '状态发布',
      description: '定时发布完整手部状态',
      type: 'process',
      data: { format: 'JSON', topic: '/hand/state' },
      files: [
        { path: 'firmware/main/StatePublisher.cpp', functions: ['publishState', 'formatJSON'] }
      ]
    },
    {
      id: 'sdk-update',
      label: 'SDK 更新',
      description: '接收并解析状态数据',
      type: 'process',
      data: { language: 'Python' },
      files: [
        { path: 'sdk/src/aero_open_sdk/hand.py', functions: ['update_state', 'on_state_update'] }
      ]
    },
    {
      id: 'display',
      label: '界面显示',
      description: '实时显示手部状态',
      type: 'output',
      data: { ui: 'GUI/Web' },
      files: [
        { path: 'sdk/examples/gui_app.py', functions: ['update_display', 'render_hand'] }
      ]
    }
  ],
  edges: [
    { from: 'sensors', to: 'servo-feedback', label: '检测' },
    { from: 'servo-feedback', to: 'firmware-collect', label: '上报' },
    { from: 'firmware-collect', to: 'state-publish', label: '处理' },
    { from: 'state-publish', to: 'sdk-update', label: '推送' },
    { from: 'sdk-update', to: 'display', label: '渲染' }
  ]
}

/**
 * 训练流：仿真→PPO→策略→部署
 */
export const trainingFlow = {
  id: 'training',
  name: '训练流',
  nameEn: 'Training Flow',
  description: 'Sim2Real 强化学习训练的完整流程',
  type: 'parallel',
  lanes: [
    { id: 'simulation', name: '仿真环境', color: '#3498db' },
    { id: 'algorithm', name: '算法', color: '#e74c3c' },
    { id: 'data', name: '数据', color: '#2ecc71' },
    { id: 'deployment', name: '部署', color: '#f39c12' }
  ],
  nodes: [
    // 仿真环境
    { id: 'mujoco-setup', lane: 'simulation', label: 'MuJoCo 环境', order: 0, description: '物理仿真引擎' },
    { id: 'domain-random', lane: 'simulation', label: '域随机化', order: 1, description: '随机化物理参数' },
    { id: 'reward-design', lane: 'simulation', label: '奖励函数', order: 2, description: '定义训练目标' },

    // 算法
    { id: 'network-init', lane: 'algorithm', label: '网络初始化', order: 0, description: 'PPO Actor-Critic' },
    { id: 'policy-update', lane: 'algorithm', label: '策略更新', order: 1, description: 'PPO 损失优化' },

    // 数据
    { id: 'rollout', lane: 'data', label: '轨迹采集', order: 0, description: '与环境交互' },
    { id: 'buffer', lane: 'data', label: '经验缓冲', order: 1, description: '存储轨迹数据' },

    // 部署
    { id: 'policy-eval', lane: 'deployment', label: '策略评估', order: 0, description: '验证策略效果' },
    { id: 'sim2real', lane: 'deployment', label: 'Sim2Real', order: 1, description: '迁移到实物' },

    // 额外步骤
    { id: 'model-save', lane: 'algorithm', label: '模型保存', order: 2, description: '保存检查点' },
    { id: 'onnx-export', lane: 'deployment', label: 'ONNX导出', order: 2, description: '转换为ONNX' }
  ],
  edges: [
    // 仿真内部
    { from: 'mujoco-setup', to: 'domain-random', lane: 'simulation' },
    { from: 'domain-random', to: 'reward-design', lane: 'simulation' },

    // 算法内部
    { from: 'network-init', to: 'policy-update', lane: 'algorithm' },
    { from: 'policy-update', to: 'model-save', lane: 'algorithm' },

    // 数据内部
    { from: 'rollout', to: 'buffer', lane: 'data' },

    // 部署内部
    { from: 'policy-eval', to: 'sim2real', lane: 'deployment' },
    { from: 'sim2real', to: 'onnx-export', lane: 'deployment' },

    // 跨泳道连接
    { from: 'reward-design', to: 'rollout', crossLane: true },
    { from: 'rollout', to: 'policy-update', crossLane: true },
    { from: 'policy-update', to: 'rollout', crossLane: true },
    { from: 'buffer', to: 'policy-update', crossLane: true },
    { from: 'policy-update', to: 'policy-eval', crossLane: true },
    { from: 'model-save', to: 'onnx-export', crossLane: true }
  ]
}

/**
 * 开发流：编码→测试→烧录→调试
 */
export const developmentFlow = {
  id: 'development',
  name: '开发流',
  nameEn: 'Development Flow',
  description: '固件和SDK的完整开发流程',
  type: 'linear',
  direction: 'TB',
  nodes: [
    {
      id: 'coding',
      label: '编码',
      description: '编写源代码',
      type: 'process',
      data: { tools: 'VSCode/Arduino IDE' },
      files: [
        { path: 'firmware/main/', functions: ['*.cpp', '*.h'] },
        { path: 'sdk/src/', functions: ['*.py'] }
      ]
    },
    {
      id: 'unit-test',
      label: '单元测试',
      description: '运行本地测试',
      type: 'process',
      data: { framework: 'pytest/GoogleTest' },
      files: [
        { path: 'sdk/tests/test_hand.py', functions: ['test_connection', 'test_move'] },
        { path: 'firmware/tests/', functions: ['TestSuite'] }
      ]
    },
    {
      id: 'integration-test',
      label: '集成测试',
      description: '软硬件集成测试',
      type: 'process',
      data: { target: '真实硬件' }
    },
    {
      id: 'build',
      label: '构建',
      description: '编译固件/打包SDK',
      type: 'process',
      data: { platform: 'PlatformIO/Poetry' },
      files: [
        { path: 'firmware/platformio.ini', functions: ['build'] },
        { path: 'sdk/pyproject.toml', functions: ['build'] }
      ]
    },
    {
      id: 'flash',
      label: '烧录',
      description: '固件烧录到 ESP32',
      type: 'process',
      data: { method: 'USB-UART', tool: 'esptool' },
      files: [
        { path: 'firmware/main/Homing.cpp', functions: ['upload'] }
      ]
    },
    {
      id: 'debug',
      label: '调试',
      description: '串口调试和日志分析',
      type: 'process',
      data: { tools: 'Serial Monitor/Logic Analyzer' },
      files: [
        { path: 'firmware/main/Logger.cpp', functions: ['log', 'debug'] }
      ]
    },
    {
      id: 'deploy',
      label: '部署',
      description: '发布到生产环境',
      type: 'output',
      data: { targets: ['GitHub Release', 'PyPI'] }
    }
  ],
  edges: [
    { from: 'coding', to: 'unit-test', label: '提交' },
    { from: 'unit-test', to: 'integration-test', label: 'CI通过' },
    { from: 'integration-test', to: 'build', label: '合并' },
    { from: 'build', to: 'flash', label: '构建成功' },
    { from: 'flash', to: 'debug', label: '运行' },
    { from: 'debug', to: 'coding', label: '修复' },
    { from: 'debug', to: 'deploy', label: '发布' }
  ]
}

/**
 * ROS2 配置树
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
    { id: 'hand-controller', label: 'hand_controller', type: 'leaf', parent: 'nodes', description: '主控制节点' },
    { id: 'teleop-node', label: 'teleop', type: 'leaf', parent: 'nodes', description: '遥操作节点' },
    { id: 'state-publisher', label: 'joint_state_publisher', type: 'leaf', parent: 'nodes', description: '状态发布节点' },
    { id: 'command-topic', label: '/hand/command', type: 'leaf', parent: 'topics', description: '控制指令话题' },
    { id: 'state-topic', label: '/hand/state', type: 'leaf', parent: 'topics', description: '状态话题' },
    { id: 'joint-states', label: '/joint_states', type: 'leaf', parent: 'topics', description: '关节状态话题' },
    { id: 'calibrate-service', label: '/calibrate', type: 'leaf', parent: 'services', description: '校准服务' },
    { id: 'home-service', label: '/home', type: 'leaf', parent: 'services', description: '归零服务' },
    { id: 'grasp-action', label: '/grasp', type: 'leaf', parent: 'actions', description: '抓取动作' },
    { id: 'sequence-action', label: '/sequence', type: 'leaf', parent: 'actions', description: '序列动作' },
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
    id: 'control',
    name: '控制流',
    description: '用户指令到手指动作的完整控制链路',
    type: 'linear',
    difficulty: 'beginner',
    duration: '10 分钟',
    icon: 'Connection',
    color: '#3498db'
  },
  {
    id: 'feedback',
    name: '反馈流',
    description: '传感器数据回传到用户界面的完整链路',
    type: 'linear',
    difficulty: 'beginner',
    duration: '10 分钟',
    icon: 'RefreshRight',
    color: '#9b59b6'
  },
  {
    id: 'training',
    name: '训练流',
    description: 'Sim2Real 强化学习训练流程',
    type: 'parallel',
    difficulty: 'advanced',
    duration: '25 分钟',
    icon: 'Cpu',
    color: '#e74c3c'
  },
  {
    id: 'development',
    name: '开发流',
    description: '固件和SDK的完整开发流程',
    type: 'linear',
    difficulty: 'intermediate',
    duration: '15 分钟',
    icon: 'FolderOpened',
    color: '#2ecc71'
  },
  {
    id: 'joint-mapping',
    name: '关节映射',
    description: '从用户指令到关节运动的完整数据流',
    type: 'linear',
    difficulty: 'beginner',
    duration: '10 分钟',
    icon: 'Connection',
    color: '#1abc9c'
  },
  {
    id: 'ros2-config',
    name: 'ROS2 配置',
    description: 'ROS2 工作空间和节点配置',
    type: 'tree',
    difficulty: 'intermediate',
    duration: '15 分钟',
    icon: 'FolderOpened',
    color: '#f39c12'
  }
]

/**
 * 获取流程定义
 * @param {string} flowId - 流程ID
 * @returns {Object|null} 流程定义
 */
export function getFlowDefinition(flowId) {
  const flows = {
    'control': controlFlow,
    'feedback': feedbackFlow,
    'training': trainingFlow,
    'development': developmentFlow,
    'joint-mapping': jointMappingFlow,
    'rl-training': trainingFlow,
    'ros2-config': ros2ConfigFlow
  }
  return flows[flowId] || null
}

export default {
  jointMappingFlow,
  controlFlow,
  feedbackFlow,
  trainingFlow,
  developmentFlow,
  ros2ConfigFlow,
  flowList,
  getFlowDefinition
}
