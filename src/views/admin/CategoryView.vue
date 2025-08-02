<template>
  <div class="category-view">
    <!-- 顶部导航栏 -->
    <van-nav-bar title="分类管理" left-arrow @click-left="onClickLeft" class="nav-bar" />

    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 分类列表 -->
      <div class="category-list">
        <div v-for="(category, index) in categories" :key="category.id" class="category-item">
          <!-- 分类名称 -->
          <div class="category-name">{{ category.name }}</div>

          <!-- 操作按钮组 -->
          <div class="action-buttons">
            <van-button
              size="mini"
              plain
              type="default"
              @click="editCategory(category)"
              class="action-btn"
            >
              编辑
            </van-button>

            <van-button
              size="mini"
              plain
              type="default"
              @click="moveUp(index)"
              :disabled="index === 0"
              class="action-btn"
            >
              上移
            </van-button>

            <van-button
              size="mini"
              plain
              type="primary"
              @click="moveDown(index)"
              :disabled="index === categories.length - 1"
              class="action-btn move-down"
            >
              下移
            </van-button>

            <van-button
              size="mini"
              plain
              type="danger"
              @click="deleteCategory(category)"
              class="action-btn delete-btn"
            >
              删除
            </van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部新增按钮 -->
    <div class="bottom-actions">
      <van-button type="primary" round block icon="plus" @click="addNewCategory" class="add-button">
        新增
      </van-button>
    </div>

    <!-- 新增/编辑分类弹窗 -->
    <van-dialog
      v-model:show="showFormDialog"
      :title="formData.id ? '编辑分类' : '新增分类'"
      show-cancel-button
      confirm-button-text="保存"
      cancel-button-text="取消"
      @confirm="handleSubmit"
      @cancel="handleCancel"
      :before-close="handleBeforeClose"
      class="category-dialog"
    >
      <div class="form-wrapper">
        <van-form @submit="handleSubmit" ref="formRef">
          <van-cell-group inset>
            <van-field
              v-model="formData.name"
              name="name"
              label="分类名称"
              placeholder="请输入分类名称"
              :rules="[{ required: true, message: '请输入分类名称' }]"
              maxlength="20"
              show-word-limit
              clearable
            />
          </van-cell-group>
        </van-form>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import {
  deleteClassification,
  getClassificationItem,
  addClassification,
  updateClassification,
} from '@/api/classificationController'

const router = useRouter()

// 响应式数据
const categories = ref<API.ClassificationVO[]>([])

// 表单相关状态
const showFormDialog = ref(false)
const formRef = ref()
const formData = ref<{
  id?: number
  name: string
}>({
  name: '',
})

// 返回按钮
const onClickLeft = () => {
  router.go(-1)
}

// 删除未使用的菜单和返回按钮功能

// 获取分类列表
const loadCategories = async () => {
  try {
    const response = await getClassificationItem()

    if (response.data.code === 0 && response.data.data) {
      categories.value = response.data.data
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    showToast('获取分类列表失败')
  }
}

// 编辑分类
const editCategory = (category: API.ClassificationVO) => {
  formData.value = {
    id: category.id,
    name: category.name || '',
    code: category.code || '',
  }
  showFormDialog.value = true
}

// 上移分类
const moveUp = async (index: number) => {
  if (index === 0) return

  // 这里应该调用后端API来调整分类顺序
  // 暂时做前端模拟
  const temp = categories.value[index]
  categories.value[index] = categories.value[index - 1]
  categories.value[index - 1] = temp

  showToast('已上移')
}

// 下移分类
const moveDown = async (index: number) => {
  if (index === categories.value.length - 1) return

  // 这里应该调用后端API来调整分类顺序
  // 暂时做前端模拟
  const temp = categories.value[index]
  categories.value[index] = categories.value[index + 1]
  categories.value[index + 1] = temp

  showToast('已下移')
}

// 删除分类
const deleteCategory = async (category: API.ClassificationVO) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除分类"${category.name}"吗？`,
    })

    if (category.id) {
      await deleteClassification({ id: category.id })
      showToast('删除成功')
      loadCategories()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除分类失败:', error)
      showToast('删除失败')
    }
  }
}

// 删除未使用的子分类功能

// 新增分类
const addNewCategory = () => {
  formData.value = {
    name: '',
    code: '',
  }
  showFormDialog.value = true
}

// 表单提交处理
const handleSubmit = async () => {
  try {
    // 先进行表单验证
    await formRef.value?.validate()

    if (formData.value.id) {
      // 编辑分类
      const response = await updateClassification({
        id: formData.value.id,
        name: formData.value.name,
        code: formData.value.code,
      })

      if (response.data.code === 0) {
        showToast('修改成功')
        showFormDialog.value = false
        loadCategories()
      } else {
        showToast(response.data.message || '修改失败')
      }
    } else {
      // 新增分类
      const response = await addClassification({
        name: formData.value.name,
        code: formData.value.code,
      })

      if (response.data.code === 0) {
        showToast('新增成功')
        showFormDialog.value = false
        loadCategories()
      } else {
        showToast(response.data.message || '新增失败')
      }
    }
  } catch (error) {
    console.error('提交失败:', error)
    showToast('操作失败')
  }
}

// 取消按钮处理
const handleCancel = () => {
  showFormDialog.value = false
}

// 弹窗关闭前处理
const handleBeforeClose = (action: string) => {
  if (action === 'confirm') {
    return false // 阻止默认关闭，由handleSubmit处理
  }
  return true // 允许取消关闭
}

// 删除未使用的表单提交和菜单选择功能

// 页面初始化
onMounted(() => {
  loadCategories()
})
</script>

<style scoped lang="scss">
.category-view {
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

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  padding: 24px 0 16px;
  margin-bottom: 8px;
}

.category-list {
  // 只为底部按钮留空间
  margin: 16px 16px 80px;
}

.category-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.category-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  margin-bottom: 16px;
  padding: 8px 0;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.action-btn {
  flex: 1;
  min-width: 60px;
  height: 32px;
  font-size: 13px;
  border-radius: 6px;

  &:deep(.van-button__text) {
    font-weight: 500;
  }
}

.move-down {
  :deep(.van-button--plain.van-button--primary) {
    color: #3b82f6;
    border-color: #3b82f6;

    &:active {
      background-color: #3b82f6;
      color: white;
    }
  }
}

.delete-btn {
  :deep(.van-button--plain.van-button--danger) {
    color: #ef4444;
    border-color: #ef4444;

    &:active {
      background-color: #ef4444;
      color: white;
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0; /* 管理页面无tabBar，直接贴底 */
  left: 0;
  right: 0;
  padding: 16px;
  background: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  border-top: 1px solid #e5e7eb;
  z-index: 1001;
}

.add-button {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);

  :deep(.van-icon) {
    margin-right: 8px;
  }

  &:active {
    transform: scale(0.98);
  }
}

// 弹窗样式
.category-dialog {
  :deep(.van-dialog__content) {
    padding: 0;
  }
}

.form-wrapper {
  padding: 20px 0;
}

.form-content {
  flex: 1;
  padding: 20px;
}

.form-actions {
  margin-top: 24px;

  .van-button {
    height: 48px;
    font-size: 16px;
    font-weight: 600;
  }
}

// 响应式设计 - 管理页面统一样式

@media (max-width: 480px) {
  .action-buttons {
    gap: 6px;
  }

  .action-btn {
    min-width: 50px;
    font-size: 12px;
  }

  .category-name {
    font-size: 16px;
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
</style>
