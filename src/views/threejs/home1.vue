<template>
    <div class="container" ref="container" id="container"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import * as dat from 'dat.gui'
import * as Stats from 'stats-js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBEloader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { ref, reactive, getCurrentInstance, type ComponentInternalInstance, onMounted, onBeforeUnmount } from 'vue'

import { TEngine } from '../../utils/threejs/TEngine'
import { Vector3 } from 'three'

const { proxy } = getCurrentInstance() as ComponentInternalInstance

const container = ref<HTMLElement | null>(null)

let modelF35: THREE.Group
let modelF2a: THREE.Group

let stats: any

let engine: TEngine
const gui = new dat.GUI()
onBeforeUnmount(() => {
    gui.destroy()
})
onMounted(() => {
    console.log(proxy)
    init()
    addObject()
})
const init = () => {
    engine = new TEngine(container.value!, {
        cameraConfig: {
            position: new Vector3(100, 100, 100),
            lookAt: new THREE.Vector3(0, 0, 0),
        },
    })
    engine.initBasicScene()
    engine.addRenderListener(render)

    window.addEventListener('resize', windowResizeCb)
}

const addObject = () => {
    // const rgbeloader =new RGBELoader()
    // rgbeloader.loadAsync('image/bg1.jpg').then(texture=>{

    //     texture.mapping = THREE.EquirectangularReflectionMapping
    //     scene.background = texture
    // })
    const textureLoader = new THREE.TextureLoader()
    //    textureLoader.loadAsync('image/bg2.jpg').then((texture) => {
    //         texture.mapping = THREE.EquirectangularReflectionMapping
    //         scene.background = texture
    //         scene.environment = texture
    //     })
    let scene = engine.getScene()
    const texture = textureLoader.load('images/1.jpg')
    texture.mapping = THREE.EquirectangularReflectionMapping
    scene.background = texture
    // scene.environment = texture

    const boxGeometry = new THREE.BoxGeometry(40, 40, 40)
    const boxMaterial = new THREE.MeshLambertMaterial({
        // color: 0xff0000,
        envMap: texture,
    })
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
    boxMesh.position.set(100, 0, -100)
    scene.add(boxMesh)

    const planeGeometry = new THREE.PlaneGeometry(100, 200)
    const planeMaterial = new THREE.MeshLambertMaterial({
        envMap: texture,
        side: THREE.DoubleSide,
    })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.position.set(0, 0, -200)
    scene.add(plane)

    const sphereGeometry = new THREE.SphereGeometry(30, 50, 50)
    const sphereMaterial = new THREE.MeshLambertMaterial({
        envMap: texture,
    })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    sphere.position.set(30, 30, 30)
    scene.add(sphere)

    const gltfloader = new GLTFLoader()
    // gltfloader
    //     .loadAsync('texture/gltf/f-35b_lightning_iibf4/scene.gltf')
    //     .then((gltf) => {
    //         console.log(gltf)

    //         modelF35 = gltf.scene
    //         modelF35.position.set(-50, -50, 0)
    //         modelF35.scale.set(0.2, 0.2, 0.2)
    //         scene.add(modelF35)
    //     })
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // gltfloader
    //     .loadAsync('texture/gltf/jasdf_f-2a_low_poly_model/scene.gltf')
    //     .then((gltf) => {
    //         console.log(gltf)

    //         modelF2a = gltf.scene
    //         modelF2a.position.set(-50, 60, 0)
    //         modelF2a.scale.set(5, 5, 5)
    //         scene.add(modelF2a)
    //     })
    //     .catch((err) => {
    //         console.log(err)
    //     })
    const box = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshLambertMaterial({ color: 0xff0000 }))
    box.position.set(80, 30, 0)
    scene.add(box)

    //变量控制
    gui.add(sphere.position, 'x', 30, 60, 1)
        .name('球的x')
        .onChange((e) => {
            console.log('sphere.position x = ' + e)
        })
    gui.add(sphere.position, 'y', 30, 60, 1)
        .name('球的y')
        .onChange((e) => {
            console.log('sphere.position y = ' + e)
        })
    gui.add(sphere.position, 'z', 30, 60, 1)
        .name('球的z')
        .onChange((e) => {
            console.log('sphere.position z = ' + e)
        })
    gui.addColor(
        {
            color: '#ff0000', // 或者 color:0xbbffaa
        },
        'color'
    )
        .name('正方形的颜色')
        .onChange((e) => {
            box.material.color = new THREE.Color(e)
        })
    const folder1 = gui.addFolder('飞机')
    const obj = {
        scale1: 1,
        scale2: 1,
    }
    folder1
        .add(obj, 'scale1', 1, 5, 1)
        .name('f35缩放')
        .onChange((e) => {
            if (modelF35) {
                let x = 0.2 + e * 0.1
                let y = 0.2 + e * 0.1
                let z = 0.2 + e * 0.1
                modelF35.scale.set(x, y, z)
            }
        })
    folder1
        .add(obj, 'scale2', 1, 10, 1)
        .name('f2a缩放')
        .onChange((e) => {
            if (modelF2a) {
                let x = 5 + e
                let y = 5 + e
                let z = 5 + e
                modelF2a.scale.set(x, y, z)
            }
        })
    folder1.open()
    //监视帧数
    stats = new Stats()
    stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom)

    // //精灵模型
    // const sprite = ThreeUtil.getTextSprite({
    //     position: new THREE.Vector3(-50, 50, 20),
    //     scale: new THREE.Vector3(5, 5, 1),
    //     text: '测试一下文字测试一下文字文字下文字文字测试测试一下文字文字下文字文字测试测试一下文字测试一下文字文字下文字文字测试测试一下文字文字下文字文字测试测试一下文字测试一下文字文字下文字文字测试测试一下文字文字下文字文字测试测试一下文字测试一下文字文字下文字文字测试测试一下文字文字下文字文字测试',
    //     size: 60,
    //     color: 'red',
    //     maxLine: 1,
    //     maxWidth: 500,
    // })
    // scene.add(sprite)
}

const windowResizeCb = () => {
    // camera.aspect = window.innerWidth / window.innerHeight
    // camera.updateProjectionMatrix()
    // renderer.setSize(window.innerWidth, window.innerHeight)
    // renderer.setPixelRatio(window.devicePixelRatio)
}
const clock = new THREE.Clock()
const render = () => {
    stats.update()
    if (modelF35) {
        const time = clock.getElapsedTime()
        modelF35.position.x = Math.sin(time) * 50
        modelF35.position.z = Math.cos(time) * 50
    }
    if (modelF2a) {
        const time = clock.getElapsedTime()
        modelF2a.position.x = Math.sin(time) * 50
        // modelF2a.position.z = Math.cos(time) * 50
    }
    // boxMesh.position.x += 0.5
    // boxMesh.rotateY(0.01)
}
</script>

<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100vh;
}
</style>
