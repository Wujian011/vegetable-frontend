<template>
  <van-tabbar 
    v-model="active" 
    class="global-footer"
    fixed
    placeholder
    @change="onChange"
  >
    <van-tabbar-item 
      icon="wap-home-o" 
      name="home"
      to="/"
    >
      首页
    </van-tabbar-item>
    
    <van-tabbar-item 
      icon="apps-o" 
      name="category"
      to="/category"
    >
      分类
    </van-tabbar-item>
    
    <van-tabbar-item 
      icon="shopping-cart-o" 
      name="cart"
      to="/cart"
      :badge="cartCount > 0 ? cartCount : ''"
    >
      购物车
    </van-tabbar-item>
    
    <van-tabbar-item 
      icon="user-o" 
      name="profile"
      to="/profile"
    >
      我的
    </van-tabbar-item>
  </van-tabbar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 当前激活的标签
const active = ref('home')

// 购物车数量（示例数据，实际应该从store获取）
const cartCount = ref(0)

// 监听路由变化，更新激活状态
const updateActiveTab = () => {
  const path = route.path
  if (path === '/') {
    active.value = 'home'
  } else if (path.startsWith('/category')) {
    active.value = 'category'
  } else if (path.startsWith('/cart')) {
    active.value = 'cart'
  } else if (path.startsWith('/profile')) {
    active.value = 'profile'
  }
}

// 标签切换事件
const onChange = (name: string) => {
  console.log('切换到标签:', name)
  // 路由跳转由 van-tabbar-item 的 to 属性自动处理
}

// 初始化激活状态
updateActiveTab()
</script>

<style scoped>
.global-footer {
  background-color: #fff;
  border-top: 1px solid #ebedf0;
}

/* 确保标签栏在最底部 */
:deep(.van-tabbar) {
  position: fixed !important;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.van-tabbar) {
    height: 50px;
  }
  
  :deep(.van-tabbar-item) {
    font-size: 12px;
  }
}

@media (min-width: 769px) {
  :deep(.van-tabbar) {
    height: 60px;
  }
  
  :deep(.van-tabbar-item) {
    font-size: 14px;
  }
}
</style>