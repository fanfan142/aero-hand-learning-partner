/**
 * 任务管理 Store
 * 管理学习任务、进度、笔记等
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { detailedTaskTree } from '@/data/detailed-tasks.js'
import Logger from '@/utils/logger.js'

const LOG_LABEL = 'TasksStore'

export const useTasksStore = defineStore('tasks', () => {
  // ========== 状态 ==========
  const taskTree = ref(detailedTaskTree)
  const completedTasks = ref(new Set())
  const skippedTasks = ref(new Set())
  const currentTaskId = ref(null)
  const taskNotes = ref({})
  const taskProgress = ref({})

  // ========== 计算属性 ==========

  /**
   * 所有任务列表（扁平化）
   */
  const allTasks = computed(() => {
    const tasks = []

    function traverse(node) {
      if (node.type === 'task') {
        tasks.push(node)
      }
      if (node.children) {
        node.children.forEach(traverse)
      }
    }

    taskTree.value.forEach(traverse)
    return tasks
  })

  /**
   * 完成的任务数量
   */
  const completedCount = computed(() => completedTasks.value.size)

  /**
   * 总任务数量
   */
  const totalCount = computed(() => allTasks.value.length)

  /**
   * 完成进度百分比
   */
  const progressPercent = computed(() => {
    if (totalCount.value === 0) return 0
    return Math.round((completedCount.value / totalCount.value) * 100)
  })

  /**
   * 当前任务详情
   */
  const currentTask = computed(() => {
    if (!currentTaskId.value) return null
    return findTaskById(taskTree.value, currentTaskId.value)
  })

  /**
   * 可执行的任务列表（无依赖或依赖已满足）
   */
  const availableTasks = computed(() => {
    return allTasks.value.filter(task => {
      // 如果已完成，不显示
      if (completedTasks.value.has(task.id)) return false
      // 如果已跳过，仍显示（允许撤销）
      return true
    })
  })

  /**
   * 依赖未满足的任务
   */
  const blockedTasks = computed(() => {
    return allTasks.value.filter(task => {
      if (completedTasks.value.has(task.id)) return false

      // 检查依赖
      if (task.dependencies && task.dependencies.length > 0) {
        return task.dependencies.some(dep => !completedTasks.value.has(dep))
      }
      return false
    })
  })

  // ========== 方法 ==========

  /**
   * 根据ID查找任务
   * @param {Array} nodes - 节点数组
   * @param {string} taskId - 任务ID
   * @returns {Object|null} 任务对象
   */
  function findTaskById(nodes, taskId) {
    for (const node of nodes) {
      if (node.id === taskId) return node
      if (node.children) {
        const found = findTaskById(node.children, taskId)
        if (found) return found
      }
    }
    return null
  }

  /**
   * 获取任务依赖状态
   * @param {string} taskId - 任务ID
   * @returns {Object} 依赖状态
   */
  function getTaskDependencies(taskId) {
    const task = findTaskById(taskTree.value, taskId)
    if (!task || !task.dependencies) return { all: true, satisfied: [], unsatisfied: [] }

    const satisfied = []
    const unsatisfied = []

    task.dependencies.forEach(depId => {
      if (completedTasks.value.has(depId)) {
        satisfied.push(depId)
      } else {
        unsatisfied.push(depId)
      }
    })

    return {
      all: unsatisfied.length === 0,
      satisfied,
      unsatisfied
    }
  }

  /**
   * 切换任务完成状态
   * @param {string} taskId - 任务ID
   */
  function toggleTaskComplete(taskId) {
    if (completedTasks.value.has(taskId)) {
      completedTasks.value.delete(taskId)
    } else {
      completedTasks.value.add(taskId)
      // 从跳过列表中移除
      skippedTasks.value.delete(taskId)
    }
    saveToLocalStorage()
  }

  /**
   * 标记任务为完成
   * @param {string} taskId - 任务ID
   */
  function markTaskComplete(taskId) {
    completedTasks.value.add(taskId)
    skippedTasks.value.delete(taskId)
    saveToLocalStorage()
  }

  /**
   * 跳过任务
   * @param {string} taskId - 任务ID
   */
  function skipTask(taskId) {
    skippedTasks.value.add(taskId)
    completedTasks.value.delete(taskId)
    saveToLocalStorage()
  }

  /**
   * 取消跳过任务
   * @param {string} taskId - 任务ID
   */
  function unskipTask(taskId) {
    skippedTasks.value.delete(taskId)
    saveToLocalStorage()
  }

  /**
   * 设置当前任务
   * @param {string} taskId - 任务ID
   */
  function setCurrentTask(taskId) {
    currentTaskId.value = taskId
    saveToLocalStorage()
  }

  /**
   * 添加任务笔记
   * @param {string} taskId - 任务ID
   * @param {string} note - 笔记内容
   */
  function addTaskNote(taskId, note) {
    if (!taskNotes.value[taskId]) {
      taskNotes.value[taskId] = []
    }
    taskNotes.value[taskId].push({
      content: note,
      timestamp: Date.now()
    })
    saveToLocalStorage()
  }

  /**
   * 更新任务笔记
   * @param {string} taskId - 任务ID
   * @param {number} noteIndex - 笔记索引
   * @param {string} content - 新内容
   */
  function updateTaskNote(taskId, noteIndex, content) {
    if (taskNotes.value[taskId] && taskNotes.value[taskId][noteIndex]) {
      taskNotes.value[taskId][noteIndex].content = content
      taskNotes.value[taskId][noteIndex].timestamp = Date.now()
      saveToLocalStorage()
    }
  }

  /**
   * 删除任务笔记
   * @param {string} taskId - 任务ID
   * @param {number} noteIndex - 笔记索引
   */
  function deleteTaskNote(taskId, noteIndex) {
    if (taskNotes.value[taskId]) {
      taskNotes.value[taskId].splice(noteIndex, 1)
      saveToLocalStorage()
    }
  }

  /**
   * 获取任务笔记
   * @param {string} taskId - 任务ID
   * @returns {Array} 笔记数组
   */
  function getTaskNotes(taskId) {
    return taskNotes.value[taskId] || []
  }

  /**
   * 更新任务进度
   * @param {string} taskId - 任务ID
   * @param {number} progress - 进度 (0-100)
   */
  function updateTaskProgress(taskId, progress) {
    taskProgress.value[taskId] = Math.max(0, Math.min(100, progress))
    saveToLocalStorage()
  }

  /**
   * 获取任务进度
   * @param {string} taskId - 任务ID
   * @returns {number} 进度值
   */
  function getTaskProgress(taskId) {
    return taskProgress.value[taskId] || 0
  }

  /**
   * 重置所有进度
   */
  function resetAllProgress() {
    completedTasks.value.clear()
    skippedTasks.value.clear()
    taskNotes.value = {}
    taskProgress.value = {}
    currentTaskId.value = null
    saveToLocalStorage()
  }

  /**
   * 保存到本地存储
   */
  function saveToLocalStorage() {
    try {
      localStorage.setItem('aero-hand-completed-tasks',
        JSON.stringify([...completedTasks.value]))
      localStorage.setItem('aero-hand-skipped-tasks',
        JSON.stringify([...skippedTasks.value]))
      localStorage.setItem('aero-hand-task-notes',
        JSON.stringify(taskNotes.value))
      localStorage.setItem('aero-hand-task-progress',
        JSON.stringify(taskProgress.value))
      if (currentTaskId.value) {
        localStorage.setItem('aero-hand-current-task', currentTaskId.value)
      }
    } catch (error) {
      Logger.error(LOG_LABEL, '保存任务状态失败:', error)
    }
  }

  /**
   * 从本地存储加载
   */
  function loadFromLocalStorage() {
    try {
      const completed = localStorage.getItem('aero-hand-completed-tasks')
      const skipped = localStorage.getItem('aero-hand-skipped-tasks')
      const notes = localStorage.getItem('aero-hand-task-notes')
      const progress = localStorage.getItem('aero-hand-task-progress')
      const current = localStorage.getItem('aero-hand-current-task')

      if (completed) {
        completedTasks.value = new Set(JSON.parse(completed))
      }
      if (skipped) {
        skippedTasks.value = new Set(JSON.parse(skipped))
      }
      if (notes) {
        taskNotes.value = JSON.parse(notes)
      }
      if (progress) {
        taskProgress.value = JSON.parse(progress)
      }
      if (current) {
        currentTaskId.value = current
      }
    } catch (error) {
      Logger.error(LOG_LABEL, '加载任务状态失败:', error)
    }
  }

  // 初始化
  loadFromLocalStorage()

  return {
    // 状态
    taskTree,
    completedTasks,
    skippedTasks,
    currentTaskId,
    taskNotes,
    taskProgress,

    // 计算属性
    allTasks,
    completedCount,
    totalCount,
    progressPercent,
    currentTask,
    availableTasks,
    blockedTasks,

    // 方法
    findTaskById,
    getTaskDependencies,
    toggleTaskComplete,
    markTaskComplete,
    skipTask,
    unskipTask,
    setCurrentTask,
    addTaskNote,
    updateTaskNote,
    deleteTaskNote,
    getTaskNotes,
    updateTaskProgress,
    getTaskProgress,
    resetAllProgress,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})
