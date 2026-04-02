/**
 * 成就系统 Store
 * 管理学习成就、徽章、进度追踪、统计数据等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Logger from '@/utils/logger.js'

const LOG_LABEL = 'AchievementsStore'

export const useAchievementsStore = defineStore('achievements', () => {
  // ========== 状态 ==========

  // 已解锁的成就 ID 集合
  const unlockedAchievements = ref(new Set())

  // 成就进度追踪
  const achievementProgress = ref({})

  // 学习统计数据
  const learningStats = ref({
    // 总学习时长（分钟）
    totalLearningMinutes: 0,
    // 连续学习天数
    streakDays: 0,
    // 最后学习日期
    lastStudyDate: null,
    // 完成的任务总数
    completedTasksCount: 0,
    // 完成的阶段总数
    completedStagesCount: 0,
    // 总学习次数
    totalStudySessions: 0,
    // 累计代码运行次数
    codeRunsCount: 0,
    // 累计查看文档次数
    docsViewsCount: 0
  })

  // 每日学习记录
  const dailyLearningRecords = ref([])

  // 学习会话记录
  const studySessions = ref([])

  // ========== 成就定义 ==========
  const achievementDefinitions = {
    // 任务完成类成就
    taskMilestones: {
      id: 'task-milestones',
      title: '任务里程碑',
      icon: '🎯',
      description: '完成任务的数量',
      milestones: [
        { count: 1, title: '初学者', icon: '🌱', description: '完成第一个任务' },
        { count: 5, title: '小试牛刀', icon: '⚔️', description: '完成5个任务' },
        { count: 10, title: '初露锋芒', icon: '✨', description: '完成10个任务' },
        { count: 20, title: '渐入佳境', icon: '🌟', description: '完成20个任务' },
        { count: 35, title: '学有所成', icon: '🏆', description: '完成35个任务' },
        { count: 50, title: '全能达人', icon: '👑', description: '完成50个任务' }
      ],
      type: 'task',
      category: 'progress'
    },

    // 阶段完成类成就
    stageCompletion: {
      id: 'stage-completion',
      title: '阶段征服者',
      icon: '🗺️',
      description: '完成学习阶段',
      stages: [
        { stageId: 'hardware', title: '硬件专家', icon: '🔧', description: '完成硬件准备阶段' },
        { stageId: 'firmware', title: '固件达人', icon: '💾', description: '完成固件烧录阶段' },
        { stageId: 'servo-config', title: '配置大师', icon: '⚙️', description: '完成舵机配置阶段' },
        { stageId: 'sdk-usage', title: 'SDK高手', icon: '📦', description: '完成SDK使用阶段' },
        { stageId: 'mujoco', title: '仿真专家', icon: '🔬', description: '完成MuJoCo仿真阶段' },
        { stageId: 'ros2', title: 'ROS2大师', icon: '🔗', description: '完成ROS2集成阶段' },
        { stageId: 'rl-training', title: 'RL研究者', icon: '🤖', description: '完成RL训练阶段' },
        { stageId: 'sim2real', title: '部署专家', icon: '🚀', description: '完成Sim2Real阶段' }
      ],
      type: 'stage',
      category: 'progress'
    },

    // 全阶段完成成就
    allStagesComplete: {
      id: 'all-stages-complete',
      title: '学习大师',
      icon: '🎓',
      description: '完成所有学习阶段',
      type: 'special',
      category: 'master',
      requirement: 8 // 需要完成8个阶段
    },

    // 学习时长成就
    learningTime: {
      id: 'learning-time',
      title: '时间投入',
      icon: '⏰',
      description: '累计学习时长',
      milestones: [
        { minutes: 30, title: '初学者', icon: '🕐', description: '学习30分钟' },
        { minutes: 120, title: '学习者', icon: '🕑', description: '学习2小时' },
        { minutes: 300, title: '勤奋者', icon: '🕒', description: '学习5小时' },
        { minutes: 600, title: '坚持者', icon: '🕓', description: '学习10小时' },
        { minutes: 1200, title: '时间旅者', icon: '🕕', description: '学习20小时' },
        { minutes: 2400, title: '时间大师', icon: '⏳', description: '学习40小时' }
      ],
      type: 'time',
      category: 'dedication'
    },

    // 连续学习成就
    streakAchievements: {
      id: 'streak-achievements',
      title: '持之以恒',
      icon: '🔥',
      description: '连续学习天数',
      milestones: [
        { days: 1, title: '第一天', icon: '🌅', description: '开始学习之旅' },
        { days: 3, title: '三日坊', icon: '📅', description: '连续学习3天' },
        { days: 7, title: '一周坚持', icon: '📆', description: '连续学习7天' },
        { days: 14, title: '双周达人', icon: '🗓️', description: '连续学习14天' },
        { days: 30, title: '月度学习者', icon: '�月', description: '连续学习30天' },
        { days: 100, title: '百日英雄', icon: '💯', description: '连续学习100天' }
      ],
      type: 'streak',
      category: 'dedication'
    },

    // 特定任务成就
    specialTasks: {
      id: 'special-tasks',
      title: '特殊成就',
      icon: '🏅',
      description: '完成特定挑战任务',
      achievements: [
        {
          id: 'first-hardware-task',
          title: '动手实践',
          icon: '🔨',
          description: '完成第一个硬件相关任务',
          taskId: 'hardware-assembly'
        },
        {
          id: 'first-code-run',
          title: '代码跑通',
          icon: '💻',
          description: '第一次成功运行示例代码',
          taskId: 'firmware-test'
        },
        {
          id: 'endpoint-config-master',
          title: '精准校准',
          icon: '🎯',
          description: '完成所有7个舵机的端点配置',
          taskId: 'config-all-servos'
        },
        {
          id: 'simulation-pioneer',
          title: '仿真先驱',
          icon: '🌐',
          description: '首次成功运行仿真模型',
          taskId: 'load-simulation'
        },
        {
          id: 'rl-beginner',
          title: 'RL入门',
          icon: '🧠',
          description: '理解强化学习基础概念',
          taskId: 'understand-rl'
        },
        {
          id: 'policy-trainer',
          title: '策略训练师',
          icon: '🏋️',
          description: '完成一次完整的RL训练',
          taskId: 'run-training'
        },
        {
          id: 'sim2real-expert',
          title: 'Sim2Real专家',
          icon: '🌉',
          description: '成功将策略部署到硬件',
          taskId: 'deploy-sdk'
        }
      ],
      type: 'special',
      category: 'challenge'
    },

    // 技能类成就
    skillMastery: {
      id: 'skill-mastery',
      title: '技能大师',
      icon: '🎖️',
      description: '掌握特定技能领域',
      skills: [
        {
          id: 'hardware-master',
          title: '硬件大师',
          icon: '🔧',
          skills: ['采购', '3D打印', '机械装配'],
          requirement: 3
        },
        {
          id: 'firmware-master',
          title: '固件大师',
          icon: '💾',
          skills: ['Arduino', 'ESP32', '串口通信'],
          requirement: 3
        },
        {
          id: 'sdk-master',
          title: 'SDK大师',
          icon: '📦',
          skills: ['Python', 'API设计', '异步编程'],
          requirement: 3
        },
        {
          id: 'simulation-master',
          title: '仿真大师',
          icon: '🔬',
          skills: ['MuJoCo', 'MJCF', '物理仿真', 'JAX'],
          requirement: 4
        },
        {
          id: 'rl-master',
          title: 'RL大师',
          icon: '🤖',
          skills: ['强化学习', 'PPO', '策略优化', 'MJX'],
          requirement: 4
        }
      ],
      type: 'skill',
      category: 'master'
    },

    // 探索类成就
    exploration: {
      id: 'exploration',
      title: '探索者',
      icon: '🧭',
      description: '探索学习资源的广度',
      achievements: [
        {
          id: 'resource-collector',
          title: '资源收集者',
          icon: '📚',
          description: '查看超过10个学习资源',
          requirement: 10
        },
        {
          id: 'video-watcher',
          title: '视频学习者',
          icon: '📺',
          description: '观看3个以上视频教程',
          requirement: 3
        },
        {
          id: 'doc-reader',
          title: '文档阅读者',
          icon: '📄',
          description: '阅读5篇以上技术文档',
          requirement: 5
        },
        {
          id: 'project-starter',
          title: '实践者',
          icon: '🚀',
          description: '开始一个实践项目',
          requirement: 1
        }
      ],
      type: 'exploration',
      category: 'exploration'
    },

    // 速度类成就
    speedAchievements: {
      id: 'speed-achievements',
      title: '速度之星',
      icon: '⚡',
      description: '快速完成学习任务',
      achievements: [
        {
          id: 'quick-starter',
          title: '快速启动',
          icon: '🚀',
          description: '在开始学习后1天内完成第一个阶段',
          daysLimit: 1
        },
        {
          id: 'speedy-learner',
          title: '高效学习',
          icon: '💨',
          description: '在开始学习后7天内完成前3个阶段',
          daysLimit: 7,
          stagesRequired: 3
        },
        {
          id: 'swift-master',
          title: '飞速大师',
          icon: '🌪️',
          description: '在开始学习后14天内完成前5个阶段',
          daysLimit: 14,
          stagesRequired: 5
        }
      ],
      type: 'speed',
      category: 'speed'
    },

    // 社区类成就（预留）
    community: {
      id: 'community',
      title: '社区贡献',
      icon: '👥',
      description: '社区互动和贡献',
      achievements: [
        {
          id: 'first-share',
          title: '知识分享',
          icon: '📢',
          description: '分享你的学习心得（预留）',
          available: false
        },
        {
          id: 'issue-reporter',
          title: '问题反馈',
          icon: '🐛',
          description: '反馈一个问题或建议（预留）',
          available: false
        }
      ],
      type: 'community',
      category: 'community'
    }
  }

  // ========== 计算属性 ==========

  /**
   * 所有已定义的成就列表
   */
  const allAchievements = computed(() => {
    const achievements = []

    // 任务里程碑
    achievementDefinitions.taskMilestones.milestones.forEach(m => {
      achievements.push({
        id: `${achievementDefinitions.taskMilestones.id}-${m.count}`,
        ...m,
        category: 'progress',
        progress: learningStats.value.completedTasksCount,
        target: m.count,
        unlocked: unlockedAchievements.value.has(`${achievementDefinitions.taskMilestones.id}-${m.count}`)
      })
    })

    // 阶段完成
    achievementDefinitions.stageCompletion.stages.forEach(s => {
      achievements.push({
        id: `${achievementDefinitions.stageCompletion.id}-${s.stageId}`,
        ...s,
        category: 'progress',
        unlocked: unlockedAchievements.value.has(`${achievementDefinitions.stageCompletion.id}-${s.stageId}`)
      })
    })

    // 学习时长
    achievementDefinitions.learningTime.milestones.forEach(m => {
      achievements.push({
        id: `${achievementDefinitions.learningTime.id}-${m.minutes}`,
        ...m,
        category: 'dedication',
        progress: learningStats.value.totalLearningMinutes,
        target: m.minutes,
        unlocked: unlockedAchievements.value.has(`${achievementDefinitions.learningTime.id}-${m.minutes}`)
      })
    })

    // 连续学习
    achievementDefinitions.streakAchievements.milestones.forEach(m => {
      achievements.push({
        id: `${achievementDefinitions.streakAchievements.id}-${m.days}`,
        ...m,
        category: 'dedication',
        progress: learningStats.value.streakDays,
        target: m.days,
        unlocked: unlockedAchievements.value.has(`${achievementDefinitions.streakAchievements.id}-${m.days}`)
      })
    })

    // 特殊任务
    achievementDefinitions.specialTasks.achievements.forEach(a => {
      achievements.push({
        id: a.id,
        ...a,
        category: 'challenge',
        unlocked: unlockedAchievements.value.has(a.id)
      })
    })

    // 探索类
    achievementDefinitions.exploration.achievements.forEach(a => {
      achievements.push({
        id: a.id,
        ...a,
        category: 'exploration',
        unlocked: unlockedAchievements.value.has(a.id)
      })
    })

    // 速度类
    achievementDefinitions.speedAchievements.achievements.forEach(a => {
      achievements.push({
        id: a.id,
        ...a,
        category: 'speed',
        unlocked: unlockedAchievements.value.has(a.id)
      })
    })

    // 全阶段完成
    achievements.push({
      id: achievementDefinitions.allStagesComplete.id,
      ...achievementDefinitions.allStagesComplete,
      category: 'master',
      progress: learningStats.value.completedStagesCount,
      target: achievementDefinitions.allStagesComplete.requirement,
      unlocked: unlockedAchievements.value.has(achievementDefinitions.allStagesComplete.id)
    })

    return achievements
  })

  /**
   * 已解锁的成就
   */
  const unlockedAchievementList = computed(() =>
    allAchievements.value.filter(a => a.unlocked)
  )

  /**
   * 已锁定但可解锁的成就
   */
  const lockedAchievements = computed(() =>
    allAchievements.value.filter(a => !a.unlocked && !a.available === false)
  )

  /**
   * 已解锁成就数量
   */
  const unlockedCount = computed(() => unlockedAchievementList.value.length)

  /**
   * 总成就数量
   */
  const totalCount = computed(() => allAchievements.value.length)

  /**
   * 成就解锁进度百分比
   */
  const achievementProgressPercent = computed(() => {
    if (totalCount.value === 0) return 0
    return Math.round((unlockedCount.value / totalCount.value) * 100)
  })

  /**
   * 按类别分组的成就
   */
  const achievementsByCategory = computed(() => {
    const grouped = {
      progress: [],
      dedication: [],
      challenge: [],
      exploration: [],
      speed: [],
      master: [],
      community: []
    }

    allAchievements.value.forEach(a => {
      if (grouped[a.category]) {
        grouped[a.category].push(a)
      }
    })

    return grouped
  })

  /**
   * 当前可解锁的成就推荐
   */
  const recommendedAchievements = computed(() => {
    return allAchievements.value
      .filter(a => !a.unlocked && !a.available === false)
      .sort((a, b) => {
        // 优先排序有进度的成就
        const aProgress = a.progress !== undefined ? a.progress / a.target : 0
        const bProgress = b.progress !== undefined ? b.progress / b.target : 0
        return bProgress - aProgress
      })
      .slice(0, 3)
  })

  // ========== 方法 ==========

  /**
   * 解锁成就
   */
  function unlockAchievement(achievementId) {
    if (!unlockedAchievements.value.has(achievementId)) {
      unlockedAchievements.value.add(achievementId)
      saveToLocalStorage()
      Logger.info(LOG_LABEL, `成就解锁: ${achievementId}`)
      return true
    }
    return false
  }

  /**
   * 检查并更新成就状态
   */
  function checkAchievements() {
    const stats = learningStats.value

    // 检查任务里程碑
    achievementDefinitions.taskMilestones.milestones.forEach(m => {
      if (stats.completedTasksCount >= m.count) {
        unlockAchievement(`${achievementDefinitions.taskMilestones.id}-${m.count}`)
      }
    })

    // 检查学习时长
    achievementDefinitions.learningTime.milestones.forEach(m => {
      if (stats.totalLearningMinutes >= m.minutes) {
        unlockAchievement(`${achievementDefinitions.learningTime.id}-${m.minutes}`)
      }
    })

    // 检查连续学习
    achievementDefinitions.streakAchievements.milestones.forEach(m => {
      if (stats.streakDays >= m.days) {
        unlockAchievement(`${achievementDefinitions.streakAchievements.id}-${m.days}`)
      }
    })

    // 检查探索类成就
    const exploration = achievementDefinitions.exploration.achievements
    exploration.forEach(a => {
      if (a.id === 'resource-collector' && stats.docsViewsCount >= 10) {
        unlockAchievement('resource-collector')
      }
      if (a.id === 'video-watcher' && stats.codeRunsCount >= 3) {
        unlockAchievement('video-watcher')
      }
      if (a.id === 'doc-reader' && stats.docsViewsCount >= 5) {
        unlockAchievement('doc-reader')
      }
    })
  }

  /**
   * 更新任务完成数
   */
  function updateTaskCount(count) {
    learningStats.value.completedTasksCount = count
    checkAchievements()
    saveToLocalStorage()
  }

  /**
   * 增加任务完成数
   */
  function incrementTaskCount() {
    learningStats.value.completedTasksCount++
    checkAchievements()
    saveToLocalStorage()
  }

  /**
   * 更新阶段完成数
   */
  function updateStageCount(count) {
    learningStats.value.completedStagesCount = count
    checkAchievements()
    saveToLocalStorage()
  }

  /**
   * 增加学习时长
   */
  function addLearningTime(minutes) {
    learningStats.value.totalLearningMinutes += minutes
    updateStreak()
    checkAchievements()
    saveToLocalStorage()
  }

  /**
   * 更新连续学习天数
   */
  function updateStreak() {
    const today = new Date().toDateString()
    const lastDate = learningStats.value.lastStudyDate

    if (lastDate === today) {
      // 今天已经学习过，不更新连续天数
      return
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (lastDate === yesterday.toDateString()) {
      // 昨天学习过，连续天数+1
      learningStats.value.streakDays++
    } else if (lastDate !== today) {
      // 昨天没学习，重新开始
      learningStats.value.streakDays = 1
    }

    learningStats.value.lastStudyDate = today
    checkAchievements()
  }

  /**
   * 开始一个学习会话
   */
  function startStudySession() {
    const session = {
      id: Date.now().toString(),
      startTime: Date.now(),
      tasks: []
    }
    studySessions.value.push(session)
    learningStats.value.totalStudySessions++
    return session.id
  }

  /**
   * 结束学习会话
   */
  function endStudySession(sessionId, tasksCompleted = 0) {
    const session = studySessions.value.find(s => s.id === sessionId)
    if (session) {
      session.endTime = Date.now()
      session.duration = (session.endTime - session.startTime) / 1000 / 60 // 分钟
      session.tasks = tasksCompleted

      // 更新每日记录
      updateDailyRecord(session)
    }
  }

  /**
   * 更新每日学习记录
   */
  function updateDailyRecord(session) {
    const today = new Date().toDateString()
    let todayRecord = dailyLearningRecords.value.find(r => r.date === today)

    if (!todayRecord) {
      todayRecord = {
        date: today,
        totalMinutes: 0,
        sessionsCount: 0,
        tasksCompleted: 0
      }
      dailyLearningRecords.value.push(todayRecord)
    }

    todayRecord.totalMinutes += session.duration || 0
    todayRecord.sessionsCount++
    todayRecord.tasksCompleted += session.tasks || 0
  }

  /**
   * 增加代码运行计数
   */
  function incrementCodeRuns() {
    learningStats.value.codeRunsCount++
    checkAchievements()
    saveToLocalStorage()
  }

  /**
   * 增加文档查看计数
   */
  function incrementDocsViews() {
    learningStats.value.docsViewsCount++
    checkAchievements()
    saveToLocalStorage()
  }

  /**
   * 获取成就详情
   */
  function getAchievementDetail(achievementId) {
    return allAchievements.value.find(a => a.id === achievementId)
  }

  /**
   * 获取成就图标 URL（用于显示）
   */
  function getAchievementIcon(achievement) {
    return achievement.icon || '🏆'
  }

  /**
   * 获取成就解锁奖励描述
   */
  function getAchievementReward(achievement) {
    const rewards = {
      'task-milestones': '解锁新称号',
      'learning-time': '获得"时间投入"徽章',
      'streak-achievements': '获得"持之以恒"徽章',
      'special-tasks': '获得特殊成就称号',
      'all-stages-complete': '成为学习大师！'
    }
    return rewards[achievement.id] || '解锁新成就'
  }

  /**
   * 获取特定任务的成就
   */
  function getTaskAchievement(taskId) {
    const specialTasks = achievementDefinitions.specialTasks.achievements
    return specialTasks.find(a => a.taskId === taskId)
  }

  /**
   * 检查特定任务成就是否可以解锁
   */
  function checkTaskAchievement(taskId) {
    const achievement = getTaskAchievement(taskId)
    if (achievement && !unlockedAchievements.value.has(achievement.id)) {
      unlockAchievement(achievement.id)
      return achievement
    }
    return null
  }

  /**
   * 获取统计数据摘要
   */
  function getStatsSummary() {
    const stats = learningStats.value
    const hours = Math.floor(stats.totalLearningMinutes / 60)
    const minutes = stats.totalLearningMinutes % 60

    return {
      totalTime: hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`,
      streakDays: stats.streakDays,
      completedTasks: stats.completedTasksCount,
      completedStages: stats.completedStagesCount,
      unlockedAchievements: unlockedCount.value,
      totalAchievements: totalCount.value
    }
  }

  /**
   * 重置所有进度
   */
  function resetAllProgress() {
    unlockedAchievements.value.clear()
    achievementProgress.value = {}
    learningStats.value = {
      totalLearningMinutes: 0,
      streakDays: 0,
      lastStudyDate: null,
      completedTasksCount: 0,
      completedStagesCount: 0,
      totalStudySessions: 0,
      codeRunsCount: 0,
      docsViewsCount: 0
    }
    dailyLearningRecords.value = []
    studySessions.value = []
    saveToLocalStorage()
  }

  /**
   * 保存到本地存储
   */
  function saveToLocalStorage() {
    try {
      const data = {
        unlockedAchievements: Array.from(unlockedAchievements.value),
        achievementProgress: achievementProgress.value,
        learningStats: learningStats.value,
        dailyLearningRecords: dailyLearningRecords.value,
        studySessions: studySessions.value,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('aero-achievements', JSON.stringify(data))
    } catch (error) {
      Logger.error(LOG_LABEL, '保存成就状态失败:', error)
    }
  }

  /**
   * 从本地存储加载
   */
  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('aero-achievements')
      if (saved) {
        const data = JSON.parse(saved)
        unlockedAchievements.value = new Set(data.unlockedAchievements || [])
        achievementProgress.value = data.achievementProgress || {}
        learningStats.value = {
          ...learningStats.value,
          ...data.learningStats
        }
        dailyLearningRecords.value = data.dailyLearningRecords || []
        studySessions.value = data.studySessions || []
      }
    } catch (error) {
      Logger.error(LOG_LABEL, '加载成就状态失败:', error)
    }
  }

  // 初始化时加载
  loadFromLocalStorage()

  return {
    // 状态
    unlockedAchievements,
    achievementProgress,
    learningStats,
    dailyLearningRecords,
    studySessions,
    achievementDefinitions,

    // 计算属性
    allAchievements,
    unlockedAchievementList,
    lockedAchievements,
    unlockedCount,
    totalCount,
    achievementProgressPercent,
    achievementsByCategory,
    recommendedAchievements,

    // 方法
    unlockAchievement,
    checkAchievements,
    updateTaskCount,
    incrementTaskCount,
    updateStageCount,
    addLearningTime,
    updateStreak,
    startStudySession,
    endStudySession,
    incrementCodeRuns,
    incrementDocsViews,
    getAchievementDetail,
    getAchievementIcon,
    getAchievementReward,
    getTaskAchievement,
    checkTaskAchievement,
    getStatsSummary,
    resetAllProgress,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})
