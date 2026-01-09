import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLearningStore = defineStore('learning', () => {
  // 当前阶段
  const currentStage = ref('servo-config')

  // 已完成的任务
  const completedTasks = ref(new Set([
    'hardware-print',
    'hardware-assembly',
    'firmware-flash'
  ]))

  // 学习路径数据
  const learningPath = ref({
    stages: [
      {
        id: 'hardware',
        title: '硬件准备',
        icon: 'Box',
        completed: true,
        tasks: [
          { id: 'hardware-print', title: '3D打印零件', completed: true },
          { id: 'hardware-assembly', title: '机械组装', completed: true }
        ]
      },
      {
        id: 'firmware',
        title: '固件烧录',
        icon: 'Cpu',
        completed: true,
        tasks: [
          { id: 'firmware-flash', title: '烧录ESP32', completed: true }
        ]
      },
      {
        id: 'servo-config',
        title: '舵机配置',
        icon: 'Setting',
        completed: false,
        current: true,
        tasks: [
          {
            id: 'understand-servo',
            title: '理解舵机控制原理',
            completed: true,
            description: 'HLS3606M的PWM控制原理和4096级分辨率'
          },
          {
            id: 'config-endpoints',
            title: '配置端点',
            completed: false,
            current: true,
            description: '设置grasp_count和extend_count',
            steps: [
              '连接单个舵机到ESP32',
              '使用GUI找到手指伸直位置（extend_count）',
              '使用GUI找到手指最大弯曲位置（grasp_count）',
              '点击保存端点到ESP32'
            ],
            commands: ['python -m aero_open_sdk.gui_chinese'],
            expected: '舵机在0-4095范围内平稳运动，不碰到硬限位'
          },
          {
            id: 'test-sdk',
            title: '测试SDK控制',
            completed: false,
            blocked: true,
            reason: '需要所有7个舵机到齐',
            description: '使用SDK控制整个手执行动作序列'
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
            description: 'SDK、固件、硬件之间的关系'
          },
          {
            id: 'code-ecology',
            title: '官方代码生态',
            description: 'run_sequence.py等示例脚本的作用'
          },
          {
            id: 'run-examples',
            title: '运行示例脚本',
            blocked: true,
            reason: '需要完整组装的手'
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
            id: 'understand-xml',
            title: '理解XML模型',
            description: 'MuJoCo模型文件的结构和配置'
          },
          {
            id: 'realtime-control',
            title: '实时控制仿真',
            description: '不只是训练生成视频，要能交互式控制'
          },
          {
            id: 'test-policy',
            title: '手动测试策略',
            description: '逐步执行训练好的策略'
          }
        ]
      },
      {
        id: 'ros2',
        title: 'ROS2集成',
        icon: 'Connection',
        completed: false,
        tasks: [
          { id: 'understand-ros2', title: '理解ROS2作用', description: '为什么需要ROS2？能否不用？' },
          { id: 'setup-env', title: '搭建ROS2环境', description: '安装ROS2 Humble和Aero Hand包' },
          { id: 'run-nodes', title: '运行示例节点', description: '发布/订阅模式' }
        ]
      },
      {
        id: 'rl-training',
        title: 'RL训练',
        icon: 'TrendCharts',
        completed: false,
        tasks: [
          { id: 'understand-ppo', title: '理解PPO算法', description: '近端策略优化原理' },
          { id: 'config-training', title: '配置训练参数', description: '学习率、批量大小、域随机化等' },
          { id: 'monitor-training', title: '监控训练进度', description: '使用wandb查看指标' }
        ]
      },
      {
        id: 'sim2real',
        title: 'Sim2Real',
        icon: 'MagicStick',
        completed: false,
        tasks: [
          { id: 'understand-flow', title: '理解完整流程', description: '从仿真训练到硬件部署' },
          { id: 'deploy-sdk', title: '策略部署（SDK方式）', description: '直接用SDK部署策略' },
          { id: 'deploy-ros2', title: '策略部署（ROS2方式）', description: '通过ROS2节点部署' },
          { id: 'debug-optimize', title: '调试和优化', description: '处理Sim2Real差距' }
        ]
      },
      {
        id: 'migration',
        title: '迁移到自己的手',
        icon: 'Operation',
        completed: false,
        tasks: [
          { id: 'create-model', title: '建立MuJoCo模型', description: '从URDF到XML，添加肌腱配置' },
          { id: 'design-task', title: '设计RL任务', description: '拧螺丝的任务和奖励函数' },
          { id: 'implement-interface', title: '实现控制接口', description: 'CANFD+FOC与仿真策略的对接' }
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
    completedTasks.value.add(taskId)

    // 检查阶段是否完成
    const stage = stages.value.find(s =>
      s.tasks.some(t => t.id === taskId)
    )
    if (stage) {
      const allComplete = stage.tasks.every(t =>
        completedTasks.value.has(t.id) || t.blocked
      )
      if (allComplete) {
        stage.completed = true
        // 移动到下一阶段
        const nextIndex = stages.value.indexOf(stage) + 1
        if (nextIndex < stages.value.length) {
          const nextStage = stages.value[nextIndex]
          nextStage.current = true
          currentStage.value = nextStage.id
          stage.current = false
        }
      }
    }

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
    goToStage,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})
