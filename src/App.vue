<template>
    <router-view v-slot="{ Component, route }">
        <!-- 根路由不能使用key，否则子路由会重复创建 -->
        <!-- <component :is="Component" :key="route.fullPath" /> -->

        <transition name="view" mode="out-in">
            <component :is="Component" />
        </transition>
    </router-view>
</template>
<script setup lang="ts">
import { ref, reactive, getCurrentInstance, ComponentInternalInstance } from 'vue'
const { proxy } = getCurrentInstance() as ComponentInternalInstance
</script>
<style lang="scss">
#app {
    width: 100%;
    height: 100vh;
}
.view-enter-active {
    animation: view-ani var(--el-transition-duration);
}

.view-leave-active {
    animation: view-ani reverse var(--el-transition-duration);
}

@keyframes view-ani {
    from {
        opacity: 0;
    }
}

// // 淡出淡入
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
    transition: all 0.5s ease;
}
.scale-enter-from,
.scale-leave-to {
    opacity: 0;
    transform: scale(0.9);
}
</style>
