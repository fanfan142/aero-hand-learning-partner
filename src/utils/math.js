/**
 * 数学计算工具函数
 * 用于关节映射、舵机控制等计算
 */

/**
 * 位置百分比转换为脉冲数量
 * @param {number} percent - 位置百分比 (0-1)
 * @param {number} extendCount - 伸展端点脉冲数
 * @param {number} graspCount - 抓握端点脉冲数
 * @returns {number} 脉冲数量
 */
export function positionToPulse(percent, extendCount, graspCount) {
  const range = extendCount - graspCount
  return Math.round(graspCount + percent * range)
}

/**
 * 脉冲数量转换为位置百分比
 * @param {number} pulse - 脉冲数量
 * @param {number} extendCount - 伸展端点脉冲数
 * @param {number} graspCount - 抓握端点脉冲数
 * @returns {number} 位置百分比 (0-1)
 */
export function pulseToPosition(pulse, extendCount, graspCount) {
  const range = extendCount - graspCount
  return (pulse - graspCount) / range
}

/**
 * 脉冲数量转换为关节角度
 * @param {number} pulse - 脉冲数量
 * @param {number} extendCount - 伸展端点脉冲数
 * @param {number} graspCount - 抓握端点脉冲数
 * @param {number} maxAngle - 最大关节角度（度）
 * @returns {number} 关节角度（度）
 */
export function pulseToAngle(pulse, extendCount, graspCount, maxAngle) {
  const percent = (pulse - graspCount) / (extendCount - graspCount)
  return percent * maxAngle
}

/**
 * 关节角度转换为舵机角度
 * @param {number} jointAngle - 关节角度（度）
 * @param {number} gearRatio - 传动比
 * @returns {number} 舵机角度（度）
 */
export function angleToServoAngle(jointAngle, gearRatio) {
  return jointAngle * gearRatio
}

/**
 * 舵机角度转换为脉冲数量
 * @param {number} servoAngle - 舵机角度（度）
 * @param {number} maxServoAngle - 最大舵机角度（度）
 * @returns {number} 脉冲数量 (0-4095)
 */
export function servoAngleToPulse(servoAngle, maxServoAngle = 270) {
  return Math.round((servoAngle / maxServoAngle) * 4095)
}

/**
 * 位置百分比转换为关节角度
 * @param {number} percent - 位置百分比 (0-1)
 * @param {number} maxAngle - 最大关节角度（度）
 * @returns {number} 关节角度（度）
 */
export function positionToAngle(percent, maxAngle) {
  return percent * maxAngle
}

/**
 * 限制数值在指定范围内
 * @param {number} value - 输入值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 限制后的值
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/**
 * 线性插值
 * @param {number} start - 起始值
 * @param {number} end - 结束值
 * @param {number} t - 插值因子 (0-1)
 * @returns {number} 插值结果
 */
export function lerp(start, end, t) {
  return start + (end - start) * t
}

/**
 * 角度转弧度
 * @param {number} degrees - 角度
 * @returns {number} 弧度
 */
export function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * 弧度转角度
 * @param {number} radians - 弧度
 * @returns {number} 角度
 */
export function radiansToDegrees(radians) {
  return radians * (180 / Math.PI)
}
