<template>
  <div class="register-container">
    <div class="register-header">
      <h1 class="register-title">创建账号</h1>
      <p class="register-subtitle">请填写以下信息完成注册</p>
    </div>

    <van-form @submit="onSubmit" class="register-form">
      <van-cell-group inset>
        <van-field
          v-model="formData.userAccount"
          name="userAccount"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[
            { required: true, message: '请输入用户名' },
            { min: 3, message: '用户名至少3个字符' },
            { max: 20, message: '用户名最多20个字符' },
          ]"
          left-icon="user-o"
          clearable
        />

        <van-field
          v-model="formData.userPassword"
          type="password"
          name="userPassword"
          label="密码"
          placeholder="请输入密码"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码至少8个字符' },
          ]"
          left-icon="lock"
          clearable
        />

        <van-field
          v-model="formData.checkPassword"
          type="password"
          name="checkPassword"
          label="确认密码"
          placeholder="请再次输入密码"
          :rules="[
            { required: true, message: '请确认密码' },
            { validator: validatePassword, message: '两次密码输入不一致' },
          ]"
          left-icon="lock"
          clearable
        />
      </van-cell-group>

      <div class="register-actions">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="loading"
          class="register-button"
        >
          注册
        </van-button>

        <div class="login-link">
          <span class="login-text">已有账号？</span>
          <van-button type="primary" plain size="small" @click="goToLogin"> 立即登录</van-button>
        </div>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import { userRegister } from '@/api/userController.ts'

const router = useRouter()
const route = useRoute()
const loading = ref(false)

// 表单数据
const formData = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

// 密码确认验证
const validatePassword = (value: string) => {
  return value === formData.userPassword
}

// 提交注册
const onSubmit = async (values: API.UserRegisterRequest) => {
  loading.value = true

  try {
    // 这里应该调用注册API
    console.log('注册数据:', values)

    const res = await userRegister(values)
    if (res.data.code === 0) {
      showSuccessToast('注册成功')
      // 注册成功后跳转到登录页，并保持redirect参数
      const redirectPath = route.query.redirect as string
      if (redirectPath) {
        router.push(`/user/login?redirect=${encodeURIComponent(redirectPath)}`)
      } else {
        router.push({
          path: '/user/login',
          replace: true,
        })
      }
    } else {
      showFailToast('注册失败，请检查账号密码 ' + res.data.message)
    }
  } catch (error) {
    showToast('注册失败，请重试 ' + error)
  } finally {
    loading.value = false
  }
}

// 跳转到登录页面
const goToLogin = () => {
  const redirectPath = route.query.redirect as string
  if (redirectPath) {
    router.push(`/user/login?redirect=${encodeURIComponent(redirectPath)}`)
  } else {
    router.push('/user/login')
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.register-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.register-subtitle {
  font-size: 16px;
  opacity: 0.8;
  margin: 0;
}

.register-form {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.register-actions {
  margin-top: 24px;
}

.register-button {
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
}

.login-link {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-text {
  color: #666;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .register-container {
    padding: 16px;
  }

  .register-form {
    padding: 20px;
  }

  .register-title {
    font-size: 24px;
  }
}
</style>
