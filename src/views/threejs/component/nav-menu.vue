<template>
    <div class="container">
        <el-row class="tac" :class="{ close: !isOpen }">
            <el-col :span="24">
                <el-menu class="el-menu-vertical" @open="handleOpen" @close="handleClose" :default-openeds="['0', '1']" router>
                    <template v-for="(item, i) in list" :key="i">
                        <template v-if="!item.children || item.children.length == 0">
                            <el-menu-item :index="item.path" :class="item.path == $route.path ? 'is-active' : ''">
                                <el-icon><icon-menu /></el-icon>
                                <span>{{ item.name }}</span>
                            </el-menu-item>
                        </template>

                        <template v-else>
                            <el-sub-menu :index="`${i + 1}`">
                                <template #title>
                                    <el-icon><location /></el-icon>
                                    <span>{{ item.name }}</span>
                                </template>

                                <el-menu-item
                                    :index="child.path"
                                    v-for="(child, j) in item.children"
                                    :key="j"
                                    :class="child.path == $route.path ? 'is-active' : ''"
                                    >{{ child.name }}</el-menu-item
                                >
                            </el-sub-menu>
                        </template>
                    </template>
                </el-menu>
            </el-col>
        </el-row>
        <div class="handler" @click="isOpen = !isOpen">{{ isOpen ? '收起' : '展开' }}</div>
    </div>
</template>
<script setup lang="ts">
import { ref, reactive, getCurrentInstance, ComponentInternalInstance, onMounted } from 'vue'

import { Document, Menu as IconMenu, Location, Setting } from '@element-plus/icons-vue'
const { proxy } = getCurrentInstance() as ComponentInternalInstance

interface Item {
    name: string
    path?: string
    children?: Item[]
}
let list = reactive<Item[]>([])
let isOpen = ref(true)
const initMenuList = () => {
    list.push(
        ...[
            {
                name: '首页',
                path: '/threejs',
                children: [
                    { name: 'home', path: '/threejs' },
                    { name: 'home1', path: '/threejs/home1' },
                ],
            },
            {
                name: 'test1',
                path: '/threejs/test1',
            },
            {
                name: 'raycaster',
                path: '/threejs/raycaster',
            },
        ]
    )
    console.log(list)
}

const handleOpen = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
}
onMounted(() => {
    initMenuList()
})
</script>
<style lang="scss" scoped>
.container {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    z-index: 100;

    .tac {
        width: 300px;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        background: white;
        transition: all 0.3s ease-out;
        box-sizing: border-box;
        padding-top: 64px;

        &.close {
            width: 0;
        }
    }
    .handler {
        padding: 20px 12px;
        background: rgba($color: white, $alpha: 0.7);
        font-size: 14px;
        cursor: pointer;
    }
}
</style>
