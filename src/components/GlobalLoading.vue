<template>
  <transition name="loading-fade">
    <div v-if="isVisible" class="global-loading">
      <div class="loading-overlay" @click.stop @touchmove.prevent>
        <div class="loading-content">
          <van-loading type="spinner" size="32px" color="#1989fa" class="loading-spinner">
            <template #default>
              <span class="loading-text">{{ loadingText }}</span>
            </template>
          </van-loading>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLoadingStore } from '@/stores/loading'

// Props
interface Props {
  loadingText?: string
}

const props = withDefaults(defineProps<Props>(), {
  loadingText: '加载中...',
})

// 使用loading store
const loadingStore = useLoadingStore()

// 计算是否显示loading
const isVisible = computed(() => loadingStore.isLoading)
</script>

<style scoped lang="scss">
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  pointer-events: auto;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;

  // 防止用户交互
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.loading-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 24px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  min-width: 120px;
  max-width: 200px;
}

.loading-spinner {
  :deep(.van-loading__spinner) {
    color: #1989fa;
  }

  :deep(.van-loading__text) {
    margin-top: 8px;
  }
}

.loading-text {
  font-size: 14px;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
}

// 动画效果
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: all 0.3s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

.loading-fade-enter-to,
.loading-fade-leave-from {
  opacity: 1;
}

.loading-fade-enter-active .loading-content,
.loading-fade-leave-active .loading-content {
  transition: all 0.3s ease;
}

.loading-fade-enter-from .loading-content,
.loading-fade-leave-to .loading-content {
  transform: scale(0.8);
  opacity: 0;
}

.loading-fade-enter-to .loading-content,
.loading-fade-leave-from .loading-content {
  transform: scale(1);
  opacity: 1;
}

// 移动端优化
@media (max-width: 480px) {
  .loading-content {
    padding: 20px 28px;
    border-radius: 10px;
    min-width: 100px;
  }

  .loading-text {
    font-size: 13px;
  }
}

// 暗色模式支持
@media (prefers-color-scheme: dark) {
  .loading-overlay {
    background: rgba(0, 0, 0, 0.6);
  }

  .loading-content {
    background: rgba(30, 30, 30, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .loading-text {
    color: #e0e0e0;
  }
}
</style>
