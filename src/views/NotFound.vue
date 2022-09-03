<template>
    <div class="container">
        <img src="../assets/images/common/icon_data_empty.png" />
        <span>找不到页面了~</span>
        <div>
            <button class="confirm btn btn-lg btn-gradient btn-gradient-shadow" @click="back">返回上一页</button>
            <button class="confirm btn btn-lg btn-gradient-red btn-gradient-red-shadow" @click="confirm">回到首页</button>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()

const back = () => {
    proxy.$router.back()
}
const confirm = () => {
    proxy.$router.replace('/')
}
</script>
<style lang="scss" scoped>
.container {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;

    img {
        width: 19.6875rem;
        height: 13.5rem;
    }

    span {
        color: #616b7a;
        font-size: 0.9375rem;
        line-height: 1.5rem;
        text-align: center;
        margin-top: 1rem;
    }

    div {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 2rem;
        margin-bottom: 5rem;
        width: 100%;

        button {
            width: 8.75rem;
            text-align: center;
            color: white;
            border-radius: 4px;
            font-size: 0.9375rem;
            margin: 0 0.75rem;

            &:nth-of-type(1) {
                margin-left: 1.5rem;
            }
            &:nth-of-type(2) {
                margin-right: 1.5rem;
            }
        }
    }
}
</style>
