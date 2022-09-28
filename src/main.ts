import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import storage from './utils/localstorage'
import http from './utils/http/httpclient.js'
import pinia from './store/'
import * as echarts from 'echarts'

import './style.scss'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)
app.use(ElementPlus, {
    locale: zhCn,
})
app.use(pinia)
app.use(router)

app.config.globalProperties.$http = http
app.config.globalProperties.$router = router
app.config.globalProperties.$storage = storage
app.config.globalProperties.$echarts = echarts

app.mount('#app')
