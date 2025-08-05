<template>
  <div class="dish-manage-view">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      :title="isEdit ? '编辑菜品' : '新增菜品'"
      left-arrow
      @click-left="onClickLeft"
      class="nav-bar"
    />

    <!-- 页面内容 -->
    <div class="page-content">
      <van-form @submit="handleSubmit" ref="formRef">
        <van-cell-group inset>
          <!-- 菜品名称 -->
          <van-field
            v-model="formData.name"
            name="name"
            label="菜品名称"
            placeholder="请输入菜品名称"
            :rules="[{ required: true, message: '请输入菜品名称' }]"
            maxlength="50"
            show-word-limit
            clearable
          />

          <!-- 菜品价格 -->
          <van-field
            v-model="formData.price"
            name="price"
            label="菜品价格"
            placeholder="请输入菜品价格"
            type="number"
            :rules="[
              { required: true, message: '请输入菜品价格' },
              { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: '请输入正确的价格格式' },
            ]"
            clearable
          >
            <template #left-icon>
              <span style="margin-right: 4px">¥</span>
            </template>
          </van-field>

          <!-- 菜品分类 -->
          <van-field
            v-model="categoryName"
            name="category"
            label="菜品分类"
            placeholder="请选择菜品分类"
            readonly
            is-link
            @click="showCategoryPicker = true"
            :rules="[{ required: true, message: '请选择菜品分类' }]"
          />

          <!-- 菜品原料 -->
          <van-field
            v-model="formData.material"
            name="material"
            label="菜品原料"
            placeholder="请输入菜品原料"
            :rules="[{ required: true, message: '请输入菜品原料' }]"
            type="textarea"
            rows="4"
            maxlength="200"
            show-word-limit
            clearable
          />

          <!-- 菜品图片 -->
          <van-field name="image" label="菜品图片">
            <template #input>
              <div class="image-upload">
                <van-uploader
                  v-model="imageList"
                  :max-count="1"
                  :preview-size="80"
                  :after-read="handleImageUpload"
                  accept="image/*"
                  :max-size="5 * 1024 * 1024"
                  preview-cover
                  @delete="onImageDelete"
                  :loading="uploadingImage"
                >
                  <template #default>
                    <div class="upload-placeholder">
                      <van-loading v-if="uploadingImage" size="20" />
                      <van-icon v-else name="plus" size="20" />
                      <span>{{ uploadingImage ? '上传中...' : '上传图片' }}</span>
                    </div>
                  </template>
                </van-uploader>
                <div class="upload-tip">支持 jpg、png、gif 格式，最大 5MB</div>
              </div>
            </template>
          </van-field>
        </van-cell-group>
      </van-form>
    </div>

    <!-- 底部操作按钮 -->
    <div class="bottom-actions">
      <van-button type="default" size="large" @click="onClickLeft" class="cancel-btn">
        取消
      </van-button>
      <van-button
        type="primary"
        size="large"
        @click="handleSubmit"
        :loading="submitLoadingFromHook.value"
        class="submit-btn"
      >
        {{ isEdit ? '保存修改' : '立即添加' }}
      </van-button>
    </div>

    <!-- 分类选择弹窗 -->
    <van-popup v-model:show="showCategoryPicker" position="bottom" round>
      <van-picker
        :columns="categoryColumns"
        @confirm="onCategoryConfirm"
        @cancel="showCategoryPicker = false"
        title="选择分类"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { addDishes, updateDishes, getDishesVoById } from '@/api/dishesController'
import { getClassificationItem } from '@/api/classificationController'
import { upload } from '@/api/fileController'
import { usePreventRepeatedClick } from '@/composables/useThrottle'

const router = useRouter()
const route = useRoute()

// 判断是编辑还是新增模式
const isEdit = computed(() => !!route.query.id)
const dishId = computed(() => route.query.id as string)

// 表单数据
const formRef = ref()
// 注意：submitLoading将从usePreventRepeatedClick hook获取
const formData = ref<{
  id?: number
  name: string
  price: number | string
  material: string
  classificationId?: number
  dishesImage?: string
}>({
  name: '',
  price: '',
  material: '',
  dishesImage: '',
})

// 分类相关
const categories = ref<API.ClassificationVO[]>([])
const categoryName = ref('')
const showCategoryPicker = ref(false)
const categoryColumns = computed(() => {
  return categories.value.map((category) => ({
    text: category.name,
    value: category.id,
  }))
})

// 图片上传
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const imageList = ref<any[]>([])
const uploadingImage = ref(false)

// 返回上一页
const onClickLeft = async () => {
  // 如果表单有修改，提示用户
  if (hasFormChanged()) {
    try {
      await showConfirmDialog({
        title: '确认离开',
        message: '当前有未保存的修改，确定要离开吗？',
      })
    } catch {
      return // 用户取消
    }
  }
  router.go(-1)
}

// 检查表单是否有修改
const hasFormChanged = () => {
  if (isEdit.value) {
    // 编辑模式下检查是否有修改
    return (
      formData.value.name !== '' || formData.value.price !== '' || formData.value.material !== ''
    )
  } else {
    // 新增模式下检查是否有输入
    return (
      formData.value.name !== '' || formData.value.price !== '' || formData.value.material !== ''
    )
  }
}

// 分类选择确认
const onCategoryConfirm = ({
  selectedValues,
  selectedOptions,
}: {
  selectedValues: number[]
  selectedOptions: { text: string; value: number }[]
}) => {
  formData.value.classificationId = selectedValues[0]
  categoryName.value = selectedOptions[0].text
  showCategoryPicker.value = false
}

// 图片上传处理
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleImageUpload = async (items: any) => {
  uploadingImage.value = true

  try {
    // 获取文件对象
    const fileItem = Array.isArray(items) ? items[0] : items
    const file = fileItem?.file

    if (!file) {
      showToast('请选择文件')
      return
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      showToast('请选择jpg、png或gif格式的图片')
      // 移除不符合要求的文件
      imageList.value = []
      return
    }

    // 验证文件大小（限制5MB）
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      showToast('图片大小不能超过5MB')
      // 移除不符合要求的文件
      imageList.value = []
      return
    }

    // 上传文件
    const response = await upload({}, file)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((response as any).data?.code === 0 && (response as any).data?.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formData.value.dishesImage = (response as any).data.data
      showToast('图片上传成功')

      // 更新图片列表显示
      fileItem.url = formData.value.dishesImage
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      showToast((response as any).data?.message || '图片上传失败')
      // 移除上传失败的文件
      imageList.value = []
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    showToast('图片上传失败，请重试')
    // 移除上传失败的文件
    imageList.value = []
  } finally {
    uploadingImage.value = false
  }
}

// 图片删除
const onImageDelete = (file: unknown, detail: { index: number }) => {
  console.log('删除图片:', file, detail)
  formData.value.dishesImage = ''
}

// 表单提交的原始函数
const handleSubmitOriginal = async () => {
  try {
    // 表单验证
    await formRef.value?.validate()

    // 验证分类是否已选择
    if (!formData.value.classificationId) {
      showToast('请选择菜品分类')
      return
    }

    const submitData = {
      name: formData.value.name,
      price: Number(formData.value.price),
      material: formData.value.material,
      classificationId: formData.value.classificationId,
      dishesImage: formData.value.dishesImage,
    }

    if (isEdit.value && formData.value.id) {
      // 编辑菜品
      const response = await updateDishes({
        id: formData.value.id,
        ...submitData,
      })

      if (response.data.code === 0) {
        showToast('修改成功')
        router.go(-1)
      } else {
        showToast(response.data.message || '修改失败')
      }
    } else {
      // 新增菜品
      const response = await addDishes(submitData)

      if (response.data.code === 0) {
        showToast('添加成功')
        router.go(-1)
      } else {
        showToast(response.data.message || '添加失败')
      }
    }
  } catch (error) {
    console.error('提交失败:', error)
    showToast('操作失败')
  }
}

// 使用防重复点击包装表单提交
const [handleSubmit, submitLoadingFromHook] = usePreventRepeatedClick(handleSubmitOriginal, 1000)

// 加载分类列表
const loadCategories = async () => {
  try {
    const response = await getClassificationItem()
    if (response.data.code === 0 && response.data.data) {
      categories.value = response.data.data
    }
  } catch (error) {
    console.error('获取分类失败:', error)
    showToast('获取分类失败')
  }
}

// 加载菜品数据（编辑模式）
const loadDishData = async () => {
  if (!isEdit.value || !dishId.value) return

  try {
    const response = await getDishesVoById({ id: Number(dishId.value) })
    if (response.data.code === 0 && response.data.data) {
      const dish = response.data.data
      formData.value = {
        id: dish.id,
        name: dish.name || '',
        price: dish.price || '',
        material: dish.material || '',
        classificationId: dish.userId, // 根据 DishesVO 类型定义使用 userId 字段
        dishesImage: dish.dishesImage || '',
      }

      // 如果有图片，设置图片列表
      if (dish.dishesImage) {
        imageList.value = [
          {
            url: dish.dishesImage,
            isImage: true,
          },
        ]
      }

      // 设置分类名称
      const category = categories.value.find((c) => c.id === dish.userId)
      if (category) {
        categoryName.value = category.name || ''
      }
    }
  } catch (error) {
    console.error('获取菜品数据失败:', error)
    showToast('获取菜品数据失败')
    router.go(-1)
  }
}

// 页面初始化
onMounted(async () => {
  await loadCategories()
  if (isEdit.value) {
    await loadDishData()
  }
})
</script>

<style scoped lang="scss">
.dish-manage-view {
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
  padding: 16px;
  padding-bottom: 100px; // 为底部按钮留空间
}

.image-upload {
  .upload-placeholder {
    width: 80px;
    height: 80px;
    background: #f7f8fa;
    border: 1px dashed #dcdee0;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #969799;
    font-size: 12px;
    transition: all 0.2s;

    &:hover {
      border-color: #07c160;
      color: #07c160;
    }

    .van-icon,
    .van-loading {
      margin-bottom: 4px;
    }
  }

  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #969799;
    text-align: center;
  }

  :deep(.van-uploader__preview) {
    position: relative;

    .van-uploader__preview-image {
      border-radius: 4px;
    }
  }

  :deep(.van-uploader__preview-delete) {
    background: rgba(0, 0, 0, 0.7);

    .van-icon {
      color: white;
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  z-index: 1001;

  .cancel-btn,
  .submit-btn {
    flex: 1;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 24px;
  }

  .submit-btn {
    background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);

    &:active {
      transform: scale(0.98);
    }
  }

  .cancel-btn {
    background: #f3f4f6;
    color: #6b7280;
    border: 1px solid #d1d5db;

    &:active {
      background: #e5e7eb;
    }
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
    padding-bottom: 100px;
  }

  .bottom-actions {
    padding: 12px;
    gap: 8px;

    .cancel-btn,
    .submit-btn {
      height: 44px;
      font-size: 15px;
    }
  }
}
</style>
