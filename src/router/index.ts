import { createRouter, createWebHistory } from 'vue-router'
import { showToast } from 'vant'
import HomeView from '../views/HomeView.vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { COUPLE_ROLE } from '@/constants/userRole'

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
      path: '/join-family/:userId',
      name: 'joinFamilyByLink',
      component: () => import('../views/user/JoinFamilyByLinkView.vue'),
      meta: {
        hideTabBar: true,
        hideHeader: true,
        title: '加入家庭',
      },
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/CartView.vue'),
      meta: {
        hideHeader: true, // 隐藏顶部导航栏
        title: '购物车',
        requiresFoodie: true, // 需要吃货权限
      },
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/OrdersView.vue'),
      meta: {
        hideHeader: true, // 隐藏顶部导航栏
        title: '我的订单',
        requiresFoodie: true, // 需要吃货权限
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: {
        hideHeader: true, // 隐藏顶部导航栏
        title: '个人中心',
      },
    },
    {
      path: '/feeder/category',
      name: 'category',
      component: () => import('../views/admin/CategoryView.vue'),
      meta: {
        hideTabBar: true, // 隐藏底部tabBar
        hideHeader: true, // 隐藏顶部导航栏
        title: '分类管理',
        requiresFeeder: true, // 需要饲养员权限
      },
    },
    {
      path: '/feeder/dish/add',
      name: 'dishAdd',
      component: () => import('../views/admin/DishManageView.vue'),
      meta: {
        hideTabBar: true,
        hideHeader: true,
        title: '新增菜品',
        requiresFeeder: true, // 需要饲养员权限
      },
    },
    {
      path: '/feeder/dish/edit',
      name: 'dishEdit',
      component: () => import('../views/admin/DishManageView.vue'),
      meta: {
        hideTabBar: true,
        hideHeader: true,
        title: '编辑菜品',
        requiresFeeder: true, // 需要饲养员权限
      },
    },
    {
      path: '/feeder/dish/sort',
      name: 'dishSort',
      component: () => import('../views/admin/DishSortView.vue'),
      meta: {
        hideTabBar: true,
        hideHeader: true,
        title: '菜谱排序',
        requiresFeeder: true, // 需要饲养员权限
      },
    },
  ],
})

// 路由守卫 - 基于家庭角色控制访问权限
router.beforeEach((to, from, next) => {
  const loginUserStore = useLoginUserStore()
  const currentUser = loginUserStore.loginUser

  // 检查是否需要饲养员权限
  if (to.meta.requiresFeeder) {
    // 检查用户是否已登录
    if (!currentUser.id) {
      showToast('请先登录')
      next('/user/login')
      return
    }

    // 检查用户是否有伴侣（已绑定家庭关系）
    if (!currentUser.hasPartner) {
      showToast('请先绑定家庭关系')
      next('/')
      return
    }

    // 检查用户是否为饲养员角色
    if (currentUser.coupleRole !== COUPLE_ROLE.FEEDER) {
      showToast('只有饲养员可以管理菜品')
      next('/')
      return
    }
  }

  // 检查是否需要吃货权限（购物车、订单等）
  if (to.meta.requiresFoodie) {
    // 检查用户是否已登录
    if (!currentUser.id) {
      showToast('请先登录')
      next('/user/login')
      return
    }

    // 检查用户是否有伴侣（已绑定家庭关系）
    if (!currentUser.hasPartner) {
      showToast('请先绑定家庭关系')
      next('/')
      return
    }

    // 检查用户是否为吃货角色
    if (currentUser.coupleRole !== COUPLE_ROLE.FOODIE) {
      showToast('只有吃货可以下单购买')
      next('/')
      return
    }
  }

  next()
})

export default router
