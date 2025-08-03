<template>
  <div class="home-page">
    <!-- 搜索栏 -->
    <div class="search-section">
      <van-search
        v-model="searchValue"
        placeholder="搜索菜品名称"
        @search="onSearch"
        @clear="onClear"
        background="#f8f8f8"
        shape="round"
      />
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
                thumb="https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg"
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
          <span v-if="searchValue" class="search-info">搜索: "{{ searchValue }}"</span>
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

const router = useRouter()

// 用户状态
const loginUserStore = useLoginUserStore()

// 计算是否为管理员
const isAdmin = computed(() => {
  return loginUserStore.loginUser.userRole === 'admin'
})

// 搜索相关
const searchValue = ref('')

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

// 购物车相关
const cartItems = ref<Array<API.DishesVO & { quantity: number }>>([])

// 计算购物车总价
const cartTotalPrice = computed(() => {
  return cartItems.value
    .reduce((total, item) => {
      return total + (item.price || 0) * item.quantity
    }, 0)
    .toFixed(2)
})

// 当前分类信息
const currentCategoryInfo = computed(() => {
  const categoryName = categories.value[activeCategory.value]?.name || '全部'
  const dishCount = dishes.value.length

  if (searchValue.value) {
    return `"${categoryName}"中找到 ${dishCount} 道菜品`
  } else {
    return `"${categoryName}"共 ${dishCount} 道菜品`
  }
})

// 获取菜品图片（模拟）
const getDishImage = (dishId?: number) => {
  // 这里可以根据实际情况返回图片URL
  return `https://via.placeholder.com/150?text=菜品${dishId}`
}

// 搜索功能
const onSearch = (value: string) => {
  console.log('搜索:', value)
  currentPage.value = 1
  dishes.value = []
  finished.value = false
  loadDishes()
}

const onClear = () => {
  searchValue.value = ''
  currentPage.value = 1
  dishes.value = []
  finished.value = false
  loadDishes()
}

// 分类切换
const onCategoryChange = (index: number) => {
  console.log(index)

  // 如果搜索框有内容，先清空搜索
  if (searchValue.value) {
    searchValue.value = ''
  }

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

    // 如果有搜索关键词
    if (searchValue.value) {
      queryParams.name = searchValue.value
    }

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
  const existingItem = cartItems.value.find((item) => item.id === dish.id)

  if (existingItem) {
    // 如果商品已存在，增加数量
    existingItem.quantity += 1
    showToast(`"${dish.name}"数量已增加`)
  } else {
    // 如果商品不存在，添加新商品
    cartItems.value.push({
      ...dish,
      quantity: 1,
    })
    showToast(`已将"${dish.name}"添加到购物车`)
  }
}

// 清空购物车
const clearCart = async () => {
  try {
    await showConfirmDialog({
      title: '确认清空',
      message: '确定要清空购物车吗？',
    })

    cartItems.value = []
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
  await loadCategories()
  await loadDishes()
})
</script>

<style scoped lang="scss">
.home-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.search-section {
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.category-sidebar {
  width: 100px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;

  .add-category-button {
    margin: 12px 8px 8px;
    font-size: 12px;
    height: 32px;
  }
}

.dishes-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  // 管理员模式下为底部栏预留空间
  &.has-admin-bar {
    padding-bottom: calc(16px + 80px); // 原有padding + 管理员底部栏高度
  }

  // 用户购物车模式下为底部栏预留空间
  &.has-cart-bar {
    padding-bottom: calc(16px + 80px); // 原有padding + 购物车底部栏高度
  }
}

.dishes-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.dish-item {
  margin-bottom: 16px;

  .van-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition:
      box-shadow 0.2s,
      transform 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .admin-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 8px;
  }

  .user-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 8px;
  }
}

// 管理员：底部管理栏
.admin-bottom-bar {
  background: white;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  bottom: 50px; // 为tabbar预留空间
  left: 0;
  right: 0;
  z-index: 999; // 低于tabbar的z-index
}

// 用户：购物车管理底部栏
.cart-bottom-bar {
  background: white;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  bottom: 50px; // 为tabbar预留空间
  left: 0;
  right: 0;
  z-index: 999; // 低于tabbar的z-index
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
  gap: 8px;

  .info-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .dish-count {
    font-size: 14px;
    color: #1f2937;
    font-weight: 600;
  }

  .search-info {
    font-size: 12px;
    color: #6b7280;
    font-weight: 400;
  }
}

.admin-actions {
  display: flex;
  gap: 12px;

  .admin-action-btn {
    min-width: 80px;
    height: 36px;
    font-size: 14px;
    font-weight: 600;
  }
}

// 菜品详情弹窗
.dish-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.detail-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
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
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;

  h3 {
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 12px;
  }

  .detail-material {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .detail-price {
    font-size: 24px;
    font-weight: 700;
    color: #ef4444;
  }
}

.detail-actions {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  .van-button {
    flex: 1;
    height: 44px;
    font-size: 16px;
    font-weight: 600;
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
      min-width: 70px;
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
