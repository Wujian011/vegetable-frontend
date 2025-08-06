<template>
  <div class="family-relation">
    <!-- 家庭关系展示 -->
    <div v-if="hasPartner" class="relation-display">
      <div class="relation-card">
        <!-- 饲养员 -->
        <div class="user-info feeder">
          <div class="user-avatar">
            <van-image
              :src="feederAvatar"
              width="60"
              height="60"
              round
              fit="cover"
              :alt="feederName"
            />
          </div>
          <div class="user-details">
            <div class="user-name">{{ feederName }}</div>
            <div class="user-role">{{ COUPLE_ROLE_TEXT.feeder }}</div>
          </div>
        </div>

        <!-- 中间连接线和等级 -->
        <div class="relation-center">
          <div class="level-info">
            <van-icon name="like" color="#ff6b8a" size="20" />
            <span class="level-text">LV {{ currentLevel }}</span>
          </div>
          <div class="connect-line"></div>
        </div>

        <!-- 吃货 -->
        <div class="user-info foodie">
          <div class="user-avatar">
            <van-image
              :src="foodieAvatar"
              width="60"
              height="60"
              round
              fit="cover"
              :alt="foodieName"
            />
          </div>
          <div class="user-details">
            <div class="user-name">{{ foodieName }}</div>
            <div class="user-role">{{ COUPLE_ROLE_TEXT.foodie }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 单人状态：显示当前用户 + 邀请按钮 -->
    <div v-else class="single-display">
      <div class="relation-card">
        <!-- 当前用户 -->
        <div class="user-info current">
          <div class="user-avatar">
            <van-image
              :src="currentUser.userAvatar || '/default-avatar.png'"
              width="60"
              height="60"
              round
              fit="cover"
              :alt="currentUser.userName"
            />
          </div>
          <div class="user-details">
            <div class="user-name">{{ currentUser.userName || '未设置' }}</div>
            <div class="user-role" v-if="myRole">{{ COUPLE_ROLE_TEXT[myRole] }}</div>
            <div class="user-role" v-else-if="!hasPartner">点击右侧设置角色</div>
          </div>
        </div>

        <!-- 中间连接线 -->
        <div class="relation-center">
          <div class="connect-line-single"></div>
        </div>

        <!-- 邀请位置 -->
        <div class="user-info invite" @click="showRoleSelection">
          <div class="invite-avatar">
            <van-icon name="add" size="32" color="#ff6b8a" />
          </div>
          <div class="user-details">
            <div class="invite-text">邀请加入</div>
            <div class="invite-desc">点击选择角色</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 绑定关系弹窗 -->
    <van-popup v-model:show="showBindDialog" position="bottom" round>
      <div class="bind-dialog">
        <div class="dialog-header">
          <h3>选择你的角色</h3>
          <p>选择角色后将生成分享链接邀请其他人加入</p>
        </div>

        <div class="role-options">
          <div
            v-for="option in COUPLE_ROLE_OPTIONS"
            :key="option.value"
            class="role-option"
            :class="{ active: selectedRole === option.value }"
            @click="selectedRole = option.value"
          >
            <div class="role-icon">{{ option.icon }}</div>
            <div class="role-text">{{ option.text }}</div>
          </div>
        </div>

        <div class="dialog-actions">
          <van-button
            block
            type="primary"
            round
            :loading="bindingLoading.value"
            @click="handleBind"
            :disabled="!selectedRole"
          >
            确认并生成邀请链接
          </van-button>
          <van-button block plain round @click="showBindDialog = false" style="margin-top: 12px">
            取消
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { joinFamily } from '@/api/userController'
import { useLoginUserStore } from '@/stores/loginUser'
import {
  COUPLE_ROLE,
  COUPLE_ROLE_TEXT,
  COUPLE_ROLE_OPTIONS,
  type CoupleRole,
} from '@/constants/userRole'
import { usePreventRepeatedClick } from '@/composables/useThrottle'

const router = useRouter()
const loginUserStore = useLoginUserStore()

// 当前用户信息
const currentUser = computed(() => loginUserStore.loginUser)

// 绑定对话框
const showBindDialog = ref(false)
const selectedRole = ref<CoupleRole | ''>('')

// 是否已绑定家庭关系
const hasPartner = computed(() => !!currentUser.value.partnerUser)

// 我的角色
const myRole = computed(() => currentUser.value.coupleRole as CoupleRole | null)

// 伴侣信息
const partnerUser = computed(() => currentUser.value.partnerUser)

// 根据角色计算用户信息
const feederUser = computed(() => {
  if (currentUser.value.coupleRole === COUPLE_ROLE.FEEDER) {
    return currentUser.value
  } else if (partnerUser.value?.coupleRole === COUPLE_ROLE.FEEDER) {
    return partnerUser.value
  }
  return null
})

const foodieUser = computed(() => {
  if (currentUser.value.coupleRole === COUPLE_ROLE.FOODIE) {
    return currentUser.value
  } else if (partnerUser.value?.coupleRole === COUPLE_ROLE.FOODIE) {
    return partnerUser.value
  }
  return null
})

const feederName = computed(() => feederUser.value?.userName || '未设置')
const foodieName = computed(() => foodieUser.value?.userName || '未设置')

const feederAvatar = computed(() => feederUser.value?.userAvatar || '/default-avatar.png')
const foodieAvatar = computed(() => foodieUser.value?.userAvatar || '/default-avatar.png')

// 根据绑定时间计算等级
const currentLevel = computed(() => {
  if (!currentUser.value.partnerBindTime) return 1
  // 根据绑定时间计算等级
  const bindTime = new Date(currentUser.value.partnerBindTime)
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - bindTime.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, Math.floor(daysDiff / 30) + 1) // 每30天升1级
})

// 刷新用户信息（在设置角色后重新获取最新数据）
const refreshUserInfo = async () => {
  try {
    await loginUserStore.fetchLoginUser()
  } catch (error) {
    console.error('刷新用户信息失败:', error)
  }
}

// 显示角色选择
const showRoleSelection = () => {
  showBindDialog.value = true
}

// 选择角色并生成分享链接
const bindRelationOriginal = async () => {
  if (!selectedRole.value) {
    showToast('请选择角色')
    return
  }

  try {
    const response = await joinFamily({
      coupleRole: selectedRole.value,
    })

    if (response.data.code === 0) {
      // 生成分享链接，包含用户ID和角色信息
      const shareUrl = `${window.location.origin}/join-family/${currentUser.value.id}?role=${selectedRole.value}`

      showBindDialog.value = false
      selectedRole.value = ''

      // 复制到剪贴板
      await copyToClipboard(shareUrl)
      showToast('角色设置成功！分享链接已复制到剪贴板')

      // 刷新用户信息
      await refreshUserInfo()
    } else {
      showToast(response.data.message || '设置失败')
    }
  } catch (error) {
    console.error('设置失败:', error)
    showToast('设置失败，请重试')
  }
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    } else {
      // 兼容旧浏览器
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  } catch (error) {
    console.error('复制失败:', error)
  }
}

// 使用防重复点击包装绑定函数
const [handleBind, bindingLoading] = usePreventRepeatedClick(bindRelationOriginal, 1000)

// 页面初始化
onMounted(() => {
  // 无需额外加载，直接使用 loginUser 中的信息
})
</script>

<style scoped lang="scss">
.family-relation {
  padding: 16px;
  background: linear-gradient(135deg, #ff6b8a 0%, #ff8fab 100%);
  border-radius: 16px;
  margin: 16px;
  box-shadow: 0 4px 20px rgba(255, 107, 138, 0.3);
}

.relation-display {
  .relation-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 20px 16px;
    backdrop-filter: blur(10px);
  }
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;

  .user-avatar {
    margin-bottom: 8px;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border: 2px solid #ff6b8a;
      border-radius: 50%;
      opacity: 0.6;
    }
  }

  .user-details {
    text-align: center;

    .user-name {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .user-role {
      font-size: 12px;
      color: #ff6b8a;
      font-weight: 500;
    }
  }
}

.relation-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 16px;

  .level-info {
    display: flex;
    align-items: center;
    gap: 4px;
    background: linear-gradient(135deg, #ff6b8a, #ff8fab);
    padding: 6px 12px;
    border-radius: 20px;
    margin-bottom: 8px;

    .level-text {
      color: white;
      font-size: 12px;
      font-weight: 600;
    }
  }

  .connect-line {
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, #ff6b8a, #ff8fab);
    border-radius: 1px;
    position: relative;

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 8px;
      height: 8px;
      background: #ff6b8a;
      border-radius: 50%;
      top: -3px;
    }

    &::before {
      left: -4px;
    }

    &::after {
      right: -4px;
    }
  }
}

.single-display {
  .relation-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 20px 16px;
    backdrop-filter: blur(10px);
  }

  .connect-line-single {
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, #ff6b8a, #ddd);
    border-radius: 1px;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      width: 8px;
      height: 8px;
      background: #ff6b8a;
      border-radius: 50%;
      top: -3px;
      left: -4px;
    }

    &::after {
      content: '';
      position: absolute;
      width: 8px;
      height: 8px;
      background: #ddd;
      border-radius: 50%;
      top: -3px;
      right: -4px;
    }
  }

  .invite {
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }

    .invite-avatar {
      width: 60px;
      height: 60px;
      border: 2px dashed #ff6b8a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      background: rgba(255, 107, 138, 0.1);
    }

    .invite-text {
      font-size: 16px;
      font-weight: 600;
      color: #ff6b8a;
      margin-bottom: 4px;
    }

    .invite-desc {
      font-size: 12px;
      color: #999;
    }
  }
}

.bind-dialog {
  padding: 24px;

  .dialog-header {
    text-align: center;
    margin-bottom: 24px;

    h3 {
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    p {
      font-size: 14px;
      color: #666;
    }
  }
}

.role-options {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;

  .role-option {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 16px;
    border: 2px solid #e5e5e5;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
      border-color: #ff6b8a;
      background: rgba(255, 107, 138, 0.1);
    }

    .role-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }

    .role-text {
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }
  }
}

.dialog-actions {
  .van-button {
    height: 48px;
    font-size: 16px;
    font-weight: 500;
  }
}

// 响应式设计
@media (max-width: 480px) {
  .family-relation {
    margin: 12px;
    padding: 12px;
  }

  .relation-card {
    padding: 16px 12px !important;
  }

  .user-info {
    .user-details .user-name {
      font-size: 14px;
    }
  }

  .relation-center {
    margin: 0 8px;

    .connect-line {
      width: 40px;
    }
  }
}
</style>
