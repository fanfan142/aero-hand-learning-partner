/**
 * 数据导出工具函数
 * 用于导出配置、数据等
 */

import Logger from './logger.js'

const LOG_LABEL = 'Export'

/**
 * 导出为 JSON 文件
 * @param {Object} data - 要导出的数据
 * @param {string} filename - 文件名
 */
export function exportAsJSON(data, filename = 'export.json') {
  const json = JSON.stringify(data, null, 2)
  downloadFile(json, filename, 'application/json')
}

/**
 * 导出为 CSV 文件
 * @param {Array} data - 数组数据
 * @param {string} filename - 文件名
 */
export function exportAsCSV(data, filename = 'export.csv') {
  if (!Array.isArray(data) || data.length === 0) {
    Logger.error(LOG_LABEL, '数据必须是非空数组')
    return
  }

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header]
      // 处理包含逗号或引号的值
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value ?? ''
    }).join(','))
  ].join('\n')

  downloadFile(csvContent, filename, 'text/csv')
}

/**
 * 导出为 Markdown 表格
 * @param {Array} data - 数组数据
 * @param {string} filename - 文件名
 */
export function exportAsMarkdown(data, filename = 'export.md') {
  if (!Array.isArray(data) || data.length === 0) {
    Logger.error(LOG_LABEL, '数据必须是非空数组')
    return
  }

  const headers = Object.keys(data[0])
  const mdContent = [
    '| ' + headers.join(' | ') + ' |',
    '| ' + headers.map(() => '---').join(' | ') + ' |',
    ...data.map(row =>
      '| ' + headers.map(header => row[header] ?? '').join(' | ') + ' |'
    )
  ].join('\n')

  downloadFile(mdContent, filename, 'text/markdown')
}

/**
 * 导出配置对比表
 * @param {Object} config1 - 配置1
 * @param {Object} config2 - 配置2
 * @param {string} filename - 文件名
 */
export function exportConfigComparison(config1, config2, filename = 'comparison.md') {
  const keys = [...new Set([...Object.keys(config1), ...Object.keys(config2)])]

  const mdContent = [
    '# 配置对比',
    '',
    '| 参数 | 配置1 | 配置2 | 差异 |',
    '| --- | --- | --- | --- |',
    ...keys.map(key => {
      const val1 = config1[key] ?? '-'
      const val2 = config2[key] ?? '-'
      const diff = val1 !== val2 ? '✓' : '-'
      return `| ${key} | ${val1} | ${val2} | ${diff} |`
    })
  ].join('\n')

  downloadFile(mdContent, filename, 'text/markdown')
}

/**
 * 下载文件
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
 * 从文件导入 JSON
 * @param {File} file - 文件对象
 * @returns {Promise<Object>} 解析后的数据
 */
export function importFromJSON(file) {
  return new Promise((resolve, reject) => {
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
 * 复制到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} 是否成功
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    Logger.error(LOG_LABEL, '复制失败:', error)
    return false
  }
}

/**
 * 格式化数据为可读字符串
 * @param {*} data - 任意数据
 * @returns {string} 格式化后的字符串
 */
export function formatData(data) {
  if (typeof data === 'object' && data !== null) {
    return JSON.stringify(data, null, 2)
  }
  return String(data)
}
