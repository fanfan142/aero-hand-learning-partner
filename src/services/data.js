/**
 * 数据导入导出服务
 * 提供统一的数据格式转换、导出、导入功能
 */

import { storageService, STORAGE_KEYS } from './storage.js'

/**
 * 数据导出格式类型
 */
export const ExportFormat = {
  JSON: 'json',
  CSV: 'csv',
  Markdown: 'md'
}

/**
 * 数据合并策略
 */
export const MergeStrategy = {
  SKIP: 'skip',           // 跳过已存在的
  OVERWRITE: 'overwrite', // 覆盖
  MERGE: 'merge',          // 合并（数组取并集，对象取新值）
  ASK: 'ask'               // 询问
}

/**
 * 默认导出数据清单
 */
const DEFAULT_EXPORT_KEYS = [
  STORAGE_KEYS.PREFERENCES,
  STORAGE_KEYS.LEARNING_PROGRESS,
  STORAGE_KEYS.ACHIEVEMENTS,
  STORAGE_KEYS.NOTES,
  STORAGE_KEYS.BOOKMARKS,
  STORAGE_KEYS.SEARCH_HISTORY,
  STORAGE_KEYS.SERVO_CONFIG,
  STORAGE_KEYS.CONFIG_HISTORY,
  STORAGE_KEYS.NOTIFICATIONS,
  STORAGE_KEYS.NOTIFICATION_SETTINGS,
  STORAGE_KEYS.AI_CHAT_HISTORY
]

/**
 * 导出所有应用数据
 * @param {Object} options - 选项
 * @returns {Object} 导出的数据
 */
export function exportAllData(options = {}) {
  const {
    includeKeys = DEFAULT_EXPORT_KEYS,
    includeMetadata = true
  } = options

  const data = {}

  for (const key of includeKeys) {
    const value = storageService.get(key)
    if (value !== null) {
      data[key] = value
    }
  }

  const exportData = {
    appName: 'aero-hand-learning-partner',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    ...(includeMetadata && {
      metadata: {
        totalKeys: Object.keys(data).length,
        storageInfo: storageService.getStorageInfo()
      }
    }),
    data
  }

  return exportData
}

/**
 * 导出为 JSON 文件并下载
 * @param {Object} data - 要导出的数据
 * @param {string} filename - 文件名（不含扩展名）
 */
export function exportAsJSONFile(data, filename = 'aero-hand-backup') {
  const json = JSON.stringify(data, null, 2)
  downloadFile(json, `${filename}.json`, 'application/json')
}

/**
 * 导出为 CSV 文件
 * @param {Array} data - 数组数据
 * @param {Array} columns - 列定义 [{ key: 'title', header: '标题' }]
 * @param {string} filename - 文件名
 */
export function exportAsCSVFile(data, columns, filename = 'export') {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('[DataService] 数据必须是非空数组')
    return null
  }

  const headers = columns.map(col => col.header)
  const keys = columns.map(col => col.key)

  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      keys.map(key => {
        const value = getNestedValue(row, key)
        // 处理包含逗号或引号的值
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value ?? ''
      }).join(',')
    )
  ]

  const csvContent = csvRows.join('\n')
  downloadFile(csvContent, `${filename}.csv`, 'text/csv')

  return csvContent
}

/**
 * 导出为 Markdown 表格
 * @param {Array} data - 数组数据
 * @param {Array} columns - 列定义 [{ key: 'title', header: '标题' }]
 * @param {string} filename - 文件名
 */
export function exportAsMarkdownFile(data, columns, filename = 'export') {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('[DataService] 数据必须是非空数组')
    return null
  }

  const headers = columns.map(col => col.header)

  const mdRows = [
    '| ' + headers.join(' | ') + ' |',
    '| ' + headers.map(() => '---').join(' | ') + ' |',
    ...data.map(row =>
      '| ' + columns.map(col => {
        const value = getNestedValue(row, col.key)
        return String(value ?? '')
      }).join(' | ') + ' |'
    )
  ]

  const mdContent = mdRows.join('\n')
  downloadFile(mdContent, `${filename}.md`, 'text/markdown')

  return mdContent
}

/**
 * 从文件导入 JSON 数据
 * @param {File} file - 文件对象
 * @returns {Promise<Object>} 解析后的数据
 */
export function importFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('未选择文件'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        resolve(data)
      } catch (error) {
        reject(new Error('JSON 解析失败: ' + error.message))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

/**
 * 导入数据到存储
 * @param {Object} importData - 导入的数据
 * @param {Object} options - 选项
 * @returns {Object} 导入结果 { success: boolean, imported: number, skipped: number, errors: string[] }
 */
export function importData(importData, options = {}) {
  const {
    strategy = MergeStrategy.SKIP,
    validate = true,
    targetKeys = null
  } = options

  const result = {
    success: true,
    imported: 0,
    skipped: 0,
    errors: []
  }

  // 验证数据格式
  if (validate) {
    if (!importData.data || typeof importData.data !== 'object') {
      result.errors.push('无效的数据格式：缺少 data 字段')
      result.success = false
      return result
    }
  }

  const dataToImport = targetKeys
    ? Object.fromEntries(
        targetKeys.map(k => [k, importData.data[k]]).filter(([k, v]) => v !== undefined)
      )
    : importData.data

  for (const [key, value] of Object.entries(dataToImport)) {
    try {
      const existing = storageService.get(key)

      if (existing !== null && strategy === MergeStrategy.SKIP) {
        result.skipped++
        continue
      }

      if (existing !== null && strategy === MergeStrategy.MERGE) {
        // 深度合并
        const merged = deepMerge(existing, value)
        storageService.set(key, merged)
      } else {
        storageService.set(key, value)
      }

      result.imported++
    } catch (error) {
      result.errors.push(`导入 ${key} 失败: ${error.message}`)
    }
  }

  if (result.errors.length > 0) {
    result.success = false
  }

  return result
}

/**
 * 下载文件辅助函数
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名
 * @param {string} mimeType - MIME 类型
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 获取嵌套的对象值
 * @param {Object} obj - 对象
 * @param {string} path - 属性路径，如 'user.name'
 * @returns {any} 值
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * 深度合并对象
 * @param {Object} target - 目标对象
 * @param {Object} source - 源对象
 * @returns {Object} 合并后的对象
 */
function deepMerge(target, source) {
  if (typeof target !== 'object' || typeof source !== 'object') {
    return source
  }

  const result = { ...target }

  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      result[key] = deepMerge(target[key], source[key])
    } else {
      result[key] = source[key]
    }
  }

  return result
}

/**
 * 复制数据到剪贴板
 * @param {Object|string} data - 要复制的数据
 * @returns {Promise<boolean>} 是否成功
 */
export async function copyToClipboard(data) {
  try {
    const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('[DataService] 复制失败:', error)
    return false
  }
}

/**
 * 从剪贴板粘贴
 * @returns {Promise<Object|null>} 解析后的数据或 null
 */
export async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    return JSON.parse(text)
  } catch (error) {
    console.error('[DataService] 粘贴失败:', error)
    return null
  }
}

export default {
  ExportFormat,
  MergeStrategy,
  exportAllData,
  exportAsJSONFile,
  exportAsCSVFile,
  exportAsMarkdownFile,
  importFromFile,
  importData,
  copyToClipboard,
  pasteFromClipboard
}
