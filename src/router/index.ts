import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import Splash from '@/views/Splash.vue'
import pinia from '../store'
const routes = [
    { path: '/', redirect: '/splash' },
    { path: '/splash', component: Splash },
    { path: '/navigate', component: () => import('@/views/Navigate.vue') },
    // 嵌套子路由，在父路由和子路由都keep-alive的情况下，会出现多次创建（挂载错乱）的问题
    // {
    //     path: '/home',
    //     component: () => import('@/views/home/HomeRoot.vue'),
    //     children: [
    //         { path: '', component: () => import('@/views/home/Home.vue') },
    //         { path: 'search', component: () => import('@/views/home/HomeSearch.vue') },
    //     ],
    // },

    {
        path: '/threejs',
        component: () => import('@/views/threejs/index.vue'),
        children: [
            {
                path: '',
                component: () => import('@/views/threejs/home.vue'),
            },
            {
                path: '/threejs/home1',
                component: () => import('@/views/threejs/home1.vue'),
            },
            {
                path: '/threejs/test1',
                component: () => import('@/views/threejs/test1.vue'),
            },
            {
                path: '/threejs/raycaster',
                component: () => import('@/views/threejs/raycaster.vue'),
            },
            {
                path: '/threejs/raycast',
                component: () => import('@/views/threejs/raycast.vue'),
            },
            {
                path: '/threejs/weiqi',
                component: () => import('@/views/threejs/weiqi.vue'),
            },
            {
                path: '/threejs/model-preview',
                component: () => import('@/views/threejs/model-preview.vue'),
            },
        ],
    },
    {
        path: '/:error*', // /:error -> 匹配 /, /one, /one/two, /one/two/three, 等
        name: '404',
        component: () => import('@/views/NotFound.vue'),
    },
]

const router = createRouter({
    routes,
    history: createWebHashHistory(),
    // history: createWebHistory('/'),
})

// const appService = appStore(pinia) //传入pinia 解决afterEach中不能使用的问题
router.afterEach((to, from) => {
    // if (to.path.indexOf('/work') != -1) {
    // }
})
export default router
