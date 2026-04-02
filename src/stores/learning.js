/**
 * 学习管理 Store
 * 管理学习路径、阶段、任务、进度追踪等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Logger from '@/utils/logger.js'

const LOG_LABEL = 'LearningStore'

export const useLearningStore = defineStore('learning', () => {
  // 当前阶段
  const currentStage = ref('hardware')

  // 已完成的任务
  const completedTasks = ref(new Set())

  // 学习路径数据 - 扩展版本
  const learningPath = ref({
    // 学习资源库
    resources: {
      tutorials: [
        {
          id: 'tutorial-esp32',
          title: 'ESP32-S3 快速入门',
          url: 'https://docs.espressif.com/projects/esp-idf/zh_CN/latest/esp32s3/get-started/index.html',
          type: 'official',
          language: 'zh-CN',
          recommended: true
        },
        {
          id: 'tutorial-arduino',
          title: 'Arduino IDE 使用教程',
          url: 'https://docs.arduino.cc/language-reference',
          type: 'official',
          language: 'en',
          recommended: true
        },
        {
          id: 'tutorial-mujoco',
          title: 'MuJoCo 官方文档',
          url: 'https://mujoco.readthedocs.io/',
          type: 'official',
          language: 'en',
          recommended: true
        },
        {
          id: 'tutorial-jax',
          title: 'JAX 官方教程',
          url: 'https://jax.readthedocs.io/',
          type: 'official',
          language: 'en',
          recommended: false
        },
        {
          id: 'tutorial-rl',
          title: 'Spinning Up in Deep RL',
          url: 'https://spinningup.openai.com/',
          type: 'course',
          language: 'en',
          recommended: true
        },
        {
          id: 'tutorial-ros2',
          title: 'ROS2 Humble 官方教程',
          url: 'https://docs.ros.org/en/humble/Tutorials.html',
          type: 'official',
          language: 'en',
          recommended: true
        }
      ],
      videos: [
        {
          id: 'video-hand-assembly',
          title: 'Aero Hand 装配演示',
          url: 'https://www.youtube.com/watch?v=example',
          duration: '15:30',
          stage: 'hardware',
          language: 'en'
        },
        {
          id: 'video-firmware-flash',
          title: '固件烧录教程',
          url: 'https://www.youtube.com/watch?v=example2',
          duration: '8:45',
          stage: 'firmware',
          language: 'en'
        },
        {
          id: 'video-sdk-usage',
          title: 'Python SDK 使用指南',
          url: 'https://www.youtube.com/watch?v=example3',
          duration: '12:20',
          stage: 'sdk-usage',
          language: 'en'
        },
        {
          id: 'video-mujoco-basics',
          title: 'MuJoCo 仿真基础',
          url: 'https://www.youtube.com/watch?v=example4',
          duration: '25:00',
          stage: 'mujoco',
          language: 'en'
        },
        {
          id: 'video-ppo-training',
          title: 'PPO 训练实战',
          url: 'https://www.youtube.com/watch?v=example5',
          duration: '45:00',
          stage: 'rl-training',
          language: 'en'
        }
      ],
      practiceProjects: [
        {
          id: 'project-1',
          title: '基础抓取实验',
          description: '使用 SDK 控制机械手抓取简单物体（球、方块）',
          difficulty: '入门',
          estimatedTime: '2小时',
          stage: 'sdk-usage'
        },
        {
          id: 'project-2',
          title: '多指协调控制',
          description: '实现复杂手势和协调动作（如 OK 手势、捏取）',
          difficulty: '基础',
          estimatedTime: '4小时',
          stage: 'sdk-usage'
        },
        {
          id: 'project-3',
          title: '仿真环境搭建',
          description: '在 MuJoCo 中搭建自定义仿真环境',
          difficulty: '进阶',
          estimatedTime: '8小时',
          stage: 'mujoco'
        },
        {
          id: 'project-4',
          title: '自定义 RL 任务',
          description: '设计并训练一个新的 RL 任务（如物品分类）',
          difficulty: '高级',
          estimatedTime: '20小时',
          stage: 'rl-training'
        },
        {
          id: 'project-5',
          title: 'Sim2Real 部署',
          description: '将训练好的策略部署到真实硬件',
          difficulty: '高级',
          estimatedTime: '16小时',
          stage: 'sim2real'
        }
      ]
    },

    // 8个学习阶段 - 扩展详细信息
    stages: [
      {
        id: 'hardware',
        title: '硬件准备',
        icon: 'Box',
        shortTitle: '硬件',
        description: '采购和准备所有硬件零件，包括电子元件采购、3D打印和机械组装',
        difficulty: '入门',
        difficultyScore: 1,
        estimatedTime: '1-2周',
        estimatedHours: 20,
        prerequisites: [],
        outcomes: [
          { text: '掌握电子元件采购清单', achieved: false },
          { text: '了解 3D 打印基础知识', achieved: false },
          { text: '完成机械结构组装', achieved: false }
        ],
        skills: ['采购', '3D打印', '机械装配'],
        tags: ['硬件', '入门', '动手实践'],
        color: '#409eff',
        resources: [
          { title: 'BOM 采购清单', type: 'doc', url: '/docs/bom' },
          { title: '3D 打印指南', type: 'doc', url: '/docs/3d-printing' },
          { title: '装配视频教程', type: 'video', url: 'https://youtube.com/watch?v=example' }
        ],
        tasks: [
          {
            id: 'hardware-buy-parts',
            title: '购买电子元件',
            difficulty: '入门',
            difficultyScore: 1,
            estimatedTime: '3-5天',
            completed: false,
            current: false,
            description: '购买ESP32-S3开发板和7个HLS3606M舵机',
            steps: [
              '购买ESP32-S3 DevKitC-1开发板（或兼容板）',
              '购买7个 Feetech HLS3606M 智能总线舵机',
              '购买5V 4A电源适配器',
              '购买舵机连接线束'
            ],
            commands: [],
            expected: '所有电子元件到手，准备开始3D打印',
            tips: [
              '舵机建议买2-3个备用，以防损坏',
              '电源质量要好，影响舵机稳定性'
            ],
            blocked: false,
            reason: ''
          },
          {
            id: 'hardware-print',
            title: '3D打印零件',
            difficulty: '基础',
            difficultyScore: 2,
            estimatedTime: '1周',
            completed: false,
            current: false,
            description: '打印所有机械结构零件',
            steps: [
              '下载STL文件（硬件/CAD/3D_print/）',
              '检查PLA材料是否充足（约500g）',
              '打印手掌零件（约6小时）',
              '打印5个手指零件（每个约2小时）',
              '检查打印质量，确保无翘曲、无断层'
            ],
            commands: ['cura aero_hand.stl', 'prusaslicer aero_hand.stl'],
            expected: '所有3D打印零件完成，支撑已清理',
            tips: [
              '打印前用砂纸打磨平台确保平整',
              '远端指骨壁薄，需要降低打印速度'
            ],
            blocked: false,
            reason: ''
          },
          {
            id: 'hardware-assembly',
            title: '机械组装',
            difficulty: '进阶',
            difficultyScore: 3,
            estimatedTime: '3-5天',
            completed: false,
            current: true,
            description: '组装机械手的骨骼结构',
            steps: [
              '将舵机安装到手指关节中',
              '连接肌腱线到舵机摇臂',
              '组装手掌框架',
              '安装手指到手掌',
              '检查所有关节是否顺畅'
            ],
            commands: [],
            expected: '机械手组装完成，手指可以手动弯曲',
            tips: [
              '肌腱穿引时保持张力均匀',
              '滑轮安装要牢固，不能有晃动'
            ],
            blocked: false,
            reason: ''
          },
          {
            id: 'hardware-wiring',
            title: '电气连接',
            difficulty: '基础',
            difficultyScore: 2,
            estimatedTime: '1-2天',
            completed: false,
            current: false,
            description: '连接舵机到ESP32并供电',
            steps: [
              '按照官方接线图连接舵机数据线',
              '连接所有舵机VCC到5V电源',
              '连接所有舵机GND到公共地',
              '为ESP32供电',
              '用扎线整理线缆'
            ],
            commands: [],
            expected: '上电后舵机指示灯正常亮起',
            tips: [
              '注意舵机线的顺序，接错可能损坏',
              '最后再接电源，先用万用表检查'
            ],
            blocked: false,
            reason: ''
          }
        ]
      },
      {
        id: 'firmware',
        title: '固件烧录',
        icon: 'Cpu',
        shortTitle: '固件',
        description: '安装开发环境，编译并烧录 ESP32 固件到开发板',
        difficulty: '入门',
        difficultyScore: 1,
        estimatedTime: '1-2天',
        estimatedHours: 8,
        prerequisites: ['hardware'],
        outcomes: [
          { text: '掌握 Arduino IDE 和 ESP32 开发', achieved: false },
          { text: '理解固件架构', achieved: false },
          { text: '完成固件烧录', achieved: false }
        ],
        skills: ['Arduino', 'ESP32', '串口通信'],
        tags: ['固件', 'ESP32', '开发环境'],
        color: '#67c23a',
        resources: [
          { title: 'ESP32-S3 官方文档', type: 'doc', url: 'https://docs.espressif.com' },
          { title: '固件源码分析', type: 'doc', url: '/docs/firmware' }
        ],
        tasks: [
          {
            id: 'firmware-install-arduino',
            title: '安装Arduino IDE',
            difficulty: '入门',
            difficultyScore: 1,
            estimatedTime: '30分钟',
            completed: false,
            current: false,
            description: '安装Arduino开发环境和ESP32支持',
            steps: [
              '下载Arduino IDE 2.x',
              '安装ESP32开发板支持',
              '安装USB转串口驱动（CH340）'
            ],
            commands: ['arduino-cli version'],
            expected: 'Arduino IDE可以识别ESP32-S3开发板',
            tips: ['使用 arduino-cli 可以更高效地管理开发板'],
            blocked: true,
            reason: '需先完成硬件准备阶段'
          },
          {
            id: 'firmware-open-project',
            title: '打开固件项目',
            difficulty: '入门',
            difficultyScore: 1,
            estimatedTime: '10分钟',
            completed: false,
            current: false,
            description: '从GitHub克隆或下载固件代码',
            steps: [
              '克隆 aero-hand-open 仓库',
              '用Arduino IDE打开 firmware/main/firmware_v0.1.0.ino',
              '检查依赖库是否已安装'
            ],
            commands: ['git clone https://github.com/TetherIA/aero-hand-open.git'],
            expected: '固件项目在Arduino IDE中正常打开',
            tips: [],
            blocked: true,
            reason: '需先完成硬件准备阶段'
          },
          {
            id: 'firmware-config',
            title: '配置固件参数',
            difficulty: '基础',
            difficultyScore: 2,
            estimatedTime: '15分钟',
            completed: false,
            current: false,
            description: '设置正确的串口波特率和舵机ID',
            steps: [
              '打开 HandConfig.h 文件',
              '确认 SERIAL_BAUD 设置为 921600',
              '确认舵机ID映射正确（1-5手指，6手腕，7拇指）'
            ],
            expected: '固件配置参数确认无误',
            tips: ['不建议修改默认波特率，可能影响通信稳定性'],
            blocked: true,
            reason: '需先完成硬件准备阶段'
          },
          {
            id: 'firmware-flash',
            title: '编译并烧录固件',
            difficulty: '基础',
            difficultyScore: 2,
            estimatedTime: '5分钟',
            completed: false,
            current: false,
            description: '将固件上传到ESP32',
            steps: [
              '用USB线连接ESP32到电脑',
              '在Arduino IDE选择正确的COM端口',
              '点击"上传"按钮',
              '等待编译和上传完成'
            ],
            commands: ['arduino-cli compile --fqbn esp32:esp32:esp32s3'],
            expected: 'IDE显示"上传成功"，串口监视器可以看到启动信息',
            tips: ['如果上传失败，尝试按住BOOT再按RESET进入下载模式'],
            blocked: true,
            reason: '需先完成硬件准备阶段'
          },
          {
            id: 'firmware-test',
            title: '测试串口通信',
            difficulty: '基础',
            difficultyScore: 2,
            estimatedTime: '10分钟',
            completed: false,
            current: false,
            description: '验证ESP32固件正常运行',
            steps: [
              '打开串口监视器（波特率921600）',
              '发送命令: 01 10 00 00 00 02 04 00 00 10 00',
              '观察舵机是否有反应',
              '检查返回数据是否正确'
            ],
            commands: ['echo "Test serial communication"'],
            expected: '串口通信正常，舵机响应命令',
            tips: ['使用十六进制发送可以避免编码问题'],
            blocked: true,
            reason: '需先完成硬件准备阶段'
          }
        ]
      },
      {
        id: 'servo-config',
        title: '舵机配置',
        icon: 'Setting',
        shortTitle: '舵机',
        description: '理解并配置每个舵机的安全运动范围，端点校准',
        difficulty: '基础',
        difficultyScore: 2,
        estimatedTime: '2-3天',
        estimatedHours: 12,
        prerequisites: ['firmware'],
        outcomes: [
          { text: '理解 HLS3606M 舵机控制原理', achieved: false },
          { text: '掌握端点配置方法', achieved: false },
          { text: '完成所有舵机校准', achieved: false }
        ],
        skills: ['舵机原理', 'PWM', '串口协议'],
        tags: ['舵机', '配置', '校准'],
        color: '#e6a23c',
        resources: [
          { title: 'HLS3606M 数据手册', type: 'doc', url: 'https://feetechrc.com' },
          { title: '端点配置视频教程', type: 'video', url: 'https://youtube.com/watch?v=example' }
        ],
        tasks: [
          {
            id: 'understand-servo',
            title: '理解舵机控制原理',
            difficulty: '基础',
            difficultyScore: 2,
            estimatedTime: '2小时',
            completed: false,
            current: false,
            description: 'HLS3606M的PWM控制原理和4096级分辨率',
            steps: [
              '阅读HLS3606M数据手册',
              '理解0-4095控制范围',
              '理解串口通信协议（UART）',
              '理解多舵机级联原理'
            ],
            expected: '明白如何通过串口命令控制舵机位置',
            tips: ['理解4096级精度对于后续调试非常重要'],
            blocked: true,
            reason: '需先完成固件烧录阶段'
          },
          {
            id: 'install-sdk',
            title: '安装Python SDK',
            difficulty: '入门',
            difficultyScore: 1,
            estimatedTime: '15分钟',
            completed: false,
            current: false,
            description: '安装aero-open-sdk库和依赖',
            steps: [
              '创建Python虚拟环境',
              '激活虚拟环境',
              '安装aero-open-sdk',
              '验证安装成功'
            ],
            commands: [
              'python -m venv venv',
              'venv\\Scripts\\activate',
              'pip install aero-open-sdk'
            ],
            expected: '可以导入aero_open_sdk模块',
            tips: ['建议使用 conda 或 venv 管理环境'],
            blocked: true,
            reason: '需先完成固件烧录阶段'
          },
          {
            id: 'config-endpoints',
            title: '配置单个舵机端点',
            difficulty: '进阶',
            difficultyScore: 3,
            estimatedTime: '1-2小时',
            completed: false,
            current: false,
            description: '设置grasp_count和extend_count',
            steps: [
              '连接单个舵机到ESP32',
              '使用GUI找到手指伸直位置（extend_count）',
              '使用GUI找到手指最大弯曲位置（grasp_count）',
              '点击保存端点到ESP32',
              '测试端点是否保存成功'
            ],
            commands: ['python -m aero_open_sdk.gui_chinese'],
            expected: '舵机在0-4095范围内平稳运动，不碰到硬限位',
            tips: [
              '不要设置太极限的位置，留10%余量',
              '多次测试确保位置可重复'
            ],
            blocked: true,
            reason: '需先完成固件烧录阶段'
          },
          {
            id: 'config-all-servos',
            title: '配置所有舵机',
            difficulty: '进阶',
            difficultyScore: 3,
            estimatedTime: '3-4小时',
            completed: false,
            current: false,
            description: '为7个舵机分别配置端点',
            steps: [
              '依次连接每个舵机',
              '为每个舵机配置extend_count',
              '为每个舵机配置grasp_count',
              '保存所有配置到ESP32',
              '验证配置文件已保存'
            ],
            expected: '所有舵机端点配置完成并保存',
            tips: ['记录每个舵机的配置值，方便后续调试'],
            blocked: true,
            reason: '需先完成固件烧录阶段'
          },
          {
            id: 'test-sdk',
            title: '测试SDK控制',
            difficulty: '基础',
            difficultyScore: 2,
            estimatedTime: '30分钟',
            completed: false,
            current: false,
            description: '使用SDK控制整个手执行动作序列',
            steps: [
              '编写简单控制脚本',
              '控制单个手指弯曲伸直',
              '控制所有手指同时动作',
              '测试预定义姿势（张开、握拳等）'
            ],
            commands: ['python -c "from aero_open_sdk import AeroHand; h = AeroHand(); h.open()"'],
            expected: '机械手响应所有SDK命令',
            tips: [],
            blocked: true,
            reason: '需先完成固件烧录阶段'
          }
        ]
      },
      {
        id: 'sdk-usage',
        title: 'SDK使用',
        icon: 'Files',
        shortTitle: 'SDK',
        description: '深入学习 Python SDK 的使用，阅读源码，探索示例代码',
        difficulty: '基础',
        difficultyScore: 2,
        estimatedTime: '3-5天',
        estimatedHours: 16,
        prerequisites: ['servo-config'],
        outcomes: [
          { text: '理解 SDK 架构和代码结构', achieved: false },
          { text: '掌握所有核心 API', achieved: false },
          { text: '能够编写自定义控制脚本', achieved: false }
        ],
        skills: ['Python', 'API设计', '异步编程'],
        tags: ['SDK', 'Python', '进阶编程'],
        color: '#909399',
        resources: [
          { title: 'SDK API 文档', type: 'doc', url: '/docs/sdk-api' },
          { title: '示例代码仓库', type: 'code', url: '/sdk/examples' }
        ],
        tasks: [
          {
            id: 'understand-arch',
            title: '理解代码架构',
            difficulty: '基础',
            difficultyScore: 2,
            estimatedTime: '2小时',
            completed: false,
            current: false,
            description: 'SDK、固件、硬件之间的关系',
            steps: [
              '阅读SDK源码结构',
              '理解AeroHand类的作用',
              '理解串口通信协议',
              '理解命令帧格式'
            ],
            expected: '明白整个软件栈的工作原理',
            tips: ['重点关注 AeroHand 类和 SerialCommunicator 类'],
            blocked: true,
            reason: '需先完成舵机配置阶段'
          },
          {
            id: 'explore-examples',
            title: '探索官方示例代码',
            difficulty: '入门',
            difficultyScore: 1,
            estimatedTime: '1小时',
            completed: false,
            current: false,
            description: '学习SDK的使用方式',
            steps: [
              '查看sdk/examples/目录',
              '阅读run_sequence.py',
              '阅读teleoperation.py',
              '理解每个示例的功能'
            ],
            commands: ['ls sdk/examples/'],
            expected: '了解SDK的主要功能API',
            tips: [],
            blocked: true,
            reason: '需先完成舵机配置阶段'
          },
          {
            id: 'run-examples',
            title: '运行示例脚本',
            difficulty: '入门',
            difficultyScore: 1,
            estimatedTime: '30分钟',
            completed: false,
            current: false,
            description: '实际运行官方示例程序',
            steps: [
              '连接机械手到电脑',
              '运行run_sequence.py',
              '观察机械手执行动作',
              '尝试修改动作序列'
            ],
            commands: ['python sdk/examples/run_sequence.py'],
            expected: '机械手按照示例代码执行动作',
            tips: ['注意观察串口数据，了解通信协议'],
            blocked: true,
            reason: '需先完成舵机配置阶段'
          },
          {
            id: 'write-custom-script',
            title: '编写自定义控制脚本',
            difficulty: '进阶',
            difficultyScore: 3,
            estimatedTime: '4小时',
            completed: false,
            current: false,
            description: '使用SDK创建自己的控制程序',
            steps: [
              '创建新的Python脚本',
              '导入AeroHand类',
              '编写自定义动作序列',
              '测试并调试'
            ],
            expected: '成功运行自定义控制脚本',
            tips: [
              '建议使用 asyncio 提高响应性',
              '添加异常处理防止程序崩溃'
            ],
            blocked: true,
            reason: '需先完成舵机配置阶段'
          }
        ]
      },
      {
        id: 'mujoco',
        title: 'MuJoCo仿真',
        icon: 'Monitor',
        shortTitle: '仿真',
        description: '学习 MuJoCo 物理仿真引擎，搭建仿真环境，实现实时控制',
        difficulty: '进阶',
        difficultyScore: 3,
        estimatedTime: '1-2周',
        estimatedHours: 24,
        prerequisites: ['sdk-usage'],
        outcomes: [
          { text: '理解 MuJoCo XML 模型结构', achieved: false },
          { text: '掌握仿真环境搭建方法', achieved: false },
          { text: '能够实现实时交互控制', achieved: false }
        ],
        skills: ['MuJoCo', 'MJCF', '物理仿真', 'JAX'],
        tags: ['仿真', 'MuJoCo', '物理引擎'],
        color: '#f56c6c',
        resources: [
          { title: 'MuJoCo 官方文档', type: 'doc', url: 'https://mujoco.readthedocs.io' },
          { title: 'XML 模型教程', type: 'doc', url: '/docs/mujoco-xml' }
        ],
        tasks: [
          {
            id: 'understand-mujoco',
            title: '理解MuJoCo基础',
            difficulty: '基础',
            difficultyScore: 2,
            estimatedTime: '2小时',
            completed: false,
            current: false,
            description: 'MuJoCo物理引擎的基本概念',
            steps: [
              '了解MuJoCo是什么',
              '理解MJX（JAX后端）',
              '理解物理仿真原理'
            ],
            expected: '明白MuJoCo的作用和优势',
            tips: ['MJX 版本性能比标准版快 100 倍'],
            blocked: true,
            reason: '需先完成 SDK 使用阶段'
          },
          {
            id: 'understand-xml',
            title: '理解XML模型',
            difficulty: '进阶',
            difficultyScore: 3,
            estimatedTime: '4小时',
            completed: false,
            current: false,
            description: 'MuJoCo模型文件的结构和配置',
            steps: [
              '阅读sim_rl/simulation/aero_hand.xml',
              '理解geom（几何体）定义',
              '理解joint（关节）定义',
              '理解actuator（执行器）定义',
              '理解tendon（肌腱）定义'
            ],
            expected: '理解MuJoCo XML模型结构',
            tips: ['重点理解 tendon 元素的 spatial 类型'],
            blocked: true,
            reason: '需先完成 SDK 使用阶段'
          },
          {
            id: 'install-mujoco',
            title: '安装MuJoCo环境',
            difficulty: '基础',
            difficultyScore: 2,
            estimatedTime: '1小时',
            completed: false,
            current: false,
            description: '安装MuJoCo、MJX和JAX',
            steps: [
              '安装MuJoCo',
              '安装JAX',
              '安装mujoco_playground',
              '验证安装成功'
            ],
            commands: [
              'pip install mujoco',
              'pip install mujoco-mjx',
              'pip install mujoco-playground'
            ],
            expected: '可以成功导入mujoco模块',
            tips: ['GPU 版本的 JAX 可以加速训练'],
            blocked: true,
            reason: '需先完成 SDK 使用阶段'
          },
          {
            id: 'load-simulation',
            title: '加载仿真模型',
            difficulty: '基础',
            difficultyScore: 2,
            estimatedTime: '1小时',
            completed: false,
            current: false,
            description: '用Python加载Aero Hand模型',
            steps: [
              '编写Python脚本加载XML',
              '创建仿真环境',
              '渲染初始状态',
              '检查模型是否正确加载'
            ],
            commands: ['python -c "import mujoco; mj_model = mujoco.MjModel.from_xml_path(\'aero_hand.xml\')"'],
            expected: '可以看到Aero Hand的3D模型',
            tips: ['使用 mujoco.viewer 可以可视化'],
            blocked: true,
            reason: '需先完成 SDK 使用阶段'
          },
          {
            id: 'realtime-control',
            title: '实时控制仿真',
            difficulty: '进阶',
            difficultyScore: 3,
            estimatedTime: '4小时',
            completed: false,
            current: false,
            description: '交互式控制仿真模型',
            steps: [
              '编写控制循环',
              '从键盘获取输入',
              '设置目标关节角度',
              '观察仿真响应'
            ],
            expected: '可以实时控制仿真中的机械手',
            tips: ['使用 pygame 处理键盘输入'],
            blocked: true,
            reason: '需先完成 SDK 使用阶段'
          },
          {
            id: 'test-policy',
            title: '测试预训练策略',
            difficulty: '高级',
            difficultyScore: 4,
            estimatedTime: '2小时',
            completed: false,
            current: false,
            description: '加载并运行训练好的策略',
            steps: [
              '下载预训练策略权重',
              '加载策略网络',
              '运行策略推理',
              '观察机械手行为'
            ],
            expected: '策略能控制机械手完成指定任务',
            tips: [],
            blocked: true,
            reason: '需先完成 SDK 使用阶段'
          }
        ]
      },
      {
        id: 'ros2',
        title: 'ROS2集成',
        icon: 'Connection',
        shortTitle: 'ROS2',
        description: '学习 ROS2 中间件，搭建节点通信，实现遥操作控制',
        difficulty: '进阶',
        difficultyScore: 3,
        estimatedTime: '1-2周',
        estimatedHours: 20,
        prerequisites: ['mujoco'],
        outcomes: [
          { text: '理解 ROS2 核心概念', achieved: false },
          { text: '掌握节点、话题、服务通信', achieved: false },
          { text: '能够创建自定义 ROS2 节点', achieved: false }
        ],
        skills: ['ROS2', 'DDS', '节点通信', 'C++/Python'],
        tags: ['ROS2', '机器人中间件', '分布式系统'],
        color: '#9c27b0',
        resources: [
          { title: 'ROS2 官方教程', type: 'doc', url: 'https://docs.ros.org' },
          { title: 'Aero Hand ROS2 包', type: 'code', url: '/ros2' }
        ],
        tasks: [
          {
            id: 'understand-ros2',
            title: '理解ROS2作用',
            difficulty: '基础',
            difficultyScore: 2,
            estimatedTime: '2小时',
            completed: false,
            current: false,
            description: '为什么需要ROS2？能否不用？',
            steps: [
              '学习ROS2的基本概念',
              '理解节点、话题、服务',
              '理解发布/订阅模式',
              '评估是否需要ROS2'
            ],
            expected: '明白ROS2在项目中的作用',
            tips: ['如果只是单机控制，可以跳过此阶段'],
            blocked: true,
            reason: '需先完成 MuJoCo 仿真阶段'
          },
          {
            id: 'setup-ros2',
            title: '搭建ROS2环境',
            difficulty: '进阶',
            difficultyScore: 3,
            estimatedTime: '4小时',
            completed: false,
            current: false,
            description: '安装ROS2 Humble和Aero Hand包',
            steps: [
              '安装Ubuntu 22.04（如需要）',
              '安装ROS2 Humble',
              '克隆aero-hand-open的ROS2子模块',
              '安装依赖包',
              '编译工作空间'
            ],
            commands: [
              'sudo apt install ros-humble-desktop',
              'colcon build --symlink-install'
            ],
            expected: 'ROS2环境可以正常运行',
            tips: ['使用双系统或虚拟机安装 Ubuntu'],
            blocked: true,
            reason: '需先完成 MuJoCo 仿真阶段'
          },
          {
            id: 'run-nodes',
            title: '运行示例节点',
            difficulty: '基础',
            difficultyScore: 2,
            estimatedTime: '1小时',
            completed: false,
            current: false,
            description: '启动ROS2节点并通信',
            steps: [
              'Source ROS2环境',
              '启动遥操作发布节点',
              '启动机械手订阅节点',
              '测试话题通信'
            ],
            commands: [
              'source install/setup.bash',
              'ros2 run aero_hand teleop',
              'ros2 run aero_hand hand_controller'
            ],
            expected: '可以通过ROS2控制机械手',
            tips: [],
            blocked: true,
            reason: '需先完成 MuJoCo 仿真阶段'
          },
          {
            id: 'understand-topics',
            title: '理解话题消息',
            difficulty: '基础',
            difficultyScore: 2,
            estimatedTime: '2小时',
            completed: false,
            current: false,
            description: '理解ROS2消息格式',
            steps: [
              '查看话题列表',
              '查看消息类型',
              '观察话题数据',
              '理解消息结构'
            ],
            commands: ['ros2 topic list', 'ros2 topic echo /hand_commands'],
            expected: '明白ROS2消息如何映射到SDK命令',
            tips: [],
            blocked: true,
            reason: '需先完成 MuJoCo 仿真阶段'
          }
        ]
      },
      {
        id: 'rl-training',
        title: 'RL训练',
        icon: 'TrendCharts',
        shortTitle: 'RL',
        description: '学习强化学习基础和 PPO 算法，配置和运行训练流程',
        difficulty: '高级',
        difficultyScore: 4,
        estimatedTime: '2-3周',
        estimatedHours: 48,
        prerequisites: ['mujoco'],
        outcomes: [
          { text: '掌握 RL 核心概念和术语', achieved: false },
          { text: '理解 PPO 算法原理', achieved: false },
          { text: '能够配置和运行训练', achieved: false }
        ],
        skills: ['强化学习', 'PPO', '策略优化', 'JAX'],
        tags: ['RL', 'PPO', '机器学习', 'MJX'],
        color: '#00bcd4',
        resources: [
          { title: 'Spinning Up 课程', type: 'course', url: 'https://spinningup.openai.com' },
          { title: 'PPO 论文', type: 'paper', url: 'https://arxiv.org/abs/1707.06347' }
        ],
        tasks: [
          {
            id: 'understand-rl',
            title: '理解强化学习基础',
            difficulty: '进阶',
            difficultyScore: 3,
            estimatedTime: '8小时',
            completed: false,
            current: false,
            description: 'RL的核心概念',
            steps: [
              '理解智能体、环境、奖励',
              '理解策略、价值函数',
              '理解马尔可夫决策过程（MDP）',
              '理解探索与利用'
            ],
            expected: '掌握RL的基本术语和原理',
            tips: ['推荐观看 Spinning Up 课程'],
            blocked: true,
            reason: '需先完成 MuJoCo 仿真阶段'
          },
          {
            id: 'understand-ppo',
            title: '理解PPO算法',
            difficulty: '高级',
            difficultyScore: 4,
            estimatedTime: '12小时',
            completed: false,
            current: false,
            description: '近端策略优化原理',
            steps: [
              '阅读PPO论文摘要',
              '理解策略梯度方法',
              '理解裁剪目标函数',
              '理解优势函数估计'
            ],
            expected: '明白PPO为什么有效',
            tips: ['重点理解裁剪机制的作用'],
            blocked: true,
            reason: '需先完成 MuJoCo 仿真阶段'
          },
          {
            id: 'explore-code',
            title: '探索训练代码',
            difficulty: '进阶',
            difficultyScore: 3,
            estimatedTime: '4小时',
            completed: false,
            current: false,
            description: '理解训练代码结构',
            steps: [
              '查看sim_rl/mujoco_playground/learning/',
              '理解训练循环',
              '理解环境定义',
              '理解奖励函数'
            ],
            expected: '找到训练入口和配置文件',
            tips: [],
            blocked: true,
            reason: '需先完成 MuJoCo 仿真阶段'
          },
          {
            id: 'config-training',
            title: '配置训练参数',
            difficulty: '进阶',
            difficultyScore: 3,
            estimatedTime: '2小时',
            completed: false,
            current: false,
            description: '设置学习率、批量大小、域随机化等',
            steps: [
              '找到训练配置文件',
              '设置学习率',
              '设置批量大小',
              '配置域随机化参数',
              '设置训练总步数'
            ],
            expected: '配置文件准备好，可以开始训练',
            tips: ['建议先用小规模测试'],
            blocked: true,
            reason: '需先完成 MuJoCo 仿真阶段'
          },
          {
            id: 'setup-wandb',
            title: '配置监控工具',
            difficulty: '基础',
            difficultyScore: 2,
            estimatedTime: '30分钟',
            completed: false,
            current: false,
            description: '设置wandb监控训练进度',
            steps: [
              '注册wandb账号',
              '安装wandb库',
              '登录wandb',
              '配置项目名称'
            ],
            commands: ['pip install wandb', 'wandb login'],
            expected: 'wandb已配置，可以记录训练指标',
            tips: ['wandb 可以可视化训练曲线'],
            blocked: true,
            reason: '需先完成 MuJoCo 仿真阶段'
          },
          {
            id: 'run-training',
            title: '运行训练',
            difficulty: '高级',
            difficultyScore: 4,
            estimatedTime: '8-24小时',
            completed: false,
            current: false,
            description: '启动强化学习训练',
            steps: [
              '启动训练脚本',
              '监控GPU使用情况',
              '观察训练曲线',
              '等待训练完成'
            ],
            commands: ['python train.py --env aero_hand'],
            expected: '训练正常进行，指标在wandb上可见',
            tips: ['使用 wandb 监控训练进度'],
            blocked: true,
            reason: '需先完成 MuJoCo 仿真阶段'
          },
          {
            id: 'monitor-training',
            title: '监控和分析训练',
            difficulty: '进阶',
            difficultyScore: 3,
            estimatedTime: '2小时',
            completed: false,
            current: false,
            description: '分析训练结果',
            steps: [
              '查看wandb仪表板',
              '分析奖励曲线',
              '分析成功率曲线',
              '判断是否需要调整参数'
            ],
            expected: '能判断训练是否收敛',
            tips: [],
            blocked: true,
            reason: '需先完成 MuJoCo 仿真阶段'
          },
          {
            id: 'evaluate-policy',
            title: '评估训练策略',
            difficulty: '高级',
            difficultyScore: 4,
            estimatedTime: '2小时',
            completed: false,
            current: false,
            description: '测试训练好的策略',
            steps: [
              '加载训练好的checkpoint',
              '运行策略推理',
              '统计成功率',
              '可视化失败案例'
            ],
            expected: '策略在测试集上表现良好',
            tips: [],
            blocked: true,
            reason: '需先完成 MuJoCo 仿真阶段'
          }
        ]
      },
      {
        id: 'sim2real',
        title: 'Sim2Real',
        icon: 'MagicStick',
        shortTitle: '部署',
        description: '将训练好的策略从仿真环境迁移到真实硬件',
        difficulty: '高级',
        difficultyScore: 4,
        estimatedTime: '2-3周',
        estimatedHours: 40,
        prerequisites: ['rl-training'],
        outcomes: [
          { text: '理解 Sim2Real 挑战', achieved: false },
          { text: '掌握策略导出方法', achieved: false },
          { text: '能够部署到真实硬件', achieved: false }
        ],
        skills: ['Sim2Real', '策略部署', '系统调试'],
        tags: ['Sim2Real', '部署', '真实硬件'],
        color: '#ff5722',
        resources: [
          { title: 'Sim2Real 论文', type: 'paper', url: 'https://arxiv.org/abs/1903.10542' },
          { title: '部署教程', type: 'doc', url: '/docs/deployment' }
        ],
        tasks: [
          {
            id: 'understand-sim2real',
            title: '理解Sim2Real挑战',
            difficulty: '高级',
            difficultyScore: 4,
            estimatedTime: '4小时',
            completed: false,
            current: false,
            description: '从仿真到实物的差距来源',
            steps: [
              '理解物理差距',
              '理解视觉差距',
              '理解延迟差距',
              '理解域随机化的作用'
            ],
            expected: '明白Sim2Real的核心挑战',
            tips: ['域随机化是关键'],
            blocked: true,
            reason: '需先完成 RL 训练阶段'
          },
          {
            id: 'understand-flow',
            title: '理解完整流程',
            difficulty: '进阶',
            difficultyScore: 3,
            estimatedTime: '2小时',
            completed: false,
            current: false,
            description: '从仿真训练到硬件部署的完整链路',
            steps: [
              '理解训练阶段',
              '理解策略导出',
              '理解部署方式',
              '理解调试流程'
            ],
            expected: '掌握端到端的Sim2Real流程',
            tips: [],
            blocked: true,
            reason: '需先完成 RL 训练阶段'
          },
          {
            id: 'export-policy',
            title: '导出策略模型',
            difficulty: '高级',
            difficultyScore: 4,
            estimatedTime: '2小时',
            completed: false,
            current: false,
            description: '将训练好的策略导出为可用格式',
            steps: [
              '提取策略网络权重',
              '转换为推理格式',
              '测试推理速度',
              '验证输出正确性'
            ],
            expected: '策略模型可以独立加载和推理',
            tips: [],
            blocked: true,
            reason: '需先完成 RL 训练阶段'
          },
          {
            id: 'deploy-sdk',
            title: '策略部署（SDK方式）',
            difficulty: '高级',
            difficultyScore: 4,
            estimatedTime: '8小时',
            completed: false,
            current: false,
            description: '直接用SDK部署策略',
            steps: [
              '编写部署脚本',
              '加载策略模型',
              '获取仿真状态',
              '推理并控制硬件',
              '测试端到端延迟'
            ],
            expected: '策略能实时控制硬件机械手',
            tips: ['注意控制频率匹配'],
            blocked: true,
            reason: '需先完成 RL 训练阶段'
          },
          {
            id: 'deploy-ros2',
            title: '策略部署（ROS2方式）',
            difficulty: '高级',
            difficultyScore: 4,
            estimatedTime: '8小时',
            completed: false,
            current: false,
            description: '通过ROS2节点部署策略',
            steps: [
              '创建ROS2策略节点',
              '订阅仿真状态话题',
              '发布硬件命令话题',
              '测试完整链路'
            ],
            expected: '通过ROS2可以运行策略',
            tips: [],
            blocked: true,
            reason: '需先完成 RL 训练阶段'
          },
          {
            id: 'debug-optimize',
            title: '调试和优化',
            difficulty: '高级',
            difficultyScore: 4,
            estimatedTime: '12小时',
            completed: false,
            current: false,
            description: '处理Sim2Real差距并优化性能',
            steps: [
              '识别策略失败场景',
              '分析失败原因',
              '调整仿真参数或训练',
              '重新部署并测试',
              '迭代优化直到满意'
            ],
            expected: '策略在硬件上表现接近仿真',
            tips: ['记录每次实验的参数和结果'],
            blocked: true,
            reason: '需先完成 RL 训练阶段'
          },
          {
            id: 'document-results',
            title: '记录结果',
            difficulty: '基础',
            difficultyScore: 2,
            estimatedTime: '2小时',
            completed: false,
            current: false,
            description: '记录Sim2Real过程和结果',
            steps: [
              '记录成功率和失败案例',
              '记录关键参数设置',
              '记录优化过程',
              '编写使用文档'
            ],
            expected: '有完整的实验报告',
            tips: [],
            blocked: true,
            reason: '需先完成 RL 训练阶段'
          }
        ]
      }
    ]
  })

  // 计算属性
  const stages = computed(() => learningPath.value.stages)
  const currentStageData = computed(() =>
    stages.value.find(s => s.id === currentStage.value)
  )

  // 计算总体进度
  const progressPercent = computed(() => {
    const totalTasks = stages.value.reduce((sum, stage) =>
      sum + stage.tasks.length, 0
    )
    const completedTasksCount = completedTasks.value.size
    return Math.round((completedTasksCount / totalTasks) * 100)
  })

  // 计算预估总学习时间
  const totalEstimatedHours = computed(() => {
    return stages.value.reduce((sum, stage) =>
      sum + (stage.estimatedHours || 0), 0
    )
  })

  // 获取所有资源
  const allResources = computed(() => learningPath.value.resources)

  // 获取教程
  const tutorials = computed(() => allResources.value.tutorials)

  // 获取视频教程
  const videos = computed(() => allResources.value.videos)

  // 获取实践项目
  const practiceProjects = computed(() => allResources.value.practiceProjects)

  // 获取阶段难度分布
  const difficultyDistribution = computed(() => {
    const dist = { '入门': 0, '基础': 0, '进阶': 0, '高级': 0 }
    stages.value.forEach(stage => {
      if (stage.difficulty) {
        dist[stage.difficulty]++
      }
    })
    return dist
  })

  // 获取阶段统计
  const stageStats = computed(() => {
    return stages.value.map(stage => {
      const completedCount = stage.tasks.filter(t =>
        completedTasks.value.has(t.id)
      ).length
      const totalCount = stage.tasks.length
      const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

      return {
        id: stage.id,
        title: stage.title,
        difficulty: stage.difficulty,
        estimatedHours: stage.estimatedHours,
        completedCount,
        totalCount,
        progress,
        isCompleted: completedCount === totalCount,
        isCurrent: stage.current
      }
    })
  })

  // 方法
  function markTaskComplete(taskId) {
    toggleTaskComplete(taskId, true)
  }

  function toggleTaskComplete(taskId, forceState = null) {
    const currentState = completedTasks.value.has(taskId)
    const newState = forceState !== null ? forceState : !currentState

    if (newState) {
      completedTasks.value.add(taskId)
    } else {
      completedTasks.value.delete(taskId)
    }

    // 更新任务状态
    stages.value.forEach(stage => {
      const task = stage.tasks.find(t => t.id === taskId)
      if (task) {
        task.completed = newState
      }
    })

    // 检查所有阶段的完成状态
    stages.value.forEach(stage => {
      const allComplete = stage.tasks.every(t =>
        completedTasks.value.has(t.id) || t.blocked
      )
      const wasComplete = stage.completed
      stage.completed = allComplete

      // 如果从未完成变为完成，移动到下一阶段
      if (allComplete && !wasComplete) {
        const nextIndex = stages.value.indexOf(stage) + 1
        if (nextIndex < stages.value.length) {
          const nextStage = stages.value[nextIndex]
          nextStage.current = true
          currentStage.value = nextStage.id
          stage.current = false
          // 更新下一阶段任务的 blocked 状态
          updateTaskBlockedStatus(nextStage)
        }
      }

      // 如果从完成变为未完成，可能需要调整当前阶段
      if (!allComplete && wasComplete && stage.current) {
        stage.current = true
      }
    })

    saveToLocalStorage()
  }

  /**
   * 更新任务的 blocked 状态
   */
  function updateTaskBlockedStatus(stage) {
    const stageIndex = stages.value.indexOf(stage)
    const prerequisites = stage.prerequisites || []

    // 检查前置阶段是否完成
    const prerequisitesMet = prerequisites.every(prereqId => {
      const prereqStage = stages.value.find(s => s.id === prereqId)
      return prereqStage && prereqStage.completed
    })

    // 更新任务的 blocked 状态
    stage.tasks.forEach(task => {
      task.blocked = !prerequisitesMet
      task.reason = !prerequisitesMet ? `需先完成 ${prerequisites.join('、')} 阶段` : ''
    })
  }

  function goToStage(stageId) {
    const stage = stages.value.find(s => s.id === stageId)
    if (!stage) return false

    // 移除前置条件检查 - 允许自由浏览任何阶段
    // 这样可以：
    // 1. 回顾已完成的阶段
    // 2. 预览未来的内容
    // 3. 灵活安排学习路径

    // 切换到目标阶段
    stages.value.forEach(s => s.current = false)
    stage.current = true
    currentStage.value = stageId

    saveToLocalStorage()
    return true
  }

  /**
   * 获取任务详情
   */
  function getTaskDetail(taskId) {
    for (const stage of stages.value) {
      const task = stage.tasks.find(t => t.id === taskId)
      if (task) {
        return {
          ...task,
          stageId: stage.id,
          stageTitle: stage.title
        }
      }
    }
    return null
  }

  /**
   * 获取阶段的任务列表
   */
  function getStageTasks(stageId) {
    const stage = stages.value.find(s => s.id === stageId)
    return stage ? stage.tasks : []
  }

  /**
   * 搜索任务
   */
  function searchTasks(query) {
    const results = []
    const lowerQuery = query.toLowerCase()

    stages.value.forEach(stage => {
      stage.tasks.forEach(task => {
        if (
          task.title.toLowerCase().includes(lowerQuery) ||
          task.description?.toLowerCase().includes(lowerQuery)
        ) {
          results.push({
            ...task,
            stageId: stage.id,
            stageTitle: stage.title
          })
        }
      })
    })

    return results
  }

  /**
   * 获取推荐资源
   */
  function getRecommendedResources(stageId) {
    const stage = stages.value.find(s => s.id === stageId)
    return stage?.resources || []
  }

  /**
   * 获取阶段难度颜色
   */
  function getDifficultyColor(difficulty) {
    const colors = {
      '入门': '#67c23a',
      '基础': '#409eff',
      '进阶': '#e6a23c',
      '高级': '#f56c6c'
    }
    return colors[difficulty] || '#909399'
  }

  function saveToLocalStorage() {
    const data = {
      currentStage: currentStage.value,
      completedTasks: Array.from(completedTasks.value),
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('aero-learning-progress', JSON.stringify(data))
  }

  function loadFromLocalStorage() {
    const saved = localStorage.getItem('aero-learning-progress')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        currentStage.value = data.currentStage || 'hardware'
        completedTasks.value = new Set(data.completedTasks || [])

        // 恢复阶段完成状态
        stages.value.forEach(stage => {
          const allComplete = stage.tasks.every(t =>
            completedTasks.value.has(t.id) || t.blocked
          )
          stage.completed = allComplete

          // 更新任务的完成状态
          stage.tasks.forEach(task => {
            task.completed = completedTasks.value.has(task.id)
          })
        })

        // 更新所有阶段的 blocked 状态
        stages.value.forEach(stage => {
          updateTaskBlockedStatus(stage)
        })
      } catch (e) {
        Logger.error(LOG_LABEL, '加载进度失败:', e)
      }
    }
  }

  /**
   * 重置学习进度
   */
  function resetProgress() {
    completedTasks.value.clear()
    stages.value.forEach(stage => {
      stage.completed = false
      stage.current = stage.id === 'hardware'
      stage.tasks.forEach(task => {
        task.completed = false
        // 第一个阶段的任务不 blocked，其他 blocked
        task.blocked = stage.id !== 'hardware'
        task.reason = stage.id !== 'hardware' ? '需先完成前一阶段' : ''
      })
    })
    currentStage.value = 'hardware'
    saveToLocalStorage()
  }

  // 初始化时加载
  loadFromLocalStorage()

  return {
    // 状态
    currentStage,
    completedTasks,
    learningPath,

    // 计算属性
    stages,
    currentStageData,
    progressPercent,
    totalEstimatedHours,
    allResources,
    tutorials,
    videos,
    practiceProjects,
    difficultyDistribution,
    stageStats,

    // 方法
    markTaskComplete,
    toggleTaskComplete,
    goToStage,
    getTaskDetail,
    getStageTasks,
    searchTasks,
    getRecommendedResources,
    getDifficultyColor,
    saveToLocalStorage,
    loadFromLocalStorage,
    resetProgress
  }
})
