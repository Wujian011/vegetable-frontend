<template>
  <van-nav-bar
    :title="title"
    :left-text="leftText"
    :right-text="rightText"
    :left-arrow="!isHomePage"
    @click-left="onClickLeft"
    @click-right="onClickRight"
    :class="['global-header', { 'home-header': isHomePage }]"
  >
    <template #left v-if="!isHomePage">
      <van-icon name="wap-home-o" size="18" @click="goHome" />
    </template>

    <template #right v-if="!isHomePage">
      <van-icon name="search" size="18" @click="onSearch" />
    </template>
  </van-nav-bar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 判断是否为首页
const isHomePage = computed(() => {
  return route.path === '/' || route.name === 'home'
})

// 动态标题
const title = computed<string>(() => {
  if (isHomePage.value) {
    return '恋爱菜谱'
  }
  return (route.meta?.title as string) || '恋爱菜谱'
})

const leftText = ref('')
const rightText = ref('')

// 点击左侧按钮
const onClickLeft = () => {
  if (router.getRoutes().length > 1) {
    router.back()
  }
}

// 点击右侧按钮
const onClickRight = () => {
  console.log('点击右侧按钮')
}

// 回到首页
const goHome = () => {
  router.push('/')
}

// 搜索功能
const onSearch = () => {
  console.log('搜索功能')
  // 这里可以跳转到搜索页面或打开搜索弹窗
}
</script>

<style scoped lang="scss">
.global-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);

  // 其他页面的默认样式
  :deep(.van-nav-bar__title) {
    color: var(--text-primary);
    font-weight: 600;
  }

  :deep(.van-icon) {
    color: var(--primary-color);
  }

  // 首页特殊样式
  &.home-header {
    background: var(--gradient-primary);
    border-bottom: none;
    box-shadow: var(--shadow-md);

    :deep(.van-nav-bar__title) {
      color: var(--text-white);
      font-weight: 700;
      font-size: 18px;
      letter-spacing: 1px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      &::before {
        content: '💕';
        margin-right: var(--spacing-xs);
      }

      &::after {
        content: '💕';
        margin-left: var(--spacing-xs);
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .global-header {
    height: 46px;

    &.home-header {
      :deep(.van-nav-bar__title) {
        font-size: 16px;
        letter-spacing: 0.5px;
      }
    }
  }
}

@media (min-width: 769px) {
  .global-header {
    &.home-header {
      :deep(.van-nav-bar__title) {
        font-size: 20px;
        letter-spacing: 1.5px;
      }
    }
  }
}
</style>
