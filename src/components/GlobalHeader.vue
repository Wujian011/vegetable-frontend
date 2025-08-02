<template>
  <van-nav-bar
    :title="title"
    :left-text="leftText"
    :right-text="rightText"
    left-arrow
    @click-left="onClickLeft"
    @click-right="onClickRight"
    class="global-header"
  >
    <template #left>
      <van-icon name="wap-home-o" size="18" @click="goHome" />
    </template>
    
    <template #right>
      <van-icon name="search" size="18" @click="onSearch" />
    </template>
  </van-nav-bar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 动态标题
const title = computed(() => {
  return route.meta?.title || '蔬菜商城'
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

<style scoped>
.global-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .global-header {
    height: 46px;
  }
}
</style>