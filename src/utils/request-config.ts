import type { AxiosRequestConfig } from 'axios'

/**
 * 请求配置工具
 * 用于统一管理API请求的loading、错误处理等配置
 */

/**
 * 创建带loading的请求配置
 */
export function createLoadingRequestConfig(config: AxiosRequestConfig = {}): AxiosRequestConfig {
  return {
    showGlobalLoading: true,
    ...config,
  }
}

/**
 * 创建静默请求配置（不显示全局loading）
 */
export function createSilentRequestConfig(config: AxiosRequestConfig = {}): AxiosRequestConfig {
  return {
    showGlobalLoading: false,
    ...config,
  }
}

/**
 * 创建唯一请求配置（用于防止重复请求）
 */
export function createUniqueRequestConfig(
  requestId: string,
  config: AxiosRequestConfig = {},
): AxiosRequestConfig {
  return {
    requestId,
    showGlobalLoading: true,
    ...config,
  }
}

/**
 * 预设的请求配置
 */
export const RequestPresets = {
  /** 静默请求（不显示全局loading） */
  silent: createSilentRequestConfig(),

  /** 带loading的请求（默认） */
  withLoading: createLoadingRequestConfig(),

  /** 文件上传请求配置 */
  fileUpload: createSilentRequestConfig({
    timeout: 60000, // 文件上传需要更长时间
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  /** 快速请求配置（较短超时） */
  quick: createLoadingRequestConfig({
    timeout: 10000, // 10秒超时
  }),

  /** 长时间请求配置 */
  longRunning: createLoadingRequestConfig({
    timeout: 120000, // 2分钟超时
  }),
}

export default RequestPresets
