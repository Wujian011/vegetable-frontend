<template>
  <div class="cart-page">
    <!-- 顶部导航栏 -->
    <div class="cart-header">
      <van-nav-bar title="购物车" left-arrow @click-left="goBack" />
    </div>

    <!-- 购物车内容 -->
    <div class="cart-content">
      <!-- 空购物车状态 -->
      <div v-if="cartItems.length === 0" class="empty-cart">
        <van-empty description="购物车是空的">
          <van-button type="primary" round @click="goToHome">去选购</van-button>
        </van-empty>
      </div>

      <!-- 购物车商品列表 -->
      <div v-else>
        <!-- 购物车商品 -->
        <div class="cart-items">
          <van-swipe-cell v-for="item in cartItems" :key="item.id">
            <div class="cart-item">
              <van-checkbox v-model="item.selected" @change="updateItemSelection" />
              <div class="item-image">
                <van-image
                  :src="getDishImage(item.id)"
                  fit="cover"
                  width="80"
                  height="80"
                  radius="8"
                />
              </div>
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-material">{{ item.material || '暂无描述' }}</div>
                <div class="item-price">¥{{ item.price }}</div>
              </div>
              <div class="item-controls">
                <van-stepper
                  v-model="item.quantity"
                  :min="1"
                  :max="99"
                  @change="updateQuantity(item)"
                />
              </div>
            </div>
            <template #right>
              <van-button
                square
                type="danger"
                text="删除"
                class="delete-button"
                @click="removeItem(item)"
              />
            </template>
          </van-swipe-cell>
        </div>

        <!-- 底部结算栏 -->
        <div class="checkout-bar">
          <div class="checkout-left">
            <van-checkbox v-model="selectAll" @change="toggleSelectAll"> 全选</van-checkbox>
            <span class="selected-count">已选 {{ selectedItems.length }} 件</span>
          </div>
          <div class="checkout-right">
            <div class="total-price">
              <span class="total-label">合计:</span>
              <span class="total-amount">¥{{ totalPrice }}</span>
            </div>
            <van-button
              type="primary"
              round
              size="large"
              class="checkout-btn"
              :disabled="selectedItems.length === 0"
              @click="proceedToCheckout"
            >
              结算 ({{ selectedItems.length }})
            </van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单确认弹窗 -->
    <van-popup v-model:show="showCheckout" position="bottom" :style="{ height: '70%' }" round>
      <div class="checkout-popup">
        <div class="popup-header">
          <van-nav-bar title="确认订单" left-arrow @click-left="showCheckout = false" />
        </div>

        <div class="popup-content">
          <!-- 选中商品列表 -->
          <div class="selected-items">
            <h3>订单商品</h3>
            <div v-for="item in selectedItems" :key="item.id" class="checkout-item">
              <van-image
                :src="getDishImage(item.id)"
                fit="cover"
                width="50"
                height="50"
                radius="6"
              />
              <div class="checkout-item-info">
                <div class="checkout-item-name">{{ item.name }}</div>
                <div class="checkout-item-price">¥{{ item.price }} × {{ item.quantity }}</div>
              </div>
              <div class="checkout-item-total">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
            </div>
          </div>

          <!-- 订单汇总 -->
          <div class="order-summary">
            <van-cell-group>
              <van-cell title="商品小计" :value="`¥${totalPrice}`" />
              <!--              <van-cell title="配送费" value="¥0.00" />-->
              <van-cell title="订单总额" :value="`¥${totalPrice}`" class="total-cell" />
            </van-cell-group>
          </div>
        </div>

        <!-- 底部提交按钮 -->
        <div class="popup-footer">
          <van-button
            type="primary"
            block
            round
            size="large"
            :loading="submitting.value"
            @click="submitOrder"
          >
            提交订单 ¥{{ totalPrice }}
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useCartStore, type CartItem } from '@/stores/cart'
import { addOrders } from '@/api/ordersController'
import { usePreventRepeatedClick } from '@/composables/useThrottle'

const router = useRouter()
const cartStore = useCartStore()

// 购物车状态（使用store）
const cartItems = computed(() => cartStore.cartItems)

// 订单表单
const orderForm = ref({
  customerName: '',
  customerPhone: '',
  deliveryAddress: '',
  remark: '',
})

// 结算弹窗状态
const showCheckout = ref(false)
// 注意：submitting状态将从usePreventRepeatedClick hook获取

// 全选状态
const selectAll = computed({
  get: () => cartItems.value.length > 0 && cartItems.value.every((item) => item.selected),
  set: (value: boolean) => {
    cartStore.toggleSelectAll(value)
    cartStore.saveToLocalStorage()
  },
})

// 已选商品
const selectedItems = computed(() => {
  return cartItems.value.filter((item) => item.selected)
})

// 总价格
const totalPrice = computed(() => {
  return cartStore.selectedTotalPrice
})

// 获取菜品图片
const getDishImage = (dishId?: number) => {
  return `https://via.placeholder.com/150?text=菜品${dishId}`
}

// 初始化购物车数据（从store获取）
const initCartData = () => {
  cartStore.loadFromLocalStorage()
}

// 更新商品数量
const updateQuantity = (item: CartItem) => {
  if (item.quantity < 1) {
    item.quantity = 1
  }
  cartStore.updateQuantity(item.id!, item.quantity)
  cartStore.saveToLocalStorage()
}

// 更新商品选中状态
const updateItemSelection = () => {
  cartStore.saveToLocalStorage()
}

// 删除商品
const removeItem = async (item: CartItem) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除"${item.name}"吗？`,
    })

    cartStore.removeFromCart(item.id!)
    cartStore.saveToLocalStorage()
    showToast('商品已删除')
  } catch {
    // 用户取消删除
  }
}

// 返回首页
const goToHome = () => {
  router.push('/')
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 进入结算
const proceedToCheckout = () => {
  if (selectedItems.value.length === 0) {
    showToast('请选择要结算的商品')
    return
  }
  showCheckout.value = true
}

// 提交订单的原始函数
const submitOrderOriginal = async () => {
  try {
    // 构建订单数据
    const orderData: API.OrdersAddRequest = {
      price: parseFloat(totalPrice.value),
      ordersDetailsAddRequestList: selectedItems.value.map((item) => ({
        dishesId: item.id!,
        price: item.price,
        number: item.quantity,
      })),
    }

    // 调用下单API
    const response = await addOrders(orderData)

    if (response.data.code === 0) {
      // 从购物车中移除已下单的商品
      cartStore.clearSelectedItems()
      cartStore.saveToLocalStorage()

      showToast('订单提交成功！')
      showCheckout.value = false

      // 如果购物车为空，返回首页
      if (cartStore.cartItems.length === 0) {
        setTimeout(() => {
          router.push('/')
        }, 1500)
      }
    } else {
      showToast(response.data.message || '订单提交失败，请重试')
    }
  } catch (error) {
    console.error('提交订单失败:', error)
    showToast('订单提交失败，请重试')
  }
}

// 使用防重复点击包装提交订单函数
const [submitOrder, submitting] = usePreventRepeatedClick(submitOrderOriginal, 1500)

// 页面初始化
onMounted(() => {
  initCartData()
})
</script>

<style scoped lang="scss">
.cart-page {
  min-height: 100vh;
  background-color: var(--bg-color);
  display: flex;
  flex-direction: column;
}

.cart-header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
}

.cart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.empty-cart {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px; // 为底部结算栏预留空间
}

.cart-item {
  background: var(--bg-card);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);

  .item-image {
    flex-shrink: 0;
  }

  .item-info {
    flex: 1;
    min-width: 0;

    .item-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-material {
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-price {
      font-size: 16px;
      font-weight: 600;
      color: var(--primary-color);
    }
  }

  .item-controls {
    flex-shrink: 0;
  }
}

.delete-button {
  height: 100%;
  width: 80px;
}

.checkout-bar {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-lg);
  z-index: 999;
}

.checkout-left {
  display: flex;
  align-items: center;
  gap: 12px;

  .selected-count {
    font-size: 14px;
    color: #6b7280;
  }
}

.checkout-right {
  display: flex;
  align-items: center;
  gap: 16px;

  .total-price {
    text-align: right;

    .total-label {
      font-size: 14px;
      color: #6b7280;
    }

    .total-amount {
      font-size: 18px;
      font-weight: 700;
      color: #ef4444;
      margin-left: 4px;
    }
  }

  .checkout-btn {
    min-width: 120px;
    height: 40px;
  }
}

// 结算弹窗样式
.checkout-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
}

.popup-header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.selected-items {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 12px;
  }
}

.checkout-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }

  .checkout-item-info {
    flex: 1;
    min-width: 0;

    .checkout-item-name {
      font-size: 14px;
      font-weight: 500;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .checkout-item-price {
      font-size: 12px;
      color: #6b7280;
    }
  }

  .checkout-item-total {
    font-size: 14px;
    font-weight: 600;
    color: #ef4444;
  }
}

.delivery-info,
.order-summary {
  background: white;
  border-radius: 12px;
  margin-bottom: 16px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    padding: 16px 16px 0;
  }
}

:deep(.van-cell-group) {
  border-radius: 0 0 12px 12px;
}

:deep(.total-cell) {
  .van-cell__title {
    font-weight: 600;
    color: #1f2937;
  }

  .van-cell__value {
    font-size: 18px;
    font-weight: 700;
    color: #ef4444;
  }
}

.popup-footer {
  background: var(--bg-card);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

// 响应式设计
@media (max-width: 480px) {
  .cart-item {
    padding: 12px;
    gap: 8px;

    .item-info {
      .item-name {
        font-size: 14px;
      }

      .item-price {
        font-size: 14px;
      }
    }
  }

  .checkout-bar {
    padding: 12px;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;

    .checkout-left,
    .checkout-right {
      justify-content: space-between;
    }

    .checkout-btn {
      width: 100%;
    }
  }
}

// 大屏幕适配
@media (min-width: 769px) {
  .checkout-bar {
    bottom: 60px; // 桌面端tabbar高度
  }
}
</style>
