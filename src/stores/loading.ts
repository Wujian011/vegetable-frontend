import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 全局Loading状态管理
 */
export const useLoadingStore = defineStore('loading', () => {
  // Loading状态
  const isLoading = ref(false)
  // 请求计数器 - 支持多个并发请求
  const requestCount = ref(0)
  // 最小显示时间，防止loading闪烁
  const minShowTime = 300
  let showStartTime = 0

  // 显示loading
  function showLoading() {
    requestCount.value++
    if (requestCount.value === 1) {
      showStartTime = Date.now()
      isLoading.value = true
    }
  }

  // 隐藏loading
  async function hideLoading() {
    requestCount.value--
    if (requestCount.value <= 0) {
      requestCount.value = 0

      // 确保loading至少显示最小时间，避免闪烁
      const showTime = Date.now() - showStartTime
      if (showTime < minShowTime) {
        await new Promise((resolve) => setTimeout(resolve, minShowTime - showTime))
      }

      isLoading.value = false
    }
  }

  // 强制隐藏loading（用于错误处理）
  function forceHideLoading() {
    requestCount.value = 0
    isLoading.value = false
  }

  // 设置loading状态（手动控制）
  function setLoading(loading: boolean) {
    if (loading) {
      showLoading()
    } else {
      hideLoading()
    }
  }

  return {
    isLoading,
    requestCount,
    showLoading,
    hideLoading,
    forceHideLoading,
    setLoading,
  }
})
