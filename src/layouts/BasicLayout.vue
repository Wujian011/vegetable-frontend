<template>
  <div class="basic-layout">
    <!-- 顶部导航栏 -->
    <div class="header">
      <GlobalHeader />
    </div>
    
    <!-- 中间内容区域 -->
    <div class="main-content">
      <router-view />
    </div>
    
    <!-- 底部标签栏 -->
    <div class="footer">
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
  margin-top: 46px; /* 为顶部导航栏预留空间 */
  margin-bottom: 50px; /* 为底部标签栏预留空间 */
  overflow-y: auto;
  padding: 16px;
}

.footer {
  /* GlobalFooter组件内部已设置fixed定位 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    margin-top: 46px;
    margin-bottom: 50px;
    padding: 12px;
  }
}

@media (min-width: 769px) {
  .main-content {
    margin-top: 46px;
    margin-bottom: 60px;
    padding: 20px;
  }
}
</style>