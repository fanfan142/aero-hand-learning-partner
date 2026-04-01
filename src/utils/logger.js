/**
 * 统一日志工具
 * 提供分级日志控制，支持生产环境关闭调试日志
 */

const isDev = import.meta.env.DEV

export const Logger = {
  error(label, message, ...args) {
    if (!isDev) return
    console.error(`[${label}]`, message, ...args)
  },

  warn(label, message, ...args) {
    if (!isDev) return
    console.warn(`[${label}]`, message, ...args)
  },

  info(label, message, ...args) {
    if (!isDev) return
    console.info(`[${label}]`, message, ...args)
  },

  debug(label, message, ...args) {
    if (!isDev) return
    console.debug(`[${label}]`, message, ...args)
  }
}

export default Logger
