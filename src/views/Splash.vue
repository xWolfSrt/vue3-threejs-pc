<template>
    <div class="container">
        <div class="splash">
            <img src="../assets/images/logo.png" />
        </div>
        <div class="ad" v-if="data.ad">
            <img :src="data.ad.photo" @click="adClick" />

            <div class="time" @click.stop="jumpNext">
                <span>{{ data.current }}</span>
                <span>跳过</span>
            </div>
        </div>
        <div
            :style="{
                background: `url(${background})`,
                width: '100%',
                height: '100%',
                backgroundSize: '100% 100%',
            }"
        ></div>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted, getCurrentInstance, onUnmounted } from 'vue'
import dateService from '../utils/date-service'
import pictureService from '../utils/picture-service'

const { proxy } = getCurrentInstance()
const background = ref('')
onMounted(() => {
    setTimeout(() => {
        // proxy.$router.replace('/login' )
        // proxy.$router.push({
        //     path: '/login',
        //     query: {
        //         is401: true,
        //         toHome: false,
        //     },
        // })
        // let token = proxy.$storage.get('token')
        // if (token) {
        //     proxy.$router.replace('/home')
        // } else {
        //     proxy.$router.replace('/login')
        // }
        disposeConfig()
    }, 800)

    // let image = new Image()
    // image.setAttribute('crossOrigin', 'Anonymous') //跨域在前
    // //赋值在后
    // image.src =
    //     'http://223.82.99.213:8100/stage-api/profile/upload/2022/08/24/%E4%BA%95%E5%86%88%E5%B1%B1%E7%B2%BE%E7%A5%9E_1605098934530_20220824153321A024.jpg'
    // //剩下就可以安心的调用toDataUrl了。
    // image.onload = function () {
    //     let data = pictureService.image2Base64(image)
    //     console.log(data)
    //     background.value = data.dataURL
    // }
})
const data = reactive({
    ad: undefined,
    current: 5,
})

const max = 5
let inter = null

function disposeConfig() {
    let ads = []
    if (ads && ads.length > 0) {
        let list = ads
        let index = Math.floor(Math.random() * list.length) //随机取出一个
        let ad = list[index]
        data.ad = {
            photo: pictureService.compressPicture(ad.photo, { width: window.innerWidth }),
        }
        //倒计时
        data.current = max
        let t = max
        inter = setInterval(() => {
            data.current = t

            if (t <= 0) {
                data.current = 0
                jumpNext()
            }
            t--
        }, 1000)
    } else {
        setTimeout(() => {
            jumpNext()
        }, 50)
    }
}
const jumpNext = () => {
    proxy.$router.replace('/home')

    // let autoLogin = proxy.$storage.get('isAutoLogin')
    // if (!isLogin() || !autoLogin) {
    //     proxy.$router.replace('/login')
    // } else {
    //     proxy.$router.replace('/navigate')
    // }
}

const isLogin = () => {
    return proxy.$storage.get('currentAccount') != null
}
const adClick = () => {}
onUnmounted(() => {
    if (inter) {
        clearInterval(inter)
    }
})
</script>
<style lang="scss" scoped>
.container {
    width: 100vw;
    height: 100vh;
    position: relative;
    background: white;

    .splash {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: absolute;
        bottom: 48px;
        left: 50%;
        z-index: 1;
        -webkit-transform: translate(-50%, 0);
        transform: translate(-50%, 0);

        img {
            width: 158px;
            height: auto;
        }

        p {
            color: #4464ff;
            font-size: 16px;
            margin-top: 12px;
        }
    }

    .ad {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        z-index: 2;
        position: relative;
        animation: fadeIn 0.3s ease-in;
        -webkit-animation-fill-mode: forwards;
        animation-fill-mode: forwards;

        img {
            width: 100%;
            height: 100%;
        }

        .time {
            position: absolute;
            right: 16px;
            top: 40px;
            z-index: 1;
            display: flex;
            align-items: center;
            border-radius: 40px;
            background: rgba(0, 0, 0, 0.5);

            span:nth-of-type(1) {
                font-size: 12px;
                border-radius: 40px;
                width: 20px;
                height: 20px;
                line-height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 4px;
                color: white;
                background: black;
                border: 1px solid rgba(255, 255, 255, 0.5);
            }

            span:nth-of-type(2) {
                color: white;
                font-size: 12px;
                margin-right: 8px;
            }
        }
    }
}
</style>
