<template>
  <div class="profile-page">
    <!-- 顶部导航栏 -->
    <div class="profile-header">
      <van-nav-bar title="个人中心" />
    </div>

    <!-- 用户信息卡片 -->
    <div class="user-info-section">
      <div class="user-card">
        <!-- 用户头像和基本信息 -->
        <div class="user-main-info">
          <div class="user-avatar">
            <van-image
              :src="getUserAvatar(userInfo.userAvatar)"
              fit="cover"
              round
              width="80"
              height="80"
            />
          </div>
          <div class="user-details">
            <div class="user-name">{{ userInfo.userName || '未设置昵称' }}</div>
            <div class="user-id">UID: {{ userInfo.userAccount || 'N/A' }}</div>
            <div class="user-role" v-if="userInfo.userRole">
              <van-tag type="primary" size="mini">
                {{ userInfo.userRole === 'admin' ? '管理员' : '用户' }}
              </van-tag>
            </div>
          </div>
          <div class="edit-action">
            <van-icon name="edit" size="20" color="#666" @click="editUserInfo" />
          </div>
        </div>

        <!-- 用户简介 -->
        <div class="user-profile" v-if="userInfo.userProfile">
          <div class="profile-label">个人简介</div>
          <div class="profile-content">{{ userInfo.userProfile }}</div>
        </div>
      </div>
    </div>

    <!-- 功能菜单列表 -->
    <div class="menu-section">
      <van-cell-group>
        <van-cell title="我的订单" is-link icon="orders-o" @click="goToOrders" />
        <van-cell title="地址管理" is-link icon="location-o" @click="showDevelopingToast" />
        <van-cell title="优惠券" is-link icon="coupon-o" @click="showDevelopingToast" />
        <van-cell title="积分商城" is-link icon="gift-o" @click="showDevelopingToast" />
      </van-cell-group>

      <van-cell-group>
        <van-cell title="意见反馈" is-link icon="comment-o" @click="showDevelopingToast" />
        <van-cell title="帮助中心" is-link icon="question-o" @click="showDevelopingToast" />
        <van-cell title="关于我们" is-link icon="info-o" @click="showDevelopingToast" />
      </van-cell-group>

      <van-cell-group>
        <van-cell title="设置" is-link icon="setting-o" @click="showDevelopingToast" />
        <van-cell title="退出登录" icon="warning-o" @click="handleLogout" class="logout-cell" />
      </van-cell-group>
    </div>

    <!-- 编辑用户信息弹窗 -->
    <van-popup v-model:show="showEditDialog" position="bottom" :style="{ height: '60%' }" round>
      <div class="edit-dialog">
        <div class="dialog-header">
          <van-nav-bar title="编辑个人信息" left-arrow @click-left="showEditDialog = false" />
        </div>

        <div class="dialog-content">
          <van-form @submit="updateUserInfo">
            <van-cell-group>
              <van-field
                v-model="editForm.userName"
                label="昵称"
                placeholder="请输入昵称"
                required
                :rules="[{ required: true, message: '请填写昵称' }]"
              />
              <van-field
                v-model="editForm.userProfile"
                label="个人简介"
                placeholder="请输入个人简介"
                type="textarea"
                autosize
                maxlength="200"
                show-word-limit
              />
              <van-field
                v-model="editForm.userAvatar"
                label="头像链接"
                placeholder="请输入头像图片链接"
              />
            </van-cell-group>

            <div class="form-footer">
              <van-button type="primary" block round native-type="submit" :loading="updating">
                保存修改
              </van-button>
            </div>
          </van-form>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useLoginUserStore } from '@/stores/loginUser'
import { updateUser, userLogout } from '@/api/userController'

const router = useRouter()
const loginUserStore = useLoginUserStore()

// 用户信息
const userInfo = computed(() => loginUserStore.loginUser)

// 编辑弹窗状态
const showEditDialog = ref(false)
const updating = ref(false)

// 编辑表单
const editForm = ref({
  userName: '',
  userProfile: '',
  userAvatar: '',
})

// 获取用户头像
const getUserAvatar = (avatar?: string) => {
  return avatar || 'https://via.placeholder.com/80x80?text=头像'
}

// 编辑用户信息
const editUserInfo = () => {
  // 初始化编辑表单
  editForm.value = {
    userName: userInfo.value.userName || '',
    userProfile: userInfo.value.userProfile || '',
    userAvatar: userInfo.value.userAvatar || '',
  }
  showEditDialog.value = true
}

// 更新用户信息
const updateUserInfo = async () => {
  updating.value = true

  try {
    const updateRequest: API.UserUpdateRequest = {
      id: userInfo.value.id,
      userName: editForm.value.userName,
      userProfile: editForm.value.userProfile,
      userAvatar: editForm.value.userAvatar,
    }

    const response = await updateUser(updateRequest)

    if (response.data.code === 0) {
      // 更新本地用户信息
      loginUserStore.setLoginUser({
        ...userInfo.value,
        userName: editForm.value.userName,
        userProfile: editForm.value.userProfile,
        userAvatar: editForm.value.userAvatar,
      })

      showToast('保存成功')
      showEditDialog.value = false
    } else {
      showToast(response.data.message || '保存失败')
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    showToast('保存失败，请重试')
  } finally {
    updating.value = false
  }
}

// 跳转到订单页面
const goToOrders = () => {
  router.push('/orders')
}

// 显示开发中提示
const showDevelopingToast = () => {
  showToast('功能开发中，敬请期待')
}

// 退出登录
const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: '确认退出',
      message: '确定要退出登录吗？',
    })

    await userLogout()

    // 清空用户信息
    loginUserStore.setLoginUser({
      userName: '未登录',
    })

    showToast('已退出登录')

    // 跳转到登录页面
    setTimeout(() => {
      router.push('/user/login')
    }, 1000)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退出登录失败:', error)
    }
  }
}

// 页面初始化
onMounted(async () => {
  // 如果用户信息不完整，尝试重新获取
  if (!userInfo.value.id) {
    try {
      await loginUserStore.fetchLoginUser()
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
})
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.profile-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

// 用户信息卡片
.user-info-section {
  padding: 16px;
  padding-bottom: 0;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    z-index: 0;
  }
}

.user-main-info {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
  margin-bottom: 16px;
}

.user-avatar {
  flex-shrink: 0;

  :deep(.van-image) {
    border: 3px solid rgba(255, 255, 255, 0.3);
  }
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-id {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 8px;
}

.user-role {
  :deep(.van-tag) {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
}

.edit-action {
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.user-profile {
  position: relative;
  z-index: 1;

  .profile-label {
    font-size: 14px;
    opacity: 0.8;
    margin-bottom: 8px;
  }

  .profile-content {
    font-size: 14px;
    line-height: 1.5;
    opacity: 0.9;
  }
}

// 功能菜单
.menu-section {
  flex: 1;
  padding: 16px;
  padding-bottom: 70px; // 为tabbar预留空间

  :deep(.van-cell-group) {
    margin-bottom: 16px;
    border-radius: 12px;
    overflow: hidden;
  }

  :deep(.van-cell) {
    padding: 16px;
    font-size: 16px;

    .van-cell__title {
      font-weight: 500;
    }

    .van-icon {
      margin-right: 12px;
      color: #666;
    }
  }
}

.logout-cell {
  :deep(.van-cell__title) {
    color: #ee0a24;
  }

  :deep(.van-icon) {
    color: #ee0a24;
  }
}

// 编辑弹窗样式
.edit-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.dialog-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

:deep(.van-cell-group) {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
}

.form-footer {
  padding: 0 16px;
}

// 响应式设计
@media (max-width: 480px) {
  .user-main-info {
    gap: 12px;

    .user-avatar {
      :deep(.van-image) {
        width: 60px;
        height: 60px;
      }
    }
  }

  .user-name {
    font-size: 18px;
  }

  .user-card {
    padding: 20px;
  }

  .menu-section {
    :deep(.van-cell) {
      padding: 14px 16px;
      font-size: 15px;
    }
  }
}

// 大屏幕适配
@media (min-width: 769px) {
  .menu-section {
    padding-bottom: 80px; // 桌面端tabbar高度
  }
}
</style>
