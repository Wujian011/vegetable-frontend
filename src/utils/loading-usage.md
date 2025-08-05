# 移动端Loading优化方案使用说明

## 概述

本方案为移动端网页提供了完整的Loading状态管理，解决了后端响应慢时用户误触操作的问题。包含全局Loading、防重复点击、请求拦截等功能。

## 核心功能

### 1. 全局Loading状态管理

**文件：** `src/stores/loading.ts`

**功能：**

- 全局Loading状态管理
- 支持多个并发请求
- 防止Loading闪烁（最小显示时间300ms）
- 自动计数器管理

**使用方式：**

```typescript
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()

// 手动控制loading
loadingStore.showLoading()
loadingStore.hideLoading()

// 或者使用设置方法
loadingStore.setLoading(true)
```

### 2. 全局Loading组件

**文件：** `src/components/GlobalLoading.vue`

**功能：**

- 全屏遮罩Loading
- 防止用户交互
- 支持暗色模式
- 移动端优化

**特性：**

- 自动根据loading store状态显示/隐藏
- 支持自定义加载文案
- 支持触摸事件阻止
- 流畅的进入/退出动画

### 3. 请求拦截器

**文件：** `src/request.ts`

**功能：**

- 自动管理API请求的loading状态
- 支持并发请求计数
- 可配置是否显示全局loading

**配置：**

```typescript
// 默认显示全局loading
axios.get('/api/data')

// 静默请求（不显示loading）
axios.get('/api/data', { showGlobalLoading: false })
```

### 4. 防重复点击Hook

**文件：** `src/composables/useThrottle.ts`

**提供的函数：**

#### `usePreventRepeatedClick`

防止用户重复点击，返回loading状态

```typescript
const [handleSubmit, loading] = usePreventRepeatedClick(originalFunction, 1000)

// 在模板中使用
<van-button :loading="loading.value" @click="handleSubmit">
  提交
</van-button>
```

#### `useDebounce`

防抖函数

```typescript
const [debouncedFn, cancel] = useDebounce(originalFunction, 300)
```

#### `useThrottle`

节流函数

```typescript
const [throttledFn, cancel] = useThrottle(originalFunction, 300)
```

#### `useAsyncLoading`

异步操作loading管理

```typescript
const [wrappedFn, loading] = useAsyncLoading(asyncFunction)
```

### 5. 请求配置工具

**文件：** `src/utils/request-config.ts`

**预设配置：**

```typescript
import { RequestPresets } from '@/utils/request-config'

// 静默请求
axios.get('/api/data', RequestPresets.silent)

// 带loading的请求
axios.get('/api/data', RequestPresets.withLoading)

// 文件上传
axios.post('/api/upload', data, RequestPresets.fileUpload)

// 快速请求（10秒超时）
axios.get('/api/quick', RequestPresets.quick)

// 长时间请求（2分钟超时）
axios.post('/api/process', data, RequestPresets.longRunning)
```

## 已优化的组件

### 1. 菜品管理页面 (`src/views/admin/DishManageView.vue`)

- 使用`usePreventRepeatedClick`防止重复提交
- 图片上传loading状态优化
- 表单提交防重复点击

### 2. 购物车页面 (`src/views/CartView.vue`)

- 订单提交使用防重复点击
- 1.5秒防重复间隔

### 3. 登录页面 (`src/views/user/LoginView.vue`)

- 登录按钮防重复点击
- 1秒防重复间隔

## 最佳实践

### 1. 选择合适的Loading方式

**全局Loading（推荐用于重要操作）：**

- 登录/注册
- 订单提交
- 支付操作
- 数据保存

**局部Loading（推荐用于次要操作）：**

- 列表加载更多
- 搜索
- 非关键数据获取

### 2. 防重复点击的使用

**重要提交操作：**

```typescript
// 使用较长的延迟时间
const [submitOrder, loading] = usePreventRepeatedClick(originalSubmit, 1500)
```

**一般操作：**

```typescript
// 使用标准延迟时间
const [handleClick, loading] = usePreventRepeatedClick(originalClick, 500)
```

### 3. 自定义请求配置

**关闭特定请求的全局loading：**

```typescript
// 获取用户信息等轻量操作
const response = await getUserInfo({}, { showGlobalLoading: false })
```

**文件上传：**

```typescript
const response = await upload(file, RequestPresets.fileUpload)
```

## 错误处理

### 1. Loading卡住的处理

```typescript
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()

// 强制隐藏loading（用于错误恢复）
loadingStore.forceHideLoading()
```

### 2. 请求失败的处理

请求拦截器会自动处理失败情况下的loading隐藏，无需手动处理。

## 性能考虑

1. **最小显示时间**：Loading至少显示300ms，避免闪烁
2. **并发请求**：支持多个请求同时进行，合理计数
3. **内存管理**：组件销毁时自动清理定时器
4. **移动端优化**：针对触摸事件和移动端体验优化

## 注意事项

1. **不要混用**：避免同时使用全局loading和局部loading的手动控制
2. **延迟时间**：根据操作重要性设置合理的防重复延迟时间
3. **用户反馈**：重要操作完成后提供明确的成功/失败反馈
4. **网络超时**：长时间操作设置合理的超时时间

## 调试

### 开发环境查看Loading状态

```typescript
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()
console.log('Loading状态:', loadingStore.isLoading)
console.log('请求计数:', loadingStore.requestCount)
```

### 浏览器控制台命令

```javascript
// 在浏览器控制台手动控制loading
window.__loadingStore =
  document.querySelector('#app').__vue_app__.config.globalProperties.$loadingStore
window.__loadingStore.showLoading()
window.__loadingStore.hideLoading()
```
