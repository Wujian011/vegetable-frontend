import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/user/login',
      name: 'login',
      component: () => import('../views/user/LoginView.vue'),
    },
    {
      path: '/user/register',
      name: 'register',
      component: () => import('../views/user/RegisterView.vue'),
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/CartView.vue'),
      meta: {
        hideHeader: true, // 隐藏顶部导航栏
        title: '购物车',
      },
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/OrdersView.vue'),
      meta: {
        hideHeader: true, // 隐藏顶部导航栏
        title: '我的订单',
      },
    },
    {
      path: '/admin/category',
      name: 'category',
      component: () => import('../views/admin/CategoryView.vue'),
      meta: {
        hideTabBar: true, // 隐藏底部tabBar
        hideHeader: true, // 隐藏顶部导航栏
        title: '分类管理',
      },
    },
    {
      path: '/admin/dish/add',
      name: 'dishAdd',
      component: () => import('../views/admin/DishManageView.vue'),
      meta: {
        hideTabBar: true,
        hideHeader: true,
        title: '新增菜品',
      },
    },
    {
      path: '/admin/dish/edit',
      name: 'dishEdit',
      component: () => import('../views/admin/DishManageView.vue'),
      meta: {
        hideTabBar: true,
        hideHeader: true,
        title: '编辑菜品',
      },
    },
    {
      path: '/admin/dish/sort',
      name: 'dishSort',
      component: () => import('../views/admin/DishSortView.vue'),
      meta: {
        hideTabBar: true,
        hideHeader: true,
        title: '菜谱排序',
      },
    },
  ],
})

export default router
