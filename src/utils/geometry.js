/**
 * 几何计算工具函数
 * 用于 3D 可视化、肌腱路径计算等
 */

import { degreesToRadians, radiansToDegrees } from './math.js'

/**
 * 计算两点之间的距离
 * @param {Object} p1 - 点1 {x, y, z}
 * @param {Object} p2 - 点2 {x, y, z}
 * @returns {number} 距离
 */
export function distanceBetweenPoints(p1, p2) {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const dz = p2.z - p1.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * 计算点到线的距离
 * @param {Object} point - 点 {x, y, z}
 * @param {Object} lineStart - 线起点 {x, y, z}
 * @param {Object} lineEnd - 线终点 {x, y, z}
 * @returns {number} 距离
 */
export function pointToLineDistance(point, lineStart, lineEnd) {
  const lineLength = distanceBetweenPoints(lineStart, lineEnd)
  if (lineLength === 0) return distanceBetweenPoints(point, lineStart)

  const t = ((point.x - lineStart.x) * (lineEnd.x - lineStart.x) +
             (point.y - lineStart.y) * (lineEnd.y - lineStart.y) +
             (point.z - lineStart.z) * (lineEnd.z - lineStart.z)) / (lineLength * lineLength)

  const clampedT = Math.max(0, Math.min(1, t))
  const closestPoint = {
    x: lineStart.x + clampedT * (lineEnd.x - lineStart.x),
    y: lineStart.y + clampedT * (lineEnd.y - lineStart.y),
    z: lineStart.z + clampedT * (lineEnd.z - lineStart.z)
  }

  return distanceBetweenPoints(point, closestPoint)
}

/**
 * 旋转向量绕轴旋转
 * @param {Object} vector - 向量 {x, y, z}
 * @param {Object} axis - 旋转轴 {x, y, z}
 * @param {number} angle - 旋转角度（度）
 * @returns {Object} 旋转后的向量
 */
export function rotateVector(vector, axis, angle) {
  const rad = degreesToRadians(angle)
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const { x: vx, y: vy, z: vz } = vector
  const { x: ax, y: ay, z: az } = axis

  // 归一化轴
  const length = Math.sqrt(ax * ax + ay * ay + az * az)
  const nx = ax / length
  const ny = ay / length
  const nz = az / length

  // 罗德里格斯旋转公式
  const dotProduct = vx * nx + vy * ny + vz * nz
  const crossProduct = {
    x: ny * vz - nz * vy,
    y: nz * vx - nx * vz,
    z: nx * vy - ny * vx
  }

  return {
    x: vx * cos + crossProduct.x * sin + nx * dotProduct * (1 - cos),
    y: vy * cos + crossProduct.y * sin + ny * dotProduct * (1 - cos),
    z: vz * cos + crossProduct.z * sin + nz * dotProduct * (1 - cos)
  }
}

/**
 * 计算球面坐标
 * @param {number} radius - 半径
 * @param {number} theta - 极角（度）
 * @param {number} phi - 方位角（度）
 * @returns {Object} 笛卡尔坐标 {x, y, z}
 */
export function sphericalToCartesian(radius, theta, phi) {
  const thetaRad = degreesToRadians(theta)
  const phiRad = degreesToRadians(phi)

  return {
    x: radius * Math.sin(thetaRad) * Math.cos(phiRad),
    y: radius * Math.cos(thetaRad),
    z: radius * Math.sin(thetaRad) * Math.sin(phiRad)
  }
}

/**
 * 计算贝塞尔曲线点
 * @param {Array} controlPoints - 控制点数组
 * @param {number} t - 插值参数 (0-1)
 * @returns {Object} 曲线上的点
 */
export function bezierPoint(controlPoints, t) {
  const n = controlPoints.length - 1
  let point = { x: 0, y: 0, z: 0 }

  for (let i = 0; i <= n; i++) {
    const coefficient = binomialCoefficient(n, i) * Math.pow(1 - t, n - i) * Math.pow(t, i)
    point.x += coefficient * controlPoints[i].x
    point.y += coefficient * controlPoints[i].y
    point.z += coefficient * controlPoints[i].z
  }

  return point
}

/**
 * 计算二项式系数
 * @param {number} n
 * @param {number} k
 * @returns {number}
 */
function binomialCoefficient(n, k) {
  if (k === 0 || k === n) return 1
  if (k > n) return 0

  let result = 1
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1)
  }
  return result
}

/**
 * 生成肌腱路径点
 * @param {Object} startPoint - 起点
 * @param {Array} waypoints - 路径点数组
 * @param {Object} endPoint - 终点
 * @param {number} segments - 段数
 * @returns {Array} 路径点数组
 */
export function generateTendonPath(startPoint, waypoints, endPoint, segments = 50) {
  const path = []
  const allPoints = [startPoint, ...waypoints, endPoint]

  for (let i = 0; i < allPoints.length - 1; i++) {
    const p1 = allPoints[i]
    const p2 = allPoints[i + 1]

    for (let j = 0; j < segments; j++) {
      const t = j / segments
      path.push({
        x: p1.x + t * (p2.x - p1.x),
        y: p1.y + t * (p2.y - p1.y),
        z: p1.z + t * (p2.z - p1.z)
      })
    }
  }

  path.push(endPoint)
  return path
}
