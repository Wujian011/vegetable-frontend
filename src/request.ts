import axios from 'axios'
import { showFailToast } from 'vant'
import { useLoadingStore } from '@/stores/loading'

// 创建 Axios 实例
const myAxios = axios.create({
  baseURL: '/api',
  timeout: 60000,
  withCredentials: true,
})

// 获取loading store实例
let loadingStore: ReturnType<typeof useLoadingStore> | null = null
const getLoadingStore = () => {
  if (!loadingStore) {
    loadingStore = useLoadingStore()
  }
  return loadingStore
}

// 全局请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    // 检查是否需要显示全局loading（默认显示，可通过配置关闭）
    const showGlobalLoading = config.showGlobalLoading !== false

    if (showGlobalLoading) {
      try {
        const store = getLoadingStore()
        store.showLoading()
      } catch (error) {
        console.warn('Loading store not available:', error)
      }
    }

    return config
  },
  function (error) {
    // 请求错误时也要隐藏loading
    try {
      const store = getLoadingStore()
      store.hideLoading()
    } catch (err) {
      console.warn('Loading store not available:', err)
    }
    return Promise.reject(error)
  },
)

// 全局响应拦截器
myAxios.interceptors.response.use(
  function (response) {
    // 响应成功时隐藏loading
    const showGlobalLoading = response.config.showGlobalLoading !== false
    if (showGlobalLoading) {
      try {
        const store = getLoadingStore()
        store.hideLoading()
      } catch (error) {
        console.warn('Loading store not available:', error)
      }
    }

    const { data } = response
    // 未登录
    if (data.code === 40100) {
      // 不是获取用户信息的请求，并且用户目前不是已经在用户登录页面，则跳转到登录页面
      if (
        !response.request.responseURL.includes('user/get/login') &&
        !window.location.pathname.includes('/user/login')
      ) {
        showFailToast('请先登录')
        window.location.href = `/user/login?redirect=${window.location.href}`
      }
    }
    return response
  },
  function (error) {
    // 响应错误时也要隐藏loading
    const showGlobalLoading = error.config?.showGlobalLoading !== false
    if (showGlobalLoading) {
      try {
        const store = getLoadingStore()
        store.hideLoading()
      } catch (err) {
        console.warn('Loading store not available:', err)
      }
    }

    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error)
  },
)

export default myAxios
