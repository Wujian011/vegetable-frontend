<template>
  <div class="basic-layout">
    <!-- 顶部导航栏 -->
    <div class="header" v-if="!$route.meta?.hideHeader">
      <GlobalHeader />
    </div>

    <!-- 中间内容区域 -->
    <div
      class="main-content"
      :class="{
        'no-tabbar': $route.meta?.hideTabBar,
        'no-header': $route.meta?.hideHeader,
      }"
    >
      <router-view />
    </div>

    <!-- 底部标签栏 -->
    <div class="footer" v-if="!$route.meta?.hideTabBar">
      <GlobalFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalFooter from '@/components/GlobalFooter.vue'
</script>

<style scoped>
.basic-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  //padding: 16px;

  /* 有全局header时预留顶部空间 */
  &:not(.no-header) {
    margin-top: 46px;
  }

  /* 有tabBar时预留底部空间 */
  &:not(.no-tabbar) {
    margin-bottom: 50px;
  }
}

.footer {
  /* GlobalFooter组件内部已设置fixed定位 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {

    &:not(.no-header) {
      margin-top: 46px;
    }

    &:not(.no-tabbar) {
      margin-bottom: 50px;
    }
  }
}

@media (min-width: 769px) {
  .main-content {

    &:not(.no-header) {
      margin-top: 46px;
    }

    &:not(.no-tabbar) {
      margin-bottom: 60px;
    }
  }
}
</style>
