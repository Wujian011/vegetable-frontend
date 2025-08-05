/**
 * Axios 请求配置扩展类型定义
 */

import 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * 是否显示全局loading
     * @default true
     */
    showGlobalLoading?: boolean

    /**
     * 请求唯一标识（用于防重复请求）
     */
    requestId?: string

    /**
     * 是否为静默请求（不显示任何loading）
     * @default false
     */
    silent?: boolean
  }
}
