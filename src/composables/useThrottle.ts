import { ref, unref } from 'vue'

/**
 * 防抖hook
 * @param fn 要执行的函数
 * @param delay 延迟时间(ms)
 * @returns 防抖后的函数
 */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
): [T, () => void] {
  let timeoutId: number | null = null

  const debouncedFn = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }) as T

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return [debouncedFn, cancel]
}

/**
 * 节流hook
 * @param fn 要执行的函数
 * @param delay 延迟时间(ms)
 * @returns 节流后的函数
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
): [T, () => void] {
  let timeoutId: number | null = null
  let lastCallTime = 0

  const throttledFn = ((...args: Parameters<T>) => {
    const now = Date.now()

    if (now - lastCallTime >= delay) {
      fn(...args)
      lastCallTime = now
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(
        () => {
          fn(...args)
          lastCallTime = Date.now()
        },
        delay - (now - lastCallTime),
      )
    }
  }) as T

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return [throttledFn, cancel]
}

/**
 * 防重复点击hook
 * @param fn 要执行的函数
 * @param delay 延迟时间(ms)，默认300ms
 * @returns [处理后的函数, loading状态, 重置函数]
 */
export function usePreventRepeatedClick<T extends (...args: any[]) => Promise<any> | any>(
  fn: T,
  delay: number = 300,
): [T, { readonly value: boolean }, () => void] {
  const loading = ref(false)
  let timeoutId: number | null = null

  const wrappedFn = (async (...args: Parameters<T>) => {
    // 如果正在loading，直接返回
    if (unref(loading)) {
      return
    }

    loading.value = true

    try {
      const result = await fn(...args)
      return result
    } catch (error) {
      throw error
    } finally {
      // 设置最小延迟，防止点击过快
      timeoutId = setTimeout(() => {
        loading.value = false
      }, delay)
    }
  }) as T

  const reset = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    loading.value = false
  }

  return [wrappedFn, loading, reset]
}

/**
 * 简化版防重复点击hook（不返回loading状态）
 * @param fn 要执行的函数
 * @param delay 延迟时间(ms)
 * @returns 处理后的函数
 */
export function usePreventRepeatedClickSimple<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
): T {
  let lastCallTime = 0

  return ((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCallTime < delay) {
      return
    }
    lastCallTime = now
    return fn(...args)
  }) as T
}

/**
 * 异步操作loading状态管理
 * @param fn 异步函数
 * @returns [包装后的函数, loading状态]
 */
export function useAsyncLoading<T extends (...args: any[]) => Promise<any>>(
  fn: T,
): [T, { readonly value: boolean }] {
  const loading = ref(false)

  const wrappedFn = (async (...args: Parameters<T>) => {
    if (unref(loading)) {
      return
    }

    loading.value = true
    try {
      const result = await fn(...args)
      return result
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }) as T

  return [wrappedFn, loading]
}

// 导出常用的预设
export const useClickThrottle = <T extends (...args: any[]) => any>(fn: T, delay: number = 500) =>
  useThrottle(fn, delay)

export const useSubmitPrevent = <T extends (...args: any[]) => any>(fn: T, delay: number = 1000) =>
  usePreventRepeatedClick(fn, delay)
