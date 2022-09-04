<template>
    <div ref="container" id="container"></div>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import * as dat from 'dat.gui'
import * as Stats from 'stats-js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBEloader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { ref, reactive, getCurrentInstance, type ComponentInternalInstance, onMounted } from 'vue'

import * as ThreeUtil from '../../utils/threejs/util'
import { Vector3 } from 'three'

const { proxy } = getCurrentInstance() as ComponentInternalInstance

const container = ref<HTMLElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls

let modelF35: THREE.Group
let modelF2a: THREE.Group

let stats: any

onMounted(() => {
    console.log(proxy)
    init()
    addObject()
})
const init = () => {
    scene = new THREE.Scene()
    console.log(scene)

    // camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000)
    // camera.position.set(100, 100, 100)
    // camera.lookAt(scene.position)

    camera = ThreeUtil.initCamera({
        position: new Vector3(100, 100, 100),
        lookAt: scene.position,
    })
    scene.add(camera)

    renderer = ThreeUtil.initWebGLRenderer()
    // renderer.physicallyCorrectLights = true
    // renderer.shadowMap.enabled = true
    // renderer.setClearColor(0xffffff, 1)
    renderer.setAnimationLoop(render)
    container.value?.appendChild(renderer.domElement)

    controls = ThreeUtil.initOrbitControls(camera, renderer.domElement)

    const axesHelper = new THREE.AxesHelper(300)
    scene.add(axesHelper)

    const gridHelper = new THREE.GridHelper(400, 40, 0x999999)
    // scene.add(gridHelper)

    const ambient = new THREE.AmbientLight(0xffffff)
    scene.add(ambient)
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 100)
    pointLight.position.set(-100, 50, 0)
    scene.add(pointLight)
    const pointLightHelper = new THREE.PointLightHelper(pointLight, 5, 0xff0000)
    scene.add(pointLightHelper)
    // const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
    // directionalLight.position.set(100,100,100)
    // directionalLight.target = scene
    // scene.add(directionalLight)

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
    const gui = new dat.GUI()
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

    //精灵模型
    const sprite = ThreeUtil.getTextSprite({
        position: new THREE.Vector3(-50, 50, 20),
        scale: new THREE.Vector3(5, 5, 1),
        text: '测试一下文字测试一下文字文字下文字文字测试测试一下文字文字下文字文字测试测试一下文字测试一下文字文字下文字文字测试测试一下文字文字下文字文字测试测试一下文字测试一下文字文字下文字文字测试测试一下文字文字下文字文字测试测试一下文字测试一下文字文字下文字文字测试测试一下文字文字下文字文字测试',
        size: 60,
        color: 'red',
        maxLine: 1,
        maxWidth: 500,
    })
    scene.add(sprite)
}

const windowResizeCb = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
}
const clock = new THREE.Clock()
const render = () => {
    controls.update()
    renderer.render(scene, camera)

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
interface IDrawTextCanvasOptions {
    text: string
    size?: number
    color?: string
    maxLine?: number
}
const drawTextCanvas = (options: IDrawTextCanvasOptions) => {
    let maxWidth = 300
    let maxLine = options.maxLine || 2

    let fontSize = options.size || 60
    //行高
    let lineHeigth = (fontSize * 4) / 3
    let canvas = document.createElement('canvas')
    canvas.width = maxWidth
    canvas.height = maxLine * lineHeigth + (fontSize * 2) / 3
    let ctx = canvas.getContext('2d')

    if (ctx) {
        // ctx.fillStyle = 'rgba(0 ,0 ,0 ,0.5)'
        // ctx.fillRect(0, 0, canvas.width, canvas.height)
        let chr = options.text.split('') //这个方法是将一个字符串分割成字符串数组
        let temp = ''
        let row = []
        ctx.font = `${fontSize}px Verdana`
        ctx.fillStyle = options.color || '#FFF'
        for (let a = 0; a < chr.length; a++) {
            if (ctx.measureText(temp).width < 250) {
                temp += chr[a]
            } else {
                a-- //这里添加了a-- 是为了防止字符丢失，效果图中有对比
                row.push(temp)
                temp = ''
            }
        }
        row.push(temp)
        //如果数组长度大于2 则截取前两个
        if (row.length > maxLine) {
            let rowCut = row.slice(0, maxLine)
            let rowPart = rowCut[maxLine - 1] //获取最后一段文字
            let test = ''
            let empty = []
            for (let a = 0; a < rowPart.length; a++) {
                if (ctx.measureText(test).width < 220) {
                    test += rowPart[a]
                } else {
                    break
                }
            }
            empty.push(test)
            let group = empty[0] + '...' //这里只显示两行，超出的用...表示
            rowCut.splice(maxLine - 1, 1, group)
            row = rowCut
        }
        for (let b = 0; b < row.length; b++) {
            ctx.fillText(row[b], 10, lineHeigth + b * lineHeigth, maxWidth)
        }
        return canvas
    }
}
</script>

<style lang="scss" scoped></style>
