<template>
  <div class="login-container">
    <div class="login-header">
      <h1 class="login-title">欢迎登录</h1>
      <p class="login-subtitle">请输入您的账号信息</p>
    </div>

    <van-form @submit="onSubmit" class="login-form">
      <van-cell-group inset>
        <van-field
          v-model="formData.userAccount"
          name="userAccount"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请输入用户名' }]"
          left-icon="user-o"
          clearable
        />

        <van-field
          v-model="formData.userPassword"
          type="password"
          name="userPassword"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
          left-icon="lock"
          clearable
        />
      </van-cell-group>

      <div class="login-actions">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="loading"
          class="login-button"
        >
          登录
        </van-button>

        <div class="register-link">
          <span class="register-text">还没有账号？</span>
          <van-button type="primary" plain size="small" @click="goToRegister">
            立即注册
          </van-button>
        </div>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import { userLogin } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/loginUser.ts'

const router = useRouter()
const loading = ref(false)

// 表单数据
const formData = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})
const loginUserStore = useLoginUserStore()

// 提交登录
const onSubmit = async (values: API.UserLoginRequest) => {
  loading.value = true

  try {
    // 这里应该调用登录API
    console.log('登录数据:', values)

    const res = await userLogin(values)
    // 登录成功，把登录状态保存到全局状态中
    if (res.data.data && res.data.code === 0) {
      await loginUserStore.fetchLoginUser()
      showSuccessToast('登录成功')

      // 登录成功后跳转到首页
      router.push({
        path: '/',
        replace: true,
      })
    } else {
      showFailToast('登录失败 ' + res.data.message)
    }
  } catch (error) {
    showToast('登录错误，请检查账号密码' + error)
  } finally {
    loading.value = false
  }
}

// 跳转到注册页面
const goToRegister = () => {
  router.push('/user/register')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.login-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 16px;
  opacity: 0.8;
  margin: 0;
}

.login-form {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-actions {
  margin-top: 24px;
}

.login-button {
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
}

.register-link {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.register-text {
  color: #666;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }

  .login-form {
    padding: 20px;
  }

  .login-title {
    font-size: 24px;
  }
}
</style>
