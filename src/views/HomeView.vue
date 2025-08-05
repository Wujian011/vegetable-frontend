<template>
  <div class="home-page">
    <!-- 家庭关系展示区域 -->
    <div class="family-section">
      <FamilyRelation />
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧分类菜单 -->
      <div class="category-sidebar">
        <van-sidebar v-model="activeCategory">
          <van-sidebar-item
            @click="onCategoryChange"
            v-for="category in categories"
            :key="category.id"
            :title="category.name"
          />
        </van-sidebar>
        <!-- 管理员才显示分类管理按钮 -->
        <van-button
          v-if="isAdmin"
          type="primary"
          round
          size="small"
          class="add-category-button"
          to="/admin/category"
        >
          分类管理
        </van-button>
      </div>

      <!-- 右侧菜品列表 -->
      <div
        class="dishes-content"
        :class="{ 'has-admin-bar': isAdmin, 'has-cart-bar': !isAdmin && cartItems.length > 0 }"
      >
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了">
          <div class="dishes-grid">
            <div v-for="dish in dishes" :key="dish.id" class="dish-item">
              <van-card
                :price="dish.price"
                :title="dish.name"
                :thumb="dish.dishesImage"
                @click="showDishDetail(dish)"
              >
                <template #tags>
                  <van-tag v-if="isAdmin" plain type="primary"> 销量: 0</van-tag>
                </template>

                <template #footer>
                  <!-- 管理员显示编辑和删除按钮 -->
                  <div v-if="isAdmin" class="admin-actions">
                    <van-button size="mini" type="primary" @click.stop="goToEditDish(dish)">
                      编辑
                    </van-button>
                    <van-button size="mini" type="danger" @click.stop="deleteDish(dish)">
                      删除
                    </van-button>
                  </div>

                  <!-- 普通用户显示加购物车按钮 -->
                  <div v-else class="user-actions">
                    <van-button
                      icon="plus"
                      size="small"
                      type="primary"
                      round
                      @click.stop="addToCart(dish)"
                    >
                      加购物车
                    </van-button>
                  </div>
                </template>
              </van-card>
            </div>
          </div>
        </van-list>
      </div>
    </div>

    <!-- 管理员：菜品管理底部栏 -->
    <div v-if="isAdmin" class="admin-bottom-bar">
      <div class="admin-info">
        <van-icon name="records" size="20" />
        <div class="info-details">
          <span class="dish-count">{{ currentCategoryInfo }}</span>
          <!-- 搜索信息已移除 -->
        </div>
      </div>
      <div class="admin-actions">
        <van-button type="primary" round size="small" @click="goToAddDish" class="admin-action-btn">
          添加菜谱
        </van-button>
        <van-button
          type="default"
          round
          size="small"
          @click="goToSortDish"
          class="admin-action-btn"
        >
          菜谱排序
        </van-button>
      </div>
    </div>

    <!-- 用户：购物车管理底部栏 -->
    <div v-if="!isAdmin" class="cart-bottom-bar">
      <div class="cart-info">
        <van-icon name="shopping-cart-o" size="20" />
        <div class="info-details">
          <span class="cart-count">已选 {{ cartItems.length }} 件商品</span>
          <span class="cart-total">合计: ¥{{ cartTotalPrice }}</span>
        </div>
      </div>
      <div class="cart-actions">
        <van-button
          type="default"
          round
          size="small"
          @click="clearCart"
          class="cart-action-btn"
          :disabled="cartItems.length === 0"
        >
          清空购物车
        </van-button>
        <van-button type="primary" round size="small" @click="goToCart" class="cart-action-btn">
          去结算
        </van-button>
      </div>
    </div>

    <!-- 菜品详情弹窗 -->
    <van-popup v-model:show="showDetail" position="bottom" :style="{ height: '60%' }" round>
      <div class="dish-detail" v-if="selectedDish">
        <div class="detail-header">
          <van-nav-bar title="菜品详情" left-arrow @click-left="showDetail = false" />
        </div>
        <div class="detail-content">
          <van-image :src="getDishImage(selectedDish.id)" fit="cover" class="detail-image" />
          <div class="detail-info">
            <h3>{{ selectedDish.name }}</h3>
            <p class="detail-material">原料：{{ selectedDish.material }}</p>
            <div class="detail-price">¥{{ selectedDish.price }}</div>
          </div>
          <div class="detail-actions" v-if="!isAdmin">
            <van-button type="primary" round size="large" @click="addToCart(selectedDish)">
              加入购物车
            </van-button>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { getClassificationItem } from '@/api/classificationController'
import { listDishesVoByPage, deleteDishes } from '@/api/dishesController'
import { useLoginUserStore } from '@/stores/loginUser'
import { useCartStore } from '@/stores/cart'
import FamilyRelation from '@/components/FamilyRelation.vue'

const router = useRouter()

// 用户状态
const loginUserStore = useLoginUserStore()
const cartStore = useCartStore()

// 计算是否为管理员
const isAdmin = computed(() => {
  return loginUserStore.loginUser.userRole === 'admin'
})

// 搜索功能已移除

// 分类相关
const activeCategory = ref(0)
const categories = ref<API.ClassificationVO[]>([])

// 菜品相关
const dishes = ref<API.DishesVO[]>([])
const loading = ref(false)
const finished = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

// 菜品详情
const showDetail = ref(false)
const selectedDish = ref<API.DishesVO | null>(null)

// 购物车相关（使用store）
const cartItems = computed(() => cartStore.cartItems)
const cartTotalPrice = computed(() => cartStore.cartTotalPrice)

// 当前分类信息
const currentCategoryInfo = computed(() => {
  const categoryName = categories.value[activeCategory.value]?.name || '全部'
  const dishCount = dishes.value.length
  return `"${categoryName}"共 ${dishCount} 道菜品`
})

// 获取菜品图片（模拟）
const getDishImage = (dishId?: number) => {
  // 这里可以根据实际情况返回图片URL
  return `https://via.placeholder.com/150?text=菜品${dishId}`
}

// 搜索功能已移除

// 分类切换
const onCategoryChange = (index: number) => {
  console.log(index)

  // 重置分页和数据
  currentPage.value = 1
  dishes.value = []
  finished.value = false

  // 重新加载菜品数据
  loadDishes()
}

// 获取分类列表
const loadCategories = async () => {
  try {
    const response = await getClassificationItem()
    if (response.data.code === 0 && response.data.data) {
      // 添加"全部"分类
      categories.value = [{ id: 0, name: '全部', code: 'all' }, ...response.data.data]
    }
  } catch (error) {
    console.error('获取分类失败:', error)
    showToast('获取分类失败')
  }
}

// 获取菜品列表
const loadDishes = async () => {
  loading.value = true
  try {
    const queryParams: API.DishesQueryRequest = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    }

    // 搜索功能已移除

    // 根据选中的分类筛选（排除"全部"分类，即index为0的情况）
    if (activeCategory.value > 0 && categories.value[activeCategory.value]) {
      queryParams.classificationId = categories.value[activeCategory.value].id
    }

    const response = await listDishesVoByPage(queryParams)

    if (response.data.code === 0 && response.data.data?.records) {
      const newDishes = response.data.data.records

      if (currentPage.value === 1) {
        dishes.value = newDishes
      } else {
        dishes.value.push(...newDishes)
      }

      // 判断是否还有更多数据
      if (newDishes.length < pageSize.value) {
        finished.value = true
      } else {
        currentPage.value++
      }
    } else {
      finished.value = true
    }
  } catch (error) {
    console.error('获取菜品失败:', error)
    showToast('获取菜品失败')
  } finally {
    loading.value = false
  }
}

// 显示菜品详情
const showDishDetail = (dish: API.DishesVO) => {
  selectedDish.value = dish
  showDetail.value = true
}

// 添加到购物车
const addToCart = (dish: API.DishesVO) => {
  const result = cartStore.addToCart(dish)

  if (result.isNew) {
    showToast(`已将"${dish.name}"添加到购物车`)
  } else {
    showToast(`"${dish.name}"数量已增加`)
  }

  // 保存到本地存储
  cartStore.saveToLocalStorage()
}

// 清空购物车
const clearCart = async () => {
  try {
    await showConfirmDialog({
      title: '确认清空',
      message: '确定要清空购物车吗？',
    })

    cartStore.clearCart()
    cartStore.saveToLocalStorage()
    showToast('购物车已清空')
  } catch {
    // 用户取消操作
  }
}

// 跳转到购物车页面
const goToCart = () => {
  router.push('/cart')
}

// 管理员功能：跳转到新增菜品页面
const goToAddDish = () => {
  router.push('/admin/dish/add')
}

// 管理员功能：跳转到编辑菜品页面
const goToEditDish = (dish: API.DishesVO) => {
  router.push({
    path: '/admin/dish/edit',
    query: { id: dish.id },
  })
}

// 管理员功能：删除菜品
const deleteDish = async (dish: API.DishesVO) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除菜品"${dish.name}"吗？`,
    })

    if (dish.id) {
      await deleteDishes({ id: dish.id })
      showToast('删除成功')
      // 重新加载菜品列表
      currentPage.value = 1
      dishes.value = []
      finished.value = false
      loadDishes()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除菜品失败:', error)
      showToast('删除失败')
    }
  }
}

// 管理员功能：跳转到菜品排序页面
const goToSortDish = () => {
  router.push('/admin/dish/sort')
}

// 页面初始化
onMounted(async () => {
  // 加载购物车数据
  cartStore.loadFromLocalStorage()

  await loadCategories()
  await loadDishes()
})
</script>

<style scoped lang="scss">
.home-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
}

.family-section {
  background: var(--bg-card);
  // 家庭关系组件的样式在组件内部定义
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.category-sidebar {
  width: 100px;
  background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;

  .add-category-button {
    margin: var(--spacing-md) var(--spacing-sm) var(--spacing-sm);
    font-size: 12px;
    height: 32px;
    background: var(--gradient-primary);
    border: none;
    color: var(--text-white);
  }
}

.dishes-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);

  // 管理员模式下为底部栏预留空间
  &.has-admin-bar {
    padding-bottom: calc(var(--spacing-lg) + 80px);
  }

  // 用户购物车模式下为底部栏预留空间
  &.has-cart-bar {
    padding-bottom: calc(var(--spacing-lg) + 80px);
  }
}

.dishes-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
}

.dish-item {
  margin-bottom: var(--spacing-lg);

  .van-card {
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    transition: all 0.2s ease;
    background: var(--bg-card);

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
  }

  .admin-actions {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;
    margin-top: var(--spacing-sm);

    .van-button {
      background: var(--gradient-primary);
      border: none;
      color: var(--text-white);
      border-radius: var(--radius-md);
    }
  }

  .user-actions {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;
    margin-top: var(--spacing-sm);

    .van-button {
      background: var(--gradient-primary);
      border: none;
      color: var(--text-white);
      border-radius: var(--radius-md);
    }
  }
}

// 管理员：底部管理栏
.admin-bottom-bar {
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  z-index: 999;
}

// 用户：购物车管理底部栏
.cart-bottom-bar {
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  z-index: 999;
}

.cart-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .info-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .cart-count {
    font-size: 14px;
    color: #1f2937;
    font-weight: 600;
  }

  .cart-total {
    font-size: 12px;
    color: #ef4444;
    font-weight: 600;
  }
}

.cart-actions {
  display: flex;
  gap: 12px;

  .cart-action-btn {
    min-width: 80px;
    height: 36px;
    font-size: 14px;
    font-weight: 600;
  }
}

.admin-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  .info-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .dish-count {
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 600;
  }

  .search-info {
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 400;
  }
}

.admin-actions {
  display: flex;
  gap: var(--spacing-md);

  .admin-action-btn {
    min-width: 80px;
    height: 36px;
    font-size: 14px;
    font-weight: 600;
    background: var(--gradient-primary);
    border: none;
    color: var(--text-white);
    border-radius: var(--radius-md);
  }
}

// 菜品详情弹窗
.dish-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
}

.detail-header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
}

.detail-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.detail-image {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.detail-info {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-sm);

  h3 {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
  }

  .detail-material {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: var(--spacing-lg);
  }

  .detail-price {
    font-size: 24px;
    font-weight: 700;
    color: var(--primary-color);
  }
}

.detail-actions {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  box-shadow: var(--shadow-sm);

  .van-button {
    flex: 1;
    height: 44px;
    font-size: 16px;
    font-weight: 600;
    background: var(--gradient-primary);
    border: none;
    color: var(--text-white);
  }
}

// 响应式设计
@media (max-width: 480px) {
  .dishes-grid {
    grid-template-columns: 1fr;
  }

  .dish-item {
    .admin-actions,
    .user-actions {
      .van-button {
        font-size: 12px;
      }
    }
  }

  .admin-actions {
    gap: 8px;

    .admin-action-btn {
      flex: 1;
      min-width: 70px;
      font-size: 12px;
    }
  }

  .cart-actions {
    gap: 8px;

    .cart-action-btn {
      flex: 1;
      min-width: 80px;
      font-size: 12px;
    }
  }

  .admin-bottom-bar,
  .cart-bottom-bar {
    bottom: 50px; // 移动端tabbar高度
    gap: 12px;
    align-items: stretch;
  }
}

// 大屏幕下的底部栏适配
@media (min-width: 769px) {
  .admin-bottom-bar,
  .cart-bottom-bar {
    bottom: 60px; // 桌面端tabbar高度
  }
}

// 自定义滚动条
.dishes-content,
.detail-content {
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;

    &:hover {
      background: rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
