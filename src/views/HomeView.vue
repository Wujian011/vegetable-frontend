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
        <van-sidebar v-model="activeCategory" @change="onCategoryChange">
          <van-sidebar-item
            v-for="category in categories"
            :key="category.id"
            :title="category.name"
          />
        </van-sidebar>
        <van-button
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
      <div class="dishes-content">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div class="dishes-grid">
            <div
              v-for="dish in dishes"
              :key="dish.id"
              class="dish-item"
              @click="showDishDetail(dish)"
            >
              <div class="dish-image">
                <van-image :src="getDishImage(dish.id)" fit="cover" loading-icon="photo" />
              </div>
              <div class="dish-info">
                <div class="dish-name">{{ dish.name }}</div>
                <div class="dish-material">{{ dish.material }}</div>
                <div class="dish-price">¥{{ dish.price }}</div>
              </div>
              <div class="dish-actions">
                <van-button size="small" round type="primary" @click.stop="addToCart(dish)">
                  加购物车
                </van-button>
              </div>
            </div>
          </div>
        </van-list>
      </div>
    </div>

    <!-- 购物车底部栏 -->
    <div class="cart-section">
      <van-submit-bar
        :price="totalPrice * 100"
        button-text="去结算"
        :loading="submitLoading"
        @submit="goToCheckout"
      >
        <template #default>
          <div class="cart-info" @click="showCartDetail">
            <van-icon name="shopping-cart-o" size="20" />
            <span class="cart-count" v-if="cartItems.length > 0">
              {{ cartItems.length }}
            </span>
            <span class="cart-text">购物车</span>
          </div>
        </template>
      </van-submit-bar>
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
          <div class="detail-actions">
            <van-stepper v-model="selectedQuantity" min="1" max="99" />
            <van-button type="primary" round size="large" @click="addSelectedToCart">
              加入购物车
            </van-button>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 购物车详情弹窗 -->
    <van-popup v-model:show="showCart" position="bottom" :style="{ height: '70%' }" round>
      <div class="cart-detail">
        <div class="cart-header">
          <van-nav-bar title="购物车" left-arrow @click-left="showCart = false" />
        </div>
        <div class="cart-content">
          <van-empty v-if="cartItems.length === 0" description="购物车空空如也" />
          <div v-else>
            <div v-for="item in cartItems" :key="item.id" class="cart-item">
              <div class="cart-item-info">
                <span class="cart-item-name">{{ getDishName(item.dishesId) }}</span>
                <span class="cart-item-price">¥{{ getDishPrice(item.dishesId) }}</span>
              </div>
              <div class="cart-item-actions">
                <van-stepper
                  :model-value="item.number"
                  min="0"
                  @change="updateCartQuantity(item, $event)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { showToast, showDialog } from 'vant'
import { getClassificationItem, listClassificationVoByPage } from '@/api/classificationController'
import { listDishesVoByPage } from '@/api/dishesController'
import { list as getCartList } from '@/api/shoppingCartController'

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
const selectedQuantity = ref(1)

// 购物车相关
const showCart = ref(false)
const cartItems = ref<API.ShoppingCart[]>([])
const submitLoading = ref(false)

// 计算总价
const totalPrice = computed(() => {
  return cartItems.value.reduce((total, item) => {
    const dish = dishes.value.find((d) => d.id === item.dishesId)
    return total + (dish?.price || 0) * (item.number || 0)
  }, 0)
})

// 获取菜品图片（模拟）
const getDishImage = (dishId?: number) => {
  // 这里可以根据实际情况返回图片URL
  return `https://via.placeholder.com/150?text=菜品${dishId}`
}

// 获取菜品名称
const getDishName = (dishesId?: number) => {
  const dish = dishes.value.find((d) => d.id === dishesId)
  return dish?.name || '未知菜品'
}

// 获取菜品价格
const getDishPrice = (dishesId?: number) => {
  const dish = dishes.value.find((d) => d.id === dishesId)
  return dish?.price || 0
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
  console.log('切换分类:', index)
  currentPage.value = 1
  dishes.value = []
  finished.value = false
  loadDishes()
}

// 加载菜品列表
const onLoad = () => {
  loadDishes()
}

// 获取分类列表
const loadCategories = async () => {
  try {
    const response = await getClassificationItem()
    if (response.data.code === 0) {
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
  if (loading.value) return

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
  selectedQuantity.value = 1
  showDetail.value = true
}

// 添加到购物车
const addToCart = async (dish: API.DishesVO) => {
  try {
    // 这里应该调用添加购物车的API
    // 暂时模拟添加到本地购物车
    const existingItem = cartItems.value.find((item) => item.dishesId === dish.id)

    if (existingItem) {
      existingItem.number = (existingItem.number || 0) + 1
    } else {
      cartItems.value.push({
        id: Date.now(), // 临时ID
        dishesId: dish.id,
        number: 1,
      })
    }

    showToast('已添加到购物车')
  } catch (error) {
    console.error('添加购物车失败:', error)
    showToast('添加失败')
  }
}

// 从详情页添加到购物车
const addSelectedToCart = () => {
  if (selectedDish.value) {
    const existingItem = cartItems.value.find((item) => item.dishesId === selectedDish.value?.id)

    if (existingItem) {
      existingItem.number = (existingItem.number || 0) + selectedQuantity.value
    } else {
      cartItems.value.push({
        id: Date.now(),
        dishesId: selectedDish.value.id,
        number: selectedQuantity.value,
      })
    }

    showToast('已添加到购物车')
    showDetail.value = false
  }
}

// 显示购物车详情
const showCartDetail = () => {
  showCart.value = true
}

// 更新购物车数量
const updateCartQuantity = (item: API.ShoppingCart, quantity: number) => {
  if (quantity === 0) {
    // 删除商品
    const index = cartItems.value.findIndex((cart) => cart.id === item.id)
    if (index > -1) {
      cartItems.value.splice(index, 1)
    }
  } else {
    item.number = quantity
  }
}

// 去结算
const goToCheckout = () => {
  if (cartItems.value.length === 0) {
    showToast('购物车为空')
    return
  }

  showDialog({
    title: '确认结算',
    message: `总计：¥${totalPrice.value.toFixed(2)}`,
  })
    .then(() => {
      // 这里应该跳转到结算页面
      showToast('跳转到结算页面')
    })
    .catch(() => {
      // 取消结算
    })
}

// 加载购物车数据
const loadCartData = async () => {
  try {
    const response = await getCartList()
    if (response.data) {
      cartItems.value = response.data
    }
  } catch (error) {
    console.error('获取购物车数据失败:', error)
  }
}

// 页面初始化
onMounted(() => {
  loadCategories()
  loadDishes()
  loadCartData()
})
</script>

<style scoped></style>
