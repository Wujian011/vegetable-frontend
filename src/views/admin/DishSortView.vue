<template>
  <div class="dish-sort-view">
    <!-- 顶部导航栏 -->
    <van-nav-bar title="菜谱排序" left-arrow @click-left="onClickLeft" class="nav-bar">
      <template #right>
        <van-button type="primary" size="small" @click="saveSortOrder" :loading="saveLoading">
          保存
        </van-button>
      </template>
    </van-nav-bar>

    <!-- 提示信息 -->
    <div class="tips-section">
      <van-notice-bar
        left-icon="info-o"
        text="长按拖拽菜品卡片可以调整排序，调整完成后点击右上角保存按钮"
        color="#1989fa"
        background="#ecf9ff"
      />
    </div>

    <!-- 分类筛选 -->
    <div class="filter-section">
      <van-tabs v-model:active="activeCategory" @change="onCategoryChange" sticky>
        <van-tab v-for="category in categories" :key="category.id" :title="category.name" />
      </van-tabs>
    </div>

    <!-- 菜品列表 -->
    <div class="page-content">
      <div class="sort-list">
        <Draggable
          v-model="sortedDishes"
          item-key="id"
          handle=".drag-handle"
          ghost-class="ghost-item"
          chosen-class="chosen-item"
          drag-class="drag-item"
          @start="onDragStart"
          @end="onDragEnd"
        >
          <template #item="{ element, index }">
            <div class="dish-sort-item">
              <!-- 排序序号 -->
              <div class="sort-number">{{ index + 1 }}</div>

              <!-- 菜品信息 -->
              <div class="dish-info">
                <div class="dish-image">
                  <van-image :src="getDishImage(element.id)" fit="cover" loading-icon="photo" />
                </div>
                <div class="dish-details">
                  <div class="dish-name">{{ element.name }}</div>
                  <div class="dish-price">¥{{ element.price }}</div>
                  <div class="dish-material">{{ element.material }}</div>
                </div>
              </div>

              <!-- 拖拽手柄 -->
              <div class="drag-handle">
                <van-icon name="bars" size="20" color="#c8c9cc" />
              </div>
            </div>
          </template>
        </Draggable>

        <!-- 空状态 -->
        <van-empty v-if="sortedDishes.length === 0" description="该分类下暂无菜品" image="search" />
      </div>
    </div>

    <!-- 底部统计信息 -->
    <div class="bottom-stats">
      <div class="stats-info">
        <van-icon name="records" size="16" />
        <span>当前分类共 {{ sortedDishes.length }} 道菜品</span>
      </div>
      <div class="save-status" :class="{ 'has-changes': hasChanges }">
        <van-icon :name="hasChanges ? 'warning-o' : 'success'" size="14" />
        <span>{{ hasChanges ? '有未保存的修改' : '已保存' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import Draggable from 'vuedraggable'
import { listMyFamilyDishesVoByPage } from '@/api/dishesController'
import { getClassificationItem } from '@/api/classificationController'

const router = useRouter()

// 分类相关
const categories = ref<API.ClassificationVO[]>([])
const activeCategory = ref(0)

// 菜品相关
const allDishes = ref<API.DishesVO[]>([])
const sortedDishes = ref<API.DishesVO[]>([])
const originalOrder = ref<number[]>([])

// 状态管理
const saveLoading = ref(false)
const isDragging = ref(false)

// 检查是否有修改
const hasChanges = computed(() => {
  if (sortedDishes.value.length !== originalOrder.value.length) return true

  return sortedDishes.value.some((dish, index) => {
    return dish.id !== originalOrder.value[index]
  })
})

// 获取菜品图片
const getDishImage = (dishId?: number) => {
  return `https://via.placeholder.com/60x60?text=菜品${dishId}`
}

// 返回按钮处理
const onClickLeft = async () => {
  if (hasChanges.value) {
    try {
      await showConfirmDialog({
        title: '确认离开',
        message: '当前有未保存的修改，确定要离开吗？',
      })
    } catch {
      return
    }
  }
  router.go(-1)
}

// 分类切换
const onCategoryChange = (index: number) => {
  activeCategory.value = index
  loadDishesForCategory()
}

// 拖拽开始
const onDragStart = () => {
  isDragging.value = true
}

// 拖拽结束
const onDragEnd = () => {
  isDragging.value = false
  // 这里可以添加拖拽结束后的逻辑
}

// 保存排序
const saveSortOrder = async () => {
  if (!hasChanges.value) {
    showToast('没有需要保存的修改')
    return
  }

  try {
    saveLoading.value = true

    // 这里应该调用后端API保存排序
    // 目前模拟保存成功
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 更新原始顺序
    originalOrder.value = sortedDishes.value.map((dish) => dish.id || 0)

    showToast('排序保存成功')
  } catch (error) {
    console.error('保存排序失败:', error)
    showToast('保存失败')
  } finally {
    saveLoading.value = false
  }
}

// 加载分类列表
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

// 加载菜品列表
const loadAllDishes = async () => {
  try {
    const response = await listMyFamilyDishesVoByPage({
      pageNum: 1,
      pageSize: 1000, // 获取所有家庭菜品
    })

    if (response.data.code === 0 && response.data.data?.records) {
      allDishes.value = response.data.data.records
      loadDishesForCategory()
    }
  } catch (error) {
    console.error('获取菜品失败:', error)
    showToast('获取菜品失败')
  }
}

// 根据分类加载菜品
const loadDishesForCategory = () => {
  if (activeCategory.value === 0) {
    // 全部分类
    sortedDishes.value = [...allDishes.value]
  } else {
    // 具体分类（这里需要根据实际API字段调整）
    const categoryId = categories.value[activeCategory.value]?.id
    sortedDishes.value = allDishes.value.filter((dish) => dish.userId === categoryId)
  }

  // 保存原始顺序
  originalOrder.value = sortedDishes.value.map((dish) => dish.id || 0)
}

// 监听分类变化
watch(activeCategory, () => {
  loadDishesForCategory()
})

// 页面初始化
onMounted(async () => {
  await loadCategories()
  await loadAllDishes()
})
</script>

<style scoped lang="scss">
.dish-sort-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.nav-bar {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);

  :deep(.van-nav-bar__title) {
    color: #1f2937;
    font-weight: 600;
  }

  :deep(.van-icon) {
    color: #6b7280;
    font-size: 18px;
  }
}

.tips-section {
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.filter-section {
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 80px;
}

.sort-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dish-sort-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  cursor: move;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.chosen-item {
    transform: scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    z-index: 1000;
  }

  &.ghost-item {
    opacity: 0.5;
    background: #f3f4f6;
  }

  &.drag-item {
    transform: rotate(5deg);
  }
}

.sort-number {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.dish-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.dish-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;

  .van-image {
    width: 100%;
    height: 100%;
  }
}

.dish-details {
  flex: 1;
  min-width: 0;

  .dish-name {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dish-price {
    font-size: 18px;
    font-weight: 700;
    color: #ef4444;
    margin-bottom: 4px;
  }

  .dish-material {
    font-size: 12px;
    color: #6b7280;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.drag-handle {
  padding: 8px;
  cursor: move;
  user-select: none;

  &:hover {
    background: #f3f4f6;
    border-radius: 6px;
  }
}

.bottom-stats {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1001;
}

.stats-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 14px;
}

.save-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #10b981;

  &.has-changes {
    color: #f59e0b;
  }
}

// 自定义滚动条
.page-content {
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

// 响应式设计
@media (max-width: 480px) {
  .page-content {
    padding: 12px;
    padding-bottom: 80px;
  }

  .dish-sort-item {
    padding: 12px;
    gap: 8px;
  }

  .dish-image {
    width: 50px;
    height: 50px;
  }

  .sort-number {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .dish-details {
    .dish-name {
      font-size: 14px;
    }

    .dish-price {
      font-size: 16px;
    }
  }

  .bottom-stats {
    padding: 12px 16px;
    flex-direction: column;
    gap: 8px;
    align-items: stretch;

    .stats-info,
    .save-status {
      justify-content: center;
    }
  }
}
</style>
