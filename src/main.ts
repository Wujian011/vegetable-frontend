import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 导入Vant样式
import 'vant/lib/index.css'

// 导入主题样式
import '@/assets/styles/theme.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
