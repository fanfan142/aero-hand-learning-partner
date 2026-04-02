/**
 * 数据验证服务
 * 提供各种数据验证函数
 */

/**
 * 验证结果类
 */
export class ValidationResult {
  constructor() {
    this.valid = true
    this.errors = []
    this.warnings = []
  }

  addError(field, message) {
    this.valid = false
    this.errors.push({ field, message })
  }

  addWarning(field, message) {
    this.warnings.push({ field, message })
  }

  merge(other) {
    this.valid = this.valid && other.valid
    this.errors.push(...other.errors)
    this.warnings.push(...other.warnings)
  }

  toJSON() {
    return {
      valid: this.valid,
      errors: this.errors,
      warnings: this.warnings
    }
  }
}

/**
 * 验证通知数据
 * @param {Object} notification - 通知对象
 * @returns {ValidationResult} 验证结果
 */
export function validateNotification(notification) {
  const result = new ValidationResult()

  if (!notification) {
    result.addError('notification', '通知数据不能为空')
    return result
  }

  if (!notification.id) {
    result.addError('id', '通知 ID 不能为空')
  }

  if (!notification.type) {
    result.addError('type', '通知类型不能为空')
  } else {
    const validTypes = ['info', 'success', 'warning', 'error', 'achievement', 'system']
    if (!validTypes.includes(notification.type)) {
      result.addError('type', `通知类型必须是: ${validTypes.join(', ')}`)
    }
  }

  if (!notification.title) {
    result.addError('title', '通知标题不能为空')
  } else if (typeof notification.title !== 'string') {
    result.addError('title', '通知标题必须是字符串')
  } else if (notification.title.length > 100) {
    result.addWarning('title', '通知标题过长，建议不超过 100 字符')
  }

  if (notification.message && typeof notification.message !== 'string') {
    result.addError('message', '通知内容必须是字符串')
  }

  if (notification.link && typeof notification.link !== 'string') {
    result.addError('link', '通知链接必须是字符串')
  }

  if (notification.timestamp && isNaN(Date.parse(notification.timestamp))) {
    result.addError('timestamp', '通知时间戳格式无效')
  }

  return result
}

/**
 * 验证成就数据
 * @param {Object} achievement - 成就对象
 * @returns {ValidationResult} 验证结果
 */
export function validateAchievement(achievement) {
  const result = new ValidationResult()

  if (!achievement) {
    result.addError('achievement', '成就数据不能为空')
    return result
  }

  if (!achievement.id) {
    result.addError('id', '成就 ID 不能为空')
  }

  if (!achievement.title) {
    result.addError('title', '成就标题不能为空')
  }

  return result
}

/**
 * 验证笔记数据
 * @param {Object} note - 笔记对象
 * @returns {ValidationResult} 验证结果
 */
export function validateNote(note) {
  const result = new ValidationResult()

  if (!note) {
    result.addError('note', '笔记数据不能为空')
    return result
  }

  if (!note.id) {
    result.addError('id', '笔记 ID 不能为空')
  }

  if (!note.title) {
    result.addWarning('title', '笔记标题为空，将使用默认标题')
  }

  if (note.tags && !Array.isArray(note.tags)) {
    result.addError('tags', '标签必须是数组')
  }

  if (note.category && typeof note.category !== 'string') {
    result.addError('category', '分类必须是字符串')
  }

  return result
}

/**
 * 验证书签数据
 * @param {Object} bookmark - 书签对象
 * @returns {ValidationResult} 验证结果
 */
export function validateBookmark(bookmark) {
  const result = new ValidationResult()

  if (!bookmark) {
    result.addError('bookmark', '书签数据不能为空')
    return result
  }

  if (!bookmark.id) {
    result.addError('id', '书签 ID 不能为空')
  }

  if (!bookmark.title) {
    result.addError('title', '书签标题不能为空')
  }

  if (bookmark.url && !isValidUrl(bookmark.url)) {
    result.addWarning('url', '书签 URL 格式可能无效')
  }

  return result
}

/**
 * 验证学习进度数据
 * @param {Object} progress - 进度对象
 * @returns {ValidationResult} 验证结果
 */
export function validateLearningProgress(progress) {
  const result = new ValidationResult()

  if (!progress) {
    result.addError('progress', '进度数据不能为空')
    return result
  }

  if (progress.completedTasks !== undefined) {
    if (!Array.isArray(progress.completedTasks)) {
      result.addError('completedTasks', '已完成任务列表必须是数组')
    }
  }

  if (progress.currentStage && typeof progress.currentStage !== 'string') {
    result.addError('currentStage', '当前阶段必须是字符串')
  }

  return result
}

/**
 * 验证导入数据格式
 * @param {Object} data - 要验证的数据
 * @returns {ValidationResult} 验证结果
 */
export function validateImportData(data) {
  const result = new ValidationResult()

  if (!data) {
    result.addError('data', '导入数据不能为空')
    return result
  }

  if (!data.data || typeof data.data !== 'object') {
    result.addError('data.data', '导入数据必须包含 data 对象')
  }

  if (data.version && typeof data.version !== 'number') {
    result.addWarning('version', '版本号应该是数字')
  }

  if (data.exportedAt && isNaN(Date.parse(data.exportedAt))) {
    result.addWarning('exportedAt', '导出时间戳格式可能无效')
  }

  return result
}

/**
 * 验证 URL 格式
 * @param {string} url - URL 字符串
 * @returns {boolean} 是否有效
 */
export function isValidUrl(url) {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证舵机配置
 * @param {Object} config - 舵机配置
 * @returns {ValidationResult} 验证结果
 */
export function validateServoConfig(config) {
  const result = new ValidationResult()

  if (!config) {
    result.addError('config', '配置不能为空')
    return result
  }

  if (config.extendCount !== undefined) {
    if (typeof config.extendCount !== 'number') {
      result.addError('extendCount', 'extendCount 必须是数字')
    } else if (config.extendCount < 0 || config.extendCount > 4095) {
      result.addError('extendCount', 'extendCount 必须在 0-4095 范围内')
    }
  }

  if (config.graspCount !== undefined) {
    if (typeof config.graspCount !== 'number') {
      result.addError('graspCount', 'graspCount 必须是数字')
    } else if (config.graspCount < 0 || config.graspCount > 4095) {
      result.addError('graspCount', 'graspCount 必须在 0-4095 范围内')
    }
  }

  if (config.extendCount && config.graspCount && config.extendCount <= config.graspCount) {
    result.addError('extendCount', 'extendCount 必须大于 graspCount')
  }

  return result
}

/**
 * 验证用户偏好设置
 * @param {Object} preferences - 偏好设置
 * @returns {ValidationResult} 验证结果
 */
export function validatePreferences(preferences) {
  const result = new ValidationResult()

  if (!preferences) {
    result.addError('preferences', '偏好设置不能为空')
    return result
  }

  if (preferences.locale !== undefined) {
    const validLocales = ['zh-CN', 'zh-TW', 'en-US']
    if (!validLocales.includes(preferences.locale)) {
      result.addWarning('locale', `语言设置建议使用: ${validLocales.join(', ')}`)
    }
  }

  if (preferences.pageSize !== undefined) {
    if (typeof preferences.pageSize !== 'number' || preferences.pageSize < 1) {
      result.addError('pageSize', '每页条数必须是大于 0 的数字')
    }
  }

  return result
}

/**
 * 批量验证通知
 * @param {Array} notifications - 通知数组
 * @returns {Object} { validNotifications: Array, invalidNotifications: Array }
 */
export function validateNotifications(notifications) {
  if (!Array.isArray(notifications)) {
    return { validNotifications: [], invalidNotifications: [] }
  }

  const valid = []
  const invalid = []

  for (const notification of notifications) {
    const result = validateNotification(notification)
    if (result.valid) {
      valid.push(notification)
    } else {
      invalid.push({ notification, errors: result.errors })
    }
  }

  return {
    validNotifications: valid,
    invalidNotifications: invalid
  }
}

export default {
  ValidationResult,
  validateNotification,
  validateAchievement,
  validateNote,
  validateBookmark,
  validateLearningProgress,
  validateImportData,
  validateServoConfig,
  validatePreferences,
  validateNotifications,
  isValidUrl
}
