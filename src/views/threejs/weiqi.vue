<template>
    <div class="container" ref="container"></div>

    <div class="material">
        <div v-for="(item, index) in list" :key="index" @click="materialClick(index)" :class="{ selected: currentIndex == index }">
            <div :style="{ background: `${item.color}` }"></div>
        </div>
    </div>
    <div class="operator">
        <el-button @click="reset">重置</el-button>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, getCurrentInstance, type ComponentInternalInstance, onMounted } from 'vue'
import { TEngine } from '../../utils/threejs/TEngine'
import * as THREE from 'three'
const { proxy } = getCurrentInstance() as ComponentInternalInstance
const container = ref<HTMLElement | null>(null)
let engine: TEngine
const pointer = new THREE.Vector2(0, 0)
const raycaster = new THREE.Raycaster()

const objects: THREE.Object3D[] = []

let list = reactive<{ img?: string; color?: THREE.ColorRepresentation; material: THREE.MeshStandardMaterial }[]>([])
let currentIndex = ref(0)

const materialClick = (index: number) => {
    currentIndex.value = index
}
const initBoxMaterial = () => {
    list.push({
        color: 'white',
        material: new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.7,
            metalness: 0.5,
        }),
    })

    list.push({
        color: 'black',
        material: new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.3,
            metalness: 0.5,
        }),
    })
}

const getMaterialItem = (folder: string) => {
    let name = folder.split('_')[2]
    return {
        img: `/texture/surface/${folder}/${name}_1K_Albedo.jpg`,
        material: new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load(`/texture/surface/${folder}/${name}_1K_Albedo.jpg`),
            roughnessMap: new THREE.TextureLoader().load(`/texture/surface/${folder}/${name}_1K_Roughness.jpg`),
            normalMap: new THREE.TextureLoader().load(`/texture/surface/${folder}/${name}_1K_Normal.jpg`),
            aoMap: new THREE.TextureLoader().load(`/texture/surface/${folder}/${name}_1K_AO.jpg`),
        }),
    }
}

const getBoxMaterial = () => {
    return list[currentIndex.value].material
}

const addPoints = () => {
    let points = [0, 0, 0, 60, 0, 0, -60, 0, 0, 0, 0, 60, 0, 0, -60, 60, 0, -60, -60, 0, -60, -60, 0, 60, 60, 0, 60]
    const geometry = new THREE.CircleGeometry(1, 20)
    geometry.rotateX(-Math.PI / 2)
    const material = new THREE.MeshBasicMaterial({ color: 0x000000 })
    let index = 0
    while (index < points.length) {
        console.log(index)
        const circle = new THREE.Mesh(geometry, material)
        circle.position.set(points[index], points[index + 1] + 0.1, points[index + 2])
        engine.addObjects([circle])
        index += 3
    }
}

onMounted(() => {
    initBoxMaterial()

    engine = new TEngine(container.value!)
    engine.initBasicScene()
    let gridHelper = engine.addGridHelper(180, 18, 0x111111, 0x111111)
    gridHelper.position.y = 0.05
    engine.addDirectionalLight()

    const planeGeometry = new THREE.PlaneGeometry(200, 200)
    const planeMaterial = getMaterialItem('wood_veneer_vdcjfiw').material
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    planeGeometry.rotateX(-Math.PI / 2)
    plane.name = 'plane'
    let scene = engine.getScene()
    scene.add(plane)
    addPoints()

    const shadowBoxGeometry = new THREE.SphereGeometry(5, 30, 30, 0, Math.PI * 2, 0, Math.PI / 2) //半球几何
    const shadowBoxMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
        opacity: 0.5,
        transparent: true,
    })

    const shadowBox = new THREE.Mesh(shadowBoxGeometry, shadowBoxMaterial)
    scene.add(shadowBox)

    const boxGeometry = new THREE.SphereGeometry(5, 30, 30, 0, Math.PI * 2, 0, Math.PI / 2) //半球几何

    objects.push(plane)
    container.value?.addEventListener('pointermove', function (event) {
        pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)

        raycaster.setFromCamera(pointer, engine.getCamera())
        const intersects = raycaster.intersectObjects(objects, false)
        if (intersects.length > 0) {
            const intersect = intersects[0]
            if (intersect.point.y < -5) {
                return
            }

            shadowBox.position.copy(intersect.point).add(intersect.face?.normal!)
            shadowBox.position.divideScalar(10).round().floor().multiplyScalar(10)
            if (event.shiftKey) {
                shadowBox.visible = false
            } else {
                shadowBox.visible = true
            }
        }
    })

    container.value?.addEventListener('pointerdown', function (event) {
        if (event.button != 0) {
            return
        }
        pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)

        raycaster.setFromCamera(pointer, engine.getCamera())
        const intersects = raycaster.intersectObjects(objects, false)
        if (intersects.length > 0) {
            const intersect = intersects[0]
            console.log(intersect)
            if (intersect.point.y < -5) {
                return
            }
            if (event.shiftKey) {
                if (intersect.object.name != 'plane') {
                    scene.remove(intersect.object)
                    objects.splice(
                        objects.findIndex((item) => item.uuid == intersect.object.uuid),
                        1
                    )
                }
            } else {
                if (intersect.object.name == 'plane') {
                    const box = new THREE.Mesh(boxGeometry, getBoxMaterial())
                    box.position.copy(intersect.point).add(intersect.face?.normal!)
                    box.position.divideScalar(10).round().floor().multiplyScalar(10)
                    scene.add(box)

                    objects.push(box)
                    console.log('add', objects.length)
                }
            }
        }
    })
})
const reset = () => {
    let scene = engine.getScene()
    objects.forEach((item) => {
        if (item.name != 'plane') {
            scene.remove(item)
        }
    })
    objects.splice(1, objects.length - 1)
}
</script>

<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100vh;
}
.tips {
    position: absolute;
    left: 50%;
    top: 30px;
    z-index: 10;
    transform: translateX(-50%);
    color: white;
    user-select: none;
}

.material {
    position: absolute;
    left: 50%;
    bottom: 30px;
    z-index: 10;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    border: 1px solid white;
    padding: 2px;

    div {
        width: 60px;
        height: 60px;
        padding: 5px;
        box-sizing: border-box;
        border: 4px solid transparent;

        &.selected {
            border: 4px solid red;
        }

        div {
            width: 100%;
            height: 100%;
            user-select: none;
        }
    }
}
.operator {
    position: absolute;
    right: 30px;
    top: 50%;
    z-index: 10;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    padding: 2px;
    display: flex;
    flex-direction: column;
}
</style>
