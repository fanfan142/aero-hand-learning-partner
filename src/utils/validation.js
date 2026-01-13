/**
 * 参数验证工具函数
 * 用于验证输入参数的有效性
 */

/**
 * 验证位置百分比
 * @param {number} percent - 位置百分比
 * @returns {Object} { valid: boolean, message: string }
 */
export function validatePositionPercent(percent) {
  if (typeof percent !== 'number' || isNaN(percent)) {
    return { valid: false, message: '位置百分比必须是数字' }
  }
  if (percent < 0 || percent > 1) {
    return { valid: false, message: '位置百分比必须在 0 到 1 之间' }
  }
  return { valid: true }
}

/**
 * 验证脉冲数量
 * @param {number} pulse - 脉冲数量
 * @returns {Object} { valid: boolean, message: string }
 */
export function validatePulse(pulse) {
  if (typeof pulse !== 'number' || isNaN(pulse)) {
    return { valid: false, message: '脉冲数量必须是数字' }
  }
  if (!Number.isInteger(pulse)) {
    return { valid: false, message: '脉冲数量必须是整数' }
  }
  if (pulse < 0 || pulse > 4095) {
    return { valid: false, message: '脉冲数量必须在 0 到 4095 之间' }
  }
  return { valid: true }
}

/**
 * 验证角度
 * @param {number} angle - 角度
 * @param {number} maxAngle - 最大角度
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateAngle(angle, maxAngle = 180) {
  if (typeof angle !== 'number' || isNaN(angle)) {
    return { valid: false, message: '角度必须是数字' }
  }
  if (angle < 0 || angle > maxAngle) {
    return { valid: false, message: `角度必须在 0 到 ${maxAngle} 度之间` }
  }
  return { valid: true }
}

/**
 * 验证舵机配置
 * @param {Object} config - 舵机配置对象
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validateServoConfig(config) {
  const errors = []

  if (!config.extend_count || typeof config.extend_count !== 'number') {
    errors.push('extend_count 必须是有效的数字')
  } else if (config.extend_count < 0 || config.extend_count > 4095) {
    errors.push('extend_count 必须在 0 到 4095 之间')
  }

  if (!config.grasp_count || typeof config.grasp_count !== 'number') {
    errors.push('grasp_count 必须是有效的数字')
  } else if (config.grasp_count < 0 || config.grasp_count > 4095) {
    errors.push('grasp_count 必须在 0 到 4095 之间')
  }

  if (config.extend_count && config.grasp_count && config.extend_count <= config.grasp_count) {
    errors.push('extend_count 必须大于 grasp_count')
  }

  if (!config.max_angle || typeof config.max_angle !== 'number') {
    errors.push('max_angle 必须是有效的数字')
  } else if (config.max_angle <= 0 || config.max_angle > 360) {
    errors.push('max_angle 必须在 0 到 360 度之间')
  }

  if (config.gear_ratio !== undefined && (typeof config.gear_ratio !== 'number' || config.gear_ratio <= 0)) {
    errors.push('gear_ratio 必须是大于 0 的数字')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证关节索引
 * @param {number} index - 关节索引 (0-6)
 * @returns {Object} { valid: boolean, message: string }
 */
export function validateJointIndex(index) {
  if (typeof index !== 'number' || isNaN(index)) {
    return { valid: false, message: '关节索引必须是数字' }
  }
  if (!Number.isInteger(index)) {
    return { valid: false, message: '关节索引必须是整数' }
  }
  if (index < 0 || index > 6) {
    return { valid: false, message: '关节索引必须在 0 到 6 之间' }
  }
  return { valid: true }
}

/**
 * 检查配置是否超出限位
 * @param {number} pulse - 当前脉冲
 * @param {number} extendCount - 伸展端点
 * @param {number} graspCount - 抓握端点
 * @returns {Object} { outOfRange: boolean, type: string }
 */
export function checkRangeLimit(pulse, extendCount, graspCount) {
  if (pulse > extendCount) {
    return { outOfRange: true, type: 'extend', message: '超出伸展限位' }
  }
  if (pulse < graspCount) {
    return { outOfRange: true, type: 'grasp', message: '超出抓握限位' }
  }
  return { outOfRange: false }
}
