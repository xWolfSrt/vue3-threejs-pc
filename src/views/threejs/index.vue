<template>
    <router-view v-slot="{ Component, route }">
        <!-- <component :is="Component" :key="route.fullPath" /> -->
        <keep-alive :include="keepAlive">
            <component :is="Component" :key="route.fullPath" />
        </keep-alive>
    </router-view>
    <NavMenuVue></NavMenuVue>
</template>
<script setup lang="ts">
import { ref, reactive, getCurrentInstance, ComponentInternalInstance } from 'vue'
import NavMenuVue from './component/nav-menu.vue'
const { proxy } = getCurrentInstance() as ComponentInternalInstance
const keepAlive = reactive([])
</script>
<style lang="scss" scoped></style>
