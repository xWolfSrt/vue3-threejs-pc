<template>
    <div class="container" ref="container" id="container"></div>
    <div class="operator">
        <div v-for="(item, index) in menus" :key="index" :class="{ selected: menuEnable[item.code] }" @click="menuClick(index)">
            {{ item.name }}
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const { proxy } = getCurrentInstance()

const container = ref(null)
const menus = reactive([
    {
        name: '自由旋转',
        code: 'freerotate',
    },
    {
        name: '移动',
        code: 'move',
    },
    {
        name: '旋转',
        code: 'rotate',
    },
    {
        name: '爆炸',
        code: 'boom',
    },
    {
        name: '隐藏',
        code: 'hide',
    },
    {
        name: '透视',
        code: 'perspective',
    },
    {
        name: '剖切',
        code: 'cut',
    },
    {
        name: '拆装',
        code: 'detach',
    },
])
const menuEnable = reactive({
    freerotate: false,
    move: true,
    rotate: false,
    boom: false,
    hide: false,
    perspective: false,
    cut: false,
    detach: false,
})

let orginalModel
const objects = []
const pointer = new THREE.Vector2(0, 0)
const raycaster = new THREE.Raycaster()

let dom, scene, camera, renderer, controls
const initScene = () => {
    dom = document.getElementById('container')
    scene = new THREE.Scene()
    let texture = new THREE.TextureLoader().load('images/1.jpg')
    texture.mapping = THREE.EquirectangularReflectionMapping
    scene.background = texture

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(0, 25, 50)
    camera.lookAt(new THREE.Vector3(0, 20, 0))
    scene.add(camera)

    renderer = new THREE.WebGLRenderer({
        antialias: true,
    })
    renderer.setAnimationLoop(render)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)

    dom.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff)
    scene.add(ambientLight)

    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(1, 1, 1).normalize()
    scene.add(light)

    const axesHelper = new THREE.AxesHelper(300)
    scene.add(axesHelper)

    // controls = new OrbitControls(camera, renderer.domElement)
    // controls.enableDamping = true
    // controls.mouseButtons = {
    //     LEFT: THREE.MOUSE.LEFT, //释放鼠标左键
    //     MIDDLE: THREE.MOUSE.DOLLY, //缩放
    //     RIGHT: null, //使用鼠标右键 旋转视角，按住ctrl+右键 平移视角
    // }

    render()
    window.addEventListener('resize', windowResizeCb)
}
const render = () => {
    // controls.update()
    renderer.render(scene, camera)
}
const windowResizeCb = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
}
onBeforeUnmount(() => {
    removeListener()
})
onMounted(() => {
    initScene()

    const map = new THREE.TextureLoader().load('/texture/models/TiLiangYou/Texture/TiLiangYou_M_AlbedoTransparency.jpg')
    const normal = new THREE.TextureLoader().load('/texture/models/TiLiangYou/Texture/TiLiangYou_M_Normal.jpg')
    const roughness = new THREE.TextureLoader().load('/texture/models/TiLiangYou/Texture/TiLiangYou_M_MetallicSmoothness.png')
    let loader = new FBXLoader()
    console.log(map)
    console.log(normal)
    console.log(roughness)
    loader.setResourcePath('/texture/models/TiLiangYou/Texture/')
    loader.setPath('/texture/models/TiLiangYou/')
    loader.load('TiLiangYou.fbx', function (object) {
        console.log(object)

        //加载路径fbx文件
        object.traverse(function (child) {
            console.log(child)

            if (child.isMesh) {
                // child.castShadow = true
                // child.receiveShadow = true
                child.material = child.material.clone() //克隆一份材质，否则材质的引用是同一个，就不能分别控制透明度了
                child.material.map = map
                child.material.roughnessMap = roughness
                child.material.transparent = true

                objects.push(child)
            }
        })
        orginalModel = object
        scene.add(object) //模型
        initOperate()
    })

    // setTimeout(() => {
    //     objects.forEach(object=>{
    //         object.material.normalMapType = THREE.ObjectSpaceNormalMap
    //         object.material.normalMap = normal
    //     })
    // }, 3000);
})

const resetModel = () => {
    //还原隐藏状态
    objects.forEach((item) => {
        item.visible = true
        item.material.opacity = 1
        item.material.depthWrite = true
    })
}

const addListener = () => {
    let dom = document.getElementById('container')
    dom.addEventListener('mousewheel', mousewheel, false)
    dom.addEventListener('DOMMouseScroll', mousewheel, false)

    dom.addEventListener('pointerdown', pointerdown, false)
    dom.addEventListener('pointerup', pointerup, false)
    dom.addEventListener('pointermove', pointermove, false)

    //禁止在canvas上点击右键弹出菜单
    dom.children[0].oncontextmenu = function (e) {
        e.preventDefault()
        return false
    }
}
const removeListener = () => {
    dom.removeEventListener('mousewheel', mousewheel, false)
    dom.removeEventListener('DOMMouseScroll', mousewheel, false)

    dom.removeEventListener('pointerdown', pointerdown, false)
    dom.removeEventListener('pointerup', pointerup, false)
    dom.removeEventListener('pointermove', pointermove, false)
}

let leftDownObject
let rightDownObject
let hoverObject
let previousMousePosition = {
    x: 0,
    y: 0,
}

const mousewheel = (event) => {
    let t = undefined
    if (event.wheelDelta) {
        // IE/Opera/Chrome  往内滚动为负值
        t = event.wheelDelta
    } else if (event.detail) {
        // Firefox  往内滚动为正值，所以这里取反
        t = -event.detail
    }
    //正值往上 放大，负值往下 缩小
    if (hoverObject) {
        let delta = 0.1
        console.log(hoverObject.scale)

        if (menuEnable.boom || menuEnable.detach) {
            if (t > 0 && hoverObject.scale.x < 2) {
                hoverObject.scale.set(hoverObject.scale.x + delta, hoverObject.scale.y + delta, hoverObject.scale.z + delta)
            } else if (t < 0 && hoverObject.scale.x > 0.5) {
                hoverObject.scale.set(hoverObject.scale.x - delta, hoverObject.scale.y - delta, hoverObject.scale.z - delta)
            }
        } else {
            console.log(orginalModel.scale)
            if (t > 0 && orginalModel.scale.x < 2.5) {
                orginalModel.scale.set(orginalModel.scale.x + delta, orginalModel.scale.y + delta, orginalModel.scale.z + delta)
            } else if (t < 0 && orginalModel.scale.x > 0.5) {
                orginalModel.scale.set(orginalModel.scale.x - delta, orginalModel.scale.y - delta, orginalModel.scale.z - delta)
            }
        }
    }
}
const pointerdown = (event) => {
    event.preventDefault()

    pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)

    raycaster.setFromCamera(pointer, camera)
    const intersects = raycaster.intersectObjects(objects, false)
    if (intersects.length > 0) {
        const intersect = intersects[0]
        console.log(intersect)
        if (menuEnable.hide) {
            intersect.object.visible = false
        }
        if (menuEnable.perspective) {
            intersect.object.material.opacity = 0.5
            intersect.object.material.depthWrite = false //模型透明出现遮挡
        }
        if (event.button == 0) {
            //左键点击
            leftDownObject = intersect.object
        } else if (event.button == 2) {
            //右键点击
            rightDownObject = intersect.object
        }
        console.log(orginalModel)
    }
}

const pointermove = (event) => {
    event.preventDefault()
    pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)

    raycaster.setFromCamera(pointer, camera)
    const intersects = raycaster.intersectObjects(objects, false)
    //移动时，记录当前鼠标位置是否存在模型
    if (intersects.length > 0) {
        const intersect = intersects[0]
        hoverObject = intersect.object
        // console.log(intersect)
    } else {
        hoverObject = null
    }

    let deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y,
    }
    //爆炸和拆装模式下，可以自由移动和旋转子模型
    if (menuEnable.detach || menuEnable.boom) {
        //如果当前鼠标在模型上，禁用controls
        // if (hoverObject) {
        //     controls.enabled = false
        //     controls.enableZoom = false
        // } else {
        //     controls.enableZoom = true
        // }

        //移动模式下，使用左键移动物体，旋转模式下，使用右键移动物体
        let moveDownObject = menuEnable.move ? leftDownObject : rightDownObject
        //左键点击的物体
        if (moveDownObject) {
            let degX = deltaMove.x / 18 //X轴是正向移动
            let degY = -deltaMove.y / 18 //Y轴是反向移动
            moveDownObject.position.x += degX
            moveDownObject.position.y += degY
            // controls.enabled = false
        } else {
            // controls.enabled = true
        }

        let rotateDownObject = menuEnable.move ? rightDownObject : leftDownObject
        //右键点击的物体
        if (rotateDownObject) {
            // let deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
            //     new THREE.Euler(toRadians(degY * 1), toRadians(degX * 1), 0, 'XYZ')
            // )
            // rotateDownObject.quaternion.multiplyQuaternions(deltaRotationQuaternion, rotateDownObject.quaternion)

            let deltaMove = {
                x: event.clientX - previousMousePosition.x,
                y: event.clientY - previousMousePosition.y,
            }
            let degX = deltaMove.x / 240
            let degY = deltaMove.y / 240

            if (menuEnable.freerotate) {
                rotateDownObject.rotation.x += degY //绕x轴旋转 是根据上下移动的值来操作
            }
            rotateDownObject.rotation.y += degX //绕y轴旋转 是根据左右移动的值来操作
        }
    } else {
        //移动模式下，使用左键移动物体，旋转模式下，使用右键移动物体
        let moveDownObject = menuEnable.move ? leftDownObject : rightDownObject
        //左键点击的物体
        if (moveDownObject) {
            let degX = deltaMove.x / 18 //X轴是正向移动
            let degY = -deltaMove.y / 18 //Y轴是反向移动
            orginalModel.position.x += degX
            orginalModel.position.y += degY
            // controls.enabled = false
        } else {
            // controls.enabled = true
        }

        let rotateDownObject = menuEnable.move ? rightDownObject : leftDownObject
        //右键点击的物体
        if (rotateDownObject) {
            // let deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
            //     new THREE.Euler(toRadians(degY * 1), toRadians(degX * 1), 0, 'XYZ')
            // )
            // orginalModel.quaternion.multiplyQuaternions(deltaRotationQuaternion, orginalModel.quaternion)

            let degX = deltaMove.x / 240
            let degY = deltaMove.y / 240
            if (menuEnable.freerotate) {
                orginalModel.rotation.x += degY //绕x轴旋转 是根据上下移动的值来操作
            }
            orginalModel.rotation.y += degX //绕y轴旋转 是根据左右移动的值来操作
        }
    }

    previousMousePosition = {
        x: event.clientX,
        y: event.clientY,
    }
}
function toRadians(angle) {
    return angle * (Math.PI / 180)
}

const pointerup = (event) => {
    event.preventDefault()

    leftDownObject = null
    rightDownObject = null
    previousMousePosition = {
        x: 0,
        y: 0,
    }
    // controls.enabled = true
}

const initOperate = () => {
    addListener()
}

const menuClick = (index) => {
    let item = menus[index]
    let code = item.code
    switch (code) {
        case 'freerotate':
            menuEnable[code] = !menuEnable[code]
            break
        case 'move':
            menuEnable[code] = true
            menuEnable['rotate'] = false
            break
        case 'rotate':
            menuEnable[code] = true
            menuEnable['move'] = false
            break
        default:
            if (!menuEnable[code]) {
                menuEnable['boom'] = false
                menuEnable['hide'] = false
                menuEnable['perspective'] = false
                menuEnable['cut'] = false
                menuEnable['detach'] = false
            }
            menuEnable[code] = !menuEnable[code]
            if (!menuEnable[code]) {
                resetModel()
            }
            break
    }
    console.log(menuEnable)
}
</script>

<style lang="scss" scoped>
.operator {
    position: absolute;
    right: 0;
    top: 50%;
    z-index: 10;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    padding: 6px 4px;
    display: flex;
    flex-direction: column;
    background: #1d2834;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;

    div {
        font-size: 16px;
        color: white;
        padding: 12px 4px;
        cursor: pointer;
        margin: 4px 0;

        &.selected {
            color: #18ba6b;
        }
    }
}
</style>
