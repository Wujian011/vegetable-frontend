<template>
  <div class="orders-page">
    <!-- 顶部导航栏 -->
    <div class="orders-header">
      <van-nav-bar title="我的订单" />
    </div>

    <!-- 订单列表内容 -->
    <div class="orders-content">
      <!-- 空订单状态 -->
      <div v-if="orders.length === 0 && !loading" class="empty-orders">
        <van-empty description="暂无订单">
          <van-button type="primary" round @click="goToHome">去下单</van-button>
        </van-empty>
      </div>

      <!-- 订单列表 -->
      <van-list
        v-else
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多订单了"
        @load="loadMoreOrders"
      >
        <div class="orders-list">
          <div v-for="order in orders" :key="order.id" class="order-item">
            <van-card>
              <template #title>
                <div class="order-header">
                  <span class="order-number">订单号: {{ order.id }}</span>
                  <span class="order-time">{{ formatTime(order.createTime) }}</span>
                </div>
              </template>

              <template #desc>
                <div class="order-details">
                  <!-- 订单商品列表 -->
                  <div v-if="order.orderDetailsVOList" class="order-items">
                    <div
                      v-for="detail in order.orderDetailsVOList"
                      :key="detail.id"
                      class="order-detail-item"
                    >
                      <div class="item-image">
                        <van-image
                          :src="getDishImage(detail.dishesVO?.id)"
                          fit="cover"
                          width="50"
                          height="50"
                          radius="6"
                        />
                      </div>
                      <div class="item-info">
                        <div class="item-name">{{ detail.dishesVO?.name || '未知商品' }}</div>
                        <div class="item-spec">单价: ¥{{ detail.price }} × {{ detail.number }}</div>
                      </div>
                      <div class="item-total">¥{{ (detail.price * detail.number).toFixed(2) }}</div>
                    </div>
                  </div>
                </div>
              </template>

              <template #price>
                <div class="order-price">
                  <span class="price-label">订单总额:</span>
                  <span class="price-value">¥{{ order.price }}</span>
                </div>
              </template>

              <template #footer>
                <div class="order-actions">
                  <van-button size="small" @click="viewOrderDetail(order)">查看详情</van-button>
                </div>
              </template>
            </van-card>
          </div>
        </div>
      </van-list>
    </div>

    <!-- 订单详情弹窗 -->
    <van-popup v-model:show="showDetail" position="bottom" :style="{ height: '80%' }" round>
      <div class="order-detail-popup" v-if="selectedOrder">
        <div class="popup-header">
          <van-nav-bar title="订单详情" left-arrow @click-left="showDetail = false" />
        </div>

        <div class="popup-content">
          <!-- 订单基本信息 -->
          <div class="order-info-section">
            <van-cell-group>
              <van-cell title="订单号" :value="selectedOrder.id?.toString()" />
              <van-cell title="下单时间" :value="formatTime(selectedOrder.createTime)" />
              <van-cell title="订单状态" value="已完成" />
              <van-cell
                title="订单总额"
                :value="`¥${selectedOrder.price}`"
                class="total-price-cell"
              />
            </van-cell-group>
          </div>

          <!-- 商品详情 -->
          <div class="order-items-section">
            <h3>商品详情</h3>
            <div v-if="selectedOrder.orderDetailsVOList" class="detail-items">
              <div
                v-for="detail in selectedOrder.orderDetailsVOList"
                :key="detail.id"
                class="detail-item"
              >
                <van-image
                  :src="getDishImage(detail.dishesVO?.id)"
                  fit="cover"
                  width="80"
                  height="80"
                  radius="8"
                />
                <div class="detail-item-info">
                  <div class="detail-item-name">{{ detail.dishesVO?.name || '未知商品' }}</div>
                  <div class="detail-item-material">
                    {{ detail.dishesVO?.material || '暂无描述' }}
                  </div>
                  <div class="detail-item-price">
                    <span>单价: ¥{{ detail.price }}</span>
                    <span>数量: {{ detail.number }}</span>
                    <span class="item-subtotal"
                      >小计: ¥{{ (detail.price * detail.number).toFixed(2) }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { listOrdersVoPageByMy } from '@/api/ordersController'

const router = useRouter()

// 订单列表状态
const orders = ref<API.OrdersVO[]>([])
const loading = ref(false)
const finished = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

// 订单详情弹窗状态
const showDetail = ref(false)
const selectedOrder = ref<API.OrdersVO | null>(null)

// 获取菜品图片
const getDishImage = (dishId?: number) => {
  return `https://via.placeholder.com/150?text=菜品${dishId}`
}

// 格式化时间
const formatTime = (timeStr?: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 加载订单列表
const loadOrders = async (reset = false) => {
  if (loading.value) return

  loading.value = true

  try {
    const queryParams: API.OrdersQueryRequest = {
      pageNum: reset ? 1 : currentPage.value,
      pageSize: pageSize.value,
    }

    const response = await listOrdersVoPageByMy(queryParams)

    if (response.data.code === 0 && response.data.data?.records) {
      const newOrders = response.data.data.records

      if (reset || currentPage.value === 1) {
        orders.value = newOrders
      } else {
        orders.value.push(...newOrders)
      }

      // 判断是否还有更多数据
      if (newOrders.length < pageSize.value) {
        finished.value = true
      } else {
        currentPage.value++
      }
    } else {
      showToast(response.data.message || '获取订单列表失败')
      finished.value = true
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    showToast('获取订单列表失败')
    finished.value = true
  } finally {
    loading.value = false
  }
}

// 加载更多订单
const loadMoreOrders = async () => {
  await loadOrders()
}

// 查看订单详情
const viewOrderDetail = (order: API.OrdersVO) => {
  selectedOrder.value = order
  showDetail.value = true
}

// 跳转到首页
const goToHome = () => {
  router.push('/')
}

// 页面初始化
onMounted(async () => {
  await loadOrders(true)
})
</script>

<style scoped lang="scss">
.orders-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.orders-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.orders-content {
  flex: 1;
  padding-bottom: 50px; // 为tabbar预留空间
}

.empty-orders {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 60px 20px;
}

.orders-list {
  padding: 16px;
}

.order-item {
  margin-bottom: 16px;

  :deep(.van-card) {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: box-shadow 0.2s;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .order-number {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
  }

  .order-time {
    font-size: 12px;
    color: #6b7280;
  }
}

.order-details {
  .order-items {
    margin-top: 8px;
  }

  .order-detail-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #f3f4f6;

    &:last-child {
      border-bottom: none;
    }

    .item-image {
      flex-shrink: 0;
    }

    .item-info {
      flex: 1;
      min-width: 0;

      .item-name {
        font-size: 14px;
        font-weight: 500;
        color: #1f2937;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .item-spec {
        font-size: 12px;
        color: #6b7280;
      }
    }

    .item-total {
      font-size: 14px;
      font-weight: 600;
      color: #ef4444;
      flex-shrink: 0;
    }
  }
}

.order-price {
  text-align: right;
  margin-top: 8px;

  .price-label {
    font-size: 14px;
    color: #6b7280;
  }

  .price-value {
    font-size: 18px;
    font-weight: 700;
    color: #ef4444;
    margin-left: 8px;
  }
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

// 订单详情弹窗样式
.order-detail-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.popup-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.order-info-section {
  background: white;
  border-radius: 12px;
  margin-bottom: 16px;
}

:deep(.total-price-cell) {
  .van-cell__title {
    font-weight: 600;
    color: #1f2937;
  }

  .van-cell__value {
    font-size: 16px;
    font-weight: 700;
    color: #ef4444;
  }
}

.order-items-section {
  background: white;
  border-radius: 12px;
  padding: 16px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 16px;
  }
}

.detail-items {
  .detail-item {
    display: flex;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;

    &:last-child {
      border-bottom: none;
    }

    .detail-item-info {
      flex: 1;
      min-width: 0;

      .detail-item-name {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .detail-item-material {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 8px;
        line-height: 1.4;
      }

      .detail-item-price {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 14px;

        span {
          color: #6b7280;
        }

        .item-subtotal {
          color: #ef4444;
          font-weight: 600;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 480px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .order-detail-item {
    gap: 8px;

    .item-info {
      .item-name {
        font-size: 13px;
      }

      .item-spec {
        font-size: 11px;
      }
    }

    .item-total {
      font-size: 12px;
    }
  }

  .detail-item {
    gap: 8px;

    .detail-item-info {
      .detail-item-name {
        font-size: 14px;
      }

      .detail-item-price {
        font-size: 12px;
      }
    }
  }
}

// 大屏幕适配
@media (min-width: 769px) {
  .orders-content {
    padding-bottom: 60px; // 桌面端tabbar高度
  }
}
</style>
