<template>
  <div class="join-by-link-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar title="加入家庭" left-arrow @click-left="onClickLeft" class="nav-bar" />

    <!-- Loading状态 -->
    <div v-if="loading" class="loading-container">
      <van-loading size="24px" vertical>加载中...</van-loading>
    </div>

    <!-- 邀请信息 -->
    <div v-else-if="inviterInfo" class="page-content">
      <!-- 邀请者信息展示 -->
      <div class="inviter-section">
        <div class="inviter-card">
          <div class="inviter-avatar">
            <van-image
              :src="inviterInfo.userAvatar || '/default-avatar.png'"
              width="80"
              height="80"
              round
              fit="cover"
            />
          </div>
          <div class="inviter-details">
            <h2 class="inviter-name">{{ inviterInfo.userName }}</h2>
            <p class="inviter-role">{{ getInviterRoleText() }}</p>
            <p class="invitation-text">邀请你加入家庭关系</p>
          </div>
        </div>
      </div>

      <!-- 用户状态处理 -->
      <div class="user-status-section">
        <!-- 未登录状态 -->
        <div v-if="!isLoggedIn" class="login-prompt">
          <div class="prompt-card">
            <van-icon name="info-o" size="48" color="#ff6b8a" />
            <h3>请先登录</h3>
            <p>登录后即可加入 {{ inviterInfo.userName }} 的家庭</p>
            <div class="login-actions">
              <van-button type="primary" block round @click="goToLogin"> 立即登录 </van-button>
              <van-button plain block round @click="goToRegister" style="margin-top: 12px">
                还没账号？去注册
              </van-button>
            </div>
          </div>
        </div>

        <!-- 已登录状态 -->
        <div v-else class="join-prompt">
          <div class="prompt-card">
            <div class="current-user-info">
              <van-image
                :src="currentUser.userAvatar || '/default-avatar.png'"
                width="60"
                height="60"
                round
                fit="cover"
              />
              <div class="user-info">
                <div class="user-name">{{ currentUser.userName }}</div>
                <div class="user-account">@{{ currentUser.userAccount }}</div>
              </div>
            </div>

            <div class="join-description">
              <p>
                你将以 <strong>{{ getMyRoleText() }}</strong> 的身份加入家庭
              </p>
              <p class="role-complement">与 {{ inviterInfo.userName }} 的角色形成完美搭配</p>
            </div>

            <div class="join-actions">
              <van-button
                type="primary"
                block
                round
                size="large"
                :loading="joinLoading.value"
                @click="handleJoinFamily"
              >
                确认加入家庭
              </van-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <van-empty description="邀请链接无效或已过期">
        <van-button type="primary" round @click="goToHome"> 返回首页 </van-button>
      </van-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getUserVoById, joinFamily } from '@/api/userController'
import { useLoginUserStore } from '@/stores/loginUser'
import { COUPLE_ROLE_TEXT } from '@/constants/userRole'
import { usePreventRepeatedClick } from '@/composables/useThrottle'

const router = useRouter()
const route = useRoute()
const loginUserStore = useLoginUserStore()

// 页面状态
const loading = ref(true)
const inviterInfo = ref<API.UserVO | null>(null)

// 用户状态
const currentUser = computed(() => loginUserStore.loginUser)
const isLoggedIn = computed(() => !!currentUser.value.id)

// 邀请者ID
const inviterId = computed(() => route.params.userId as string)

// 获取邀请者角色文本
const getInviterRoleText = () => {
  const role = inviterInfo.value?.coupleRole
  if (role && COUPLE_ROLE_TEXT[role as keyof typeof COUPLE_ROLE_TEXT]) {
    return `${COUPLE_ROLE_TEXT[role as keyof typeof COUPLE_ROLE_TEXT]}，想要与你建立家庭关系`
  }
  return '想要与你建立家庭关系'
}

// 获取我的角色文本
const getMyRoleText = () => {
  // 根据邀请者的角色确定我的角色（互补）
  if (inviterInfo.value?.coupleRole === 'feeder') {
    return COUPLE_ROLE_TEXT.foodie
  } else if (inviterInfo.value?.coupleRole === 'foodie') {
    return COUPLE_ROLE_TEXT.feeder
  }
  return '家庭成员'
}

// 获取对应的角色值
const getMyRole = () => {
  // 角色互补逻辑
  if (inviterInfo.value?.coupleRole === 'feeder') {
    return 'foodie'
  } else if (inviterInfo.value?.coupleRole === 'foodie') {
    return 'feeder'
  }
  return ''
}

// 加载邀请者信息
const loadInviterInfo = async () => {
  if (!inviterId.value) {
    loading.value = false
    return
  }

  try {
    const response = await getUserVoById({ id: Number(inviterId.value) })
    if (response.data.code === 0 && response.data.data) {
      inviterInfo.value = response.data.data
    } else {
      console.error('获取邀请者信息失败:', response.data.message)
    }
  } catch (error) {
    console.error('获取邀请者信息失败:', error)
  } finally {
    loading.value = false
  }
}

// 加入家庭的原始函数
const joinFamilyOriginal = async () => {
  if (!inviterInfo.value?.id) {
    showToast('邀请信息无效')
    return
  }

  const myRole = getMyRole()
  if (!myRole) {
    showToast('无法确定角色信息')
    return
  }

  try {
    const response = await joinFamily({
      userId: inviterInfo.value.id,
      coupleRole: myRole,
    })

    if (response.data.code === 0) {
      showToast('加入家庭成功！')
      // 刷新用户信息以获取最新的家庭关系数据
      await loginUserStore.fetchLoginUser()
      // 跳转到首页
      router.replace('/')
    } else {
      showToast(response.data.message || '加入失败')
    }
  } catch (error) {
    console.error('加入家庭失败:', error)
    showToast('加入失败，请重试')
  }
}

// 使用防重复点击包装加入函数
const [handleJoinFamily, joinLoading] = usePreventRepeatedClick(joinFamilyOriginal, 1500)

// 跳转到登录页
const goToLogin = () => {
  // 保存当前页面路径，登录后返回
  const currentPath = route.fullPath
  router.push(`/user/login?redirect=${encodeURIComponent(currentPath)}`)
}

// 跳转到注册页
const goToRegister = () => {
  // 保存当前页面路径，注册后返回
  const currentPath = route.fullPath
  router.push(`/user/register?redirect=${encodeURIComponent(currentPath)}`)
}

// 返回首页
const goToHome = () => {
  router.replace('/')
}

// 返回上一页
const onClickLeft = () => {
  router.back()
}

// 页面初始化
onMounted(() => {
  loadInviterInfo()
})
</script>

<style scoped lang="scss">
.join-by-link-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b8a 0%, #ff8fab 100%);
  display: flex;
  flex-direction: column;
}

.nav-bar {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);

  :deep(.van-nav-bar__title) {
    color: white;
    font-weight: 600;
  }

  :deep(.van-icon) {
    color: white;
    font-size: 18px;
  }
}

.loading-container,
.error-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.page-content {
  flex: 1;
  padding: 24px 20px;
  overflow-y: auto;
}

.inviter-section {
  margin-bottom: 32px;

  .inviter-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 32px 24px;
    text-align: center;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(255, 107, 138, 0.3);

    .inviter-avatar {
      margin-bottom: 16px;
    }

    .inviter-name {
      font-size: 24px;
      font-weight: 700;
      color: #333;
      margin-bottom: 8px;
    }

    .inviter-role {
      font-size: 14px;
      color: #ff6b8a;
      margin-bottom: 16px;
      font-weight: 500;
    }

    .invitation-text {
      font-size: 16px;
      color: #666;
      line-height: 1.5;
    }
  }
}

.user-status-section {
  .prompt-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    padding: 32px 24px;
    backdrop-filter: blur(10px);
    text-align: center;
  }
}

.login-prompt {
  .prompt-card {
    h3 {
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin: 16px 0 8px;
    }

    p {
      font-size: 14px;
      color: #666;
      margin-bottom: 24px;
      line-height: 1.5;
    }

    .login-actions {
      .van-button {
        height: 48px;
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
}

.join-prompt {
  .current-user-info {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    padding: 16px;
    background: rgba(255, 107, 138, 0.1);
    border-radius: 12px;

    .user-info {
      flex: 1;
      text-align: left;

      .user-name {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }

      .user-account {
        font-size: 14px;
        color: #666;
      }
    }
  }

  .join-description {
    margin-bottom: 24px;

    p {
      font-size: 16px;
      color: #666;
      line-height: 1.5;
      margin-bottom: 8px;

      strong {
        color: #ff6b8a;
        font-weight: 600;
      }

      &.role-complement {
        font-size: 14px;
        color: #999;
        margin-bottom: 0;
      }
    }
  }

  .join-actions {
    .van-button {
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      background: linear-gradient(135deg, #ff6b8a, #ff8fab);
      border: none;
      box-shadow: 0 4px 20px rgba(255, 107, 138, 0.4);

      &:active {
        transform: scale(0.98);
      }
    }
  }
}

// 响应式设计
@media (max-width: 480px) {
  .page-content {
    padding: 20px 16px;
  }

  .inviter-section .inviter-card {
    padding: 24px 16px;

    .inviter-name {
      font-size: 20px;
    }
  }

  .user-status-section .prompt-card {
    padding: 24px 16px;
  }

  .join-prompt .current-user-info {
    gap: 12px;
    padding: 12px;

    .user-info .user-name {
      font-size: 16px;
    }
  }
}
</style>
