import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLearningStore = defineStore('learning', () => {
  // 当前阶段
  const currentStage = ref('hardware')

  // 已完成的任务 - 从空开始，让用户自己选择
  const completedTasks = ref(new Set())

  // 学习路径数据
  const learningPath = ref({
    stages: [
      {
        id: 'hardware',
        title: '硬件准备',
        icon: 'Box',
        completed: false,
        current: true,
        tasks: [
          {
            id: 'hardware-buy-parts',
            title: '购买电子元件',
            completed: false,
            description: '购买ESP32-S3开发板和7个HLS3606M舵机',
            steps: [
              '购买ESP32-S3 DevKitC-1开发板（或兼容板）',
              '购买7个 Feetech HLS3606M 智能总线舵机',
              '购买5V 4A电源适配器',
              '购买舵机连接线束'
            ],
            expected: '所有电子元件到手，准备开始3D打印'
          },
          {
            id: 'hardware-print',
            title: '3D打印零件',
            completed: false,
            description: '打印所有机械结构零件',
            steps: [
              '下载STL文件（硬件/CAD/3D_print/）',
              '检查PLA材料是否充足（约500g）',
              '打印手掌零件（约6小时）',
              '打印5个手指零件（每个约2小时）',
              '检查打印质量，确保无翘曲、无断层'
            ],
            commands: ['cura aero_hand.stl', 'prusaslicer aero_hand.stl'],
            expected: '所有3D打印零件完成，支撑已清理'
          },
          {
            id: 'hardware-assembly',
            title: '机械组装',
            completed: false,
            description: '组装机械手的骨骼结构',
            steps: [
              '将舵机安装到手指关节中',
              '连接肌腱线到舵机摇臂',
              '组装手掌框架',
              '安装手指到手掌',
              '检查所有关节是否顺畅'
            ],
            expected: '机械手组装完成，手指可以手动弯曲'
          },
          {
            id: 'hardware-wiring',
            title: '电气连接',
            completed: false,
            description: '连接舵机到ESP32并供电',
            steps: [
              '按照官方接线图连接舵机数据线',
              '连接所有舵机VCC到5V电源',
              '连接所有舵机GND到公共地',
              '为ESP32供电',
              '用扎线整理线缆'
            ],
            expected: '上电后舵机指示灯正常亮起'
          }
        ]
      },
      {
        id: 'firmware',
        title: '固件烧录',
        icon: 'Cpu',
        completed: false,
        tasks: [
          {
            id: 'firmware-install-arduino',
            title: '安装Arduino IDE',
            completed: false,
            description: '安装Arduino开发环境和ESP32支持',
            steps: [
              '下载Arduino IDE 2.x',
              '安装ESP32开发板支持',
              '安装USB转串口驱动（CH340）'
            ],
            commands: ['arduino-cli version'],
            expected: 'Arduino IDE可以识别ESP32-S3开发板'
          },
          {
            id: 'firmware-open-project',
            title: '打开固件项目',
            completed: false,
            description: '从GitHub克隆或下载固件代码',
            steps: [
              '克隆 aero-hand-open 仓库',
              '用Arduino IDE打开 firmware/main/firmware_v0.1.0.ino',
              '检查依赖库是否已安装'
            ],
            commands: ['git clone https://github.com/tether-ia/aero-hand-open.git'],
            expected: '固件项目在Arduino IDE中正常打开'
          },
          {
            id: 'firmware-config',
            title: '配置固件参数',
            completed: false,
            description: '设置正确的串口波特率和舵机ID',
            steps: [
              '打开 HandConfig.h 文件',
              '确认 SERIAL_BAUD 设置为 921600',
              '确认舵机ID映射正确（1-5手指，6手腕，7拇指）'
            ],
            expected: '固件配置参数确认无误'
          },
          {
            id: 'firmware-flash',
            title: '编译并烧录固件',
            completed: false,
            description: '将固件上传到ESP32',
            steps: [
              '用USB线连接ESP32到电脑',
              '在Arduino IDE选择正确的COM端口',
              '点击"上传"按钮',
              '等待编译和上传完成'
            ],
            commands: ['arduino-cli compile --fqbn esp32:esp32:esp32s3'],
            expected: 'IDE显示"上传成功"，串口监视器可以看到启动信息'
          },
          {
            id: 'firmware-test',
            title: '测试串口通信',
            completed: false,
            description: '验证ESP32固件正常运行',
            steps: [
              '打开串口监视器（波特率921600）',
              '发送命令: 01 10 00 00 00 02 04 00 00 10 00',
              '观察舵机是否有反应',
              '检查返回数据是否正确'
            ],
            commands: ['echo "Test serial communication"'],
            expected: '串口通信正常，舵机响应命令'
          }
        ]
      },
      {
        id: 'servo-config',
        title: '舵机配置',
        icon: 'Setting',
        completed: false,
        tasks: [
          {
            id: 'understand-servo',
            title: '理解舵机控制原理',
            completed: false,
            description: 'HLS3606M的PWM控制原理和4096级分辨率',
            steps: [
              '阅读HLS3606M数据手册',
              '理解0-4095控制范围',
              '理解串口通信协议（UART）',
              '理解多舵机级联原理'
            ],
            expected: '明白如何通过串口命令控制舵机位置'
          },
          {
            id: 'install-sdk',
            title: '安装Python SDK',
            completed: false,
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
            expected: '可以导入aero_open_sdk模块'
          },
          {
            id: 'config-endpoints',
            title: '配置单个舵机端点',
            completed: false,
            description: '设置grasp_count和extend_count',
            steps: [
              '连接单个舵机到ESP32',
              '使用GUI找到手指伸直位置（extend_count）',
              '使用GUI找到手指最大弯曲位置（grasp_count）',
              '点击保存端点到ESP32',
              '测试端点是否保存成功'
            ],
            commands: ['python -m aero_open_sdk.gui_chinese'],
            expected: '舵机在0-4095范围内平稳运动，不碰到硬限位'
          },
          {
            id: 'config-all-servos',
            title: '配置所有舵机',
            completed: false,
            description: '为7个舵机分别配置端点',
            steps: [
              '依次连接每个舵机',
              '为每个舵机配置extend_count',
              '为每个舵机配置grasp_count',
              '保存所有配置到ESP32',
              '验证配置文件已保存'
            ],
            expected: '所有舵机端点配置完成并保存'
          },
          {
            id: 'test-sdk',
            title: '测试SDK控制',
            completed: false,
            description: '使用SDK控制整个手执行动作序列',
            steps: [
              '编写简单控制脚本',
              '控制单个手指弯曲伸直',
              '控制所有手指同时动作',
              '测试预定义姿势（张开、握拳等）'
            ],
            commands: ['python -c "from aero_open_sdk import AeroHand; h = AeroHand(); h.open()"'],
            expected: '机械手响应所有SDK命令'
          }
        ]
      },
      {
        id: 'sdk-usage',
        title: 'SDK使用',
        icon: 'Files',
        completed: false,
        tasks: [
          {
            id: 'understand-arch',
            title: '理解代码架构',
            completed: false,
            description: 'SDK、固件、硬件之间的关系',
            steps: [
              '阅读SDK源码结构',
              '理解AeroHand类的作用',
              '理解串口通信协议',
              '理解命令帧格式'
            ],
            expected: '明白整个软件栈的工作原理'
          },
          {
            id: 'explore-examples',
            title: '探索官方示例代码',
            completed: false,
            description: '学习SDK的使用方式',
            steps: [
              '查看sdk/examples/目录',
              '阅读run_sequence.py',
              '阅读teleoperation.py',
              '理解每个示例的功能'
            ],
            commands: ['ls sdk/examples/'],
            expected: '了解SDK的主要功能API'
          },
          {
            id: 'run-examples',
            title: '运行示例脚本',
            completed: false,
            description: '实际运行官方示例程序',
            steps: [
              '连接机械手到电脑',
              '运行run_sequence.py',
              '观察机械手执行动作',
              '尝试修改动作序列'
            ],
            commands: ['python sdk/examples/run_sequence.py'],
            expected: '机械手按照示例代码执行动作'
          },
          {
            id: 'write-custom-script',
            title: '编写自定义控制脚本',
            completed: false,
            description: '使用SDK创建自己的控制程序',
            steps: [
              '创建新的Python脚本',
              '导入AeroHand类',
              '编写自定义动作序列',
              '测试并调试'
            ],
            expected: '成功运行自定义控制脚本'
          }
        ]
      },
      {
        id: 'mujoco',
        title: 'MuJoCo仿真',
        icon: 'Monitor',
        completed: false,
        tasks: [
          {
            id: 'understand-mujoco',
            title: '理解MuJoCo基础',
            completed: false,
            description: 'MuJoCo物理引擎的基本概念',
            steps: [
              '了解MuJoCo是什么',
              '理解MJX（JAX后端）',
              '理解物理仿真原理'
            ],
            expected: '明白MuJoCo的作用和优势'
          },
          {
            id: 'understand-xml',
            title: '理解XML模型',
            completed: false,
            description: 'MuJoCo模型文件的结构和配置',
            steps: [
              '阅读sim_rl/simulation/aero_hand.xml',
              '理解geom（几何体）定义',
              '理解joint（关节）定义',
              '理解actuator（执行器）定义',
              '理解tendon（肌腱）定义'
            ],
            expected: '理解MuJoCo XML模型结构'
          },
          {
            id: 'install-mujoco',
            title: '安装MuJoCo环境',
            completed: false,
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
            expected: '可以成功导入mujoco模块'
          },
          {
            id: 'load-simulation',
            title: '加载仿真模型',
            completed: false,
            description: '用Python加载Aero Hand模型',
            steps: [
              '编写Python脚本加载XML',
              '创建仿真环境',
              '渲染初始状态',
              '检查模型是否正确加载'
            ],
            commands: ['python -c "import mujoco; mj_model = mujoco.MjModel.from_xml_path(\'aero_hand.xml\')"'],
            expected: '可以看到Aero Hand的3D模型'
          },
          {
            id: 'realtime-control',
            title: '实时控制仿真',
            completed: false,
            description: '交互式控制仿真模型',
            steps: [
              '编写控制循环',
              '从键盘获取输入',
              '设置目标关节角度',
              '观察仿真响应'
            ],
            expected: '可以实时控制仿真中的机械手'
          },
          {
            id: 'test-policy',
            title: '测试预训练策略',
            completed: false,
            description: '加载并运行训练好的策略',
            steps: [
              '下载预训练策略权重',
              '加载策略网络',
              '运行策略推理',
              '观察机械手行为'
            ],
            expected: '策略能控制机械手完成指定任务'
          }
        ]
      },
      {
        id: 'ros2',
        title: 'ROS2集成',
        icon: 'Connection',
        completed: false,
        tasks: [
          {
            id: 'understand-ros2',
            title: '理解ROS2作用',
            completed: false,
            description: '为什么需要ROS2？能否不用？',
            steps: [
              '学习ROS2的基本概念',
              '理解节点、话题、服务',
              '理解发布/订阅模式',
              '评估是否需要ROS2'
            ],
            expected: '明白ROS2在项目中的作用'
          },
          {
            id: 'setup-ros2',
            title: '搭建ROS2环境',
            completed: false,
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
            expected: 'ROS2环境可以正常运行'
          },
          {
            id: 'run-nodes',
            title: '运行示例节点',
            completed: false,
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
            expected: '可以通过ROS2控制机械手'
          },
          {
            id: 'understand-topics',
            title: '理解话题消息',
            completed: false,
            description: '理解ROS2消息格式',
            steps: [
              '查看话题列表',
              '查看消息类型',
              '观察话题数据',
              '理解消息结构'
            ],
            commands: ['ros2 topic list', 'ros2 topic echo /hand_commands'],
            expected: '明白ROS2消息如何映射到SDK命令'
          }
        ]
      },
      {
        id: 'rl-training',
        title: 'RL训练',
        icon: 'TrendCharts',
        completed: false,
        tasks: [
          {
            id: 'understand-rl',
            title: '理解强化学习基础',
            completed: false,
            description: 'RL的核心概念',
            steps: [
              '理解智能体、环境、奖励',
              '理解策略、价值函数',
              '理解马尔可夫决策过程（MDP）',
              '理解探索与利用'
            ],
            expected: '掌握RL的基本术语和原理'
          },
          {
            id: 'understand-ppo',
            title: '理解PPO算法',
            completed: false,
            description: '近端策略优化原理',
            steps: [
              '阅读PPO论文摘要',
              '理解策略梯度方法',
              '理解裁剪目标函数',
              '理解优势函数估计'
            ],
            expected: '明白PPO为什么有效'
          },
          {
            id: 'explore-code',
            title: '探索训练代码',
            completed: false,
            description: '理解训练代码结构',
            steps: [
              '查看sim_rl/mujoco_playground/learning/',
              '理解训练循环',
              '理解环境定义',
              '理解奖励函数'
            ],
            expected: '找到训练入口和配置文件'
          },
          {
            id: 'config-training',
            title: '配置训练参数',
            completed: false,
            description: '设置学习率、批量大小、域随机化等',
            steps: [
              '找到训练配置文件',
              '设置学习率',
              '设置批量大小',
              '配置域随机化参数',
              '设置训练总步数'
            ],
            expected: '配置文件准备好，可以开始训练'
          },
          {
            id: 'setup-wandb',
            title: '配置监控工具',
            completed: false,
            description: '设置wandb监控训练进度',
            steps: [
              '注册wandb账号',
              '安装wandb库',
              '登录wandb',
              '配置项目名称'
            ],
            commands: ['pip install wandb', 'wandb login'],
            expected: 'wandb已配置，可以记录训练指标'
          },
          {
            id: 'run-training',
            title: '运行训练',
            completed: false,
            description: '启动强化学习训练',
            steps: [
              '启动训练脚本',
              '监控GPU使用情况',
              '观察训练曲线',
              '等待训练完成'
            ],
            commands: ['python train.py --env aero_hand'],
            expected: '训练正常进行，指标在wandb上可见'
          },
          {
            id: 'monitor-training',
            title: '监控和分析训练',
            completed: false,
            description: '分析训练结果',
            steps: [
              '查看wandb仪表板',
              '分析奖励曲线',
              '分析成功率曲线',
              '判断是否需要调整参数'
            ],
            expected: '能判断训练是否收敛'
          },
          {
            id: 'evaluate-policy',
            title: '评估训练策略',
            completed: false,
            description: '测试训练好的策略',
            steps: [
              '加载训练好的checkpoint',
              '运行策略推理',
              '统计成功率',
              '可视化失败案例'
            ],
            expected: '策略在测试集上表现良好'
          }
        ]
      },
      {
        id: 'sim2real',
        title: 'Sim2Real',
        icon: 'MagicStick',
        completed: false,
        tasks: [
          {
            id: 'understand-sim2real',
            title: '理解Sim2Real挑战',
            completed: false,
            description: '从仿真到实物的差距来源',
            steps: [
              '理解物理差距',
              '理解视觉差距',
              '理解延迟差距',
              '理解域随机化的作用'
            ],
            expected: '明白Sim2Real的核心挑战'
          },
          {
            id: 'understand-flow',
            title: '理解完整流程',
            completed: false,
            description: '从仿真训练到硬件部署的完整链路',
            steps: [
              '理解训练阶段',
              '理解策略导出',
              '理解部署方式',
              '理解调试流程'
            ],
            expected: '掌握端到端的Sim2Real流程'
          },
          {
            id: 'export-policy',
            title: '导出策略模型',
            completed: false,
            description: '将训练好的策略导出为可用格式',
            steps: [
              '提取策略网络权重',
              '转换为推理格式',
              '测试推理速度',
              '验证输出正确性'
            ],
            expected: '策略模型可以独立加载和推理'
          },
          {
            id: 'deploy-sdk',
            title: '策略部署（SDK方式）',
            completed: false,
            description: '直接用SDK部署策略',
            steps: [
              '编写部署脚本',
              '加载策略模型',
              '获取仿真状态',
              '推理并控制硬件',
              '测试端到端延迟'
            ],
            expected: '策略能实时控制硬件机械手'
          },
          {
            id: 'deploy-ros2',
            title: '策略部署（ROS2方式）',
            completed: false,
            description: '通过ROS2节点部署策略',
            steps: [
              '创建ROS2策略节点',
              '订阅仿真状态话题',
              '发布硬件命令话题',
              '测试完整链路'
            ],
            expected: '通过ROS2可以运行策略'
          },
          {
            id: 'debug-optimize',
            title: '调试和优化',
            completed: false,
            description: '处理Sim2Real差距并优化性能',
            steps: [
              '识别策略失败场景',
              '分析失败原因',
              '调整仿真参数或训练',
              '重新部署并测试',
              '迭代优化直到满意'
            ],
            expected: '策略在硬件上表现接近仿真'
          },
          {
            id: 'document-results',
            title: '记录结果',
            completed: false,
            description: '记录Sim2Real过程和结果',
            steps: [
              '记录成功率和失败案例',
              '记录关键参数设置',
              '记录优化过程',
              '编写使用文档'
            ],
            expected: '有完整的实验报告'
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

  const progressPercent = computed(() => {
    const totalTasks = stages.value.reduce((sum, stage) =>
      sum + stage.tasks.length, 0
    )
    const completedTasksCount = completedTasks.value.size
    return Math.round((completedTasksCount / totalTasks) * 100)
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
        }
      }

      // 如果从完成变为未完成，可能需要调整当前阶段
      if (!allComplete && wasComplete && stage.current) {
        // 保持当前阶段为这个阶段
        stage.current = true
      }
    })

    saveToLocalStorage()
  }

  function goToStage(stageId) {
    const stage = stages.value.find(s => s.id === stageId)
    if (!stage) return

    // ✅ 移除前置条件检查 - 允许自由浏览任何阶段
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
        })
      } catch (e) {
        console.error('加载进度失败:', e)
      }
    }
  }

  // 初始化时加载
  loadFromLocalStorage()

  return {
    currentStage,
    completedTasks,
    learningPath,
    stages,
    currentStageData,
    progressPercent,
    markTaskComplete,
    toggleTaskComplete,
    goToStage,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})
