<template>
    <div class="container" ref="container"></div>
    <div class="tips">点击鼠标左键添加方块，按住shift+鼠标左键移除方块</div>

    <div class="material">
        <div v-for="(item, index) in list" :key="index" @click="materialClick(index)" :class="{ selected: currentIndex == index }">
            <img :src="item.img" />
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

let list = reactive<{ img: string; material: THREE.MeshStandardMaterial }[]>([])
let currentIndex = ref(0)

const materialClick = (index: number) => {
    currentIndex.value = index
}
const initBoxMaterial = () => {
    list.push(getMaterialItem('grass_patchy_vcpoajjs'))
    list.push(getMaterialItem('stone_wall_virrdhy'))
    list.push(getMaterialItem('stone_wall_vjqpfbo'))
    list.push(getMaterialItem('wood_board_vf1oairg'))
    list.push(getMaterialItem('wood_plank_viriagk'))
    list.push({
        img: `/texture/surface/crate.gif`,
        material: new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load(`/texture/surface/crate.gif`),
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

onMounted(() => {
    initBoxMaterial()
    engine = new TEngine(container.value!)
    engine.initBasicScene()
    engine.addGridHelper()
    engine.addDirectionalLight()

    const planeGeometry = new THREE.PlaneGeometry(400, 400)
    const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0xcecece,
        side: THREE.DoubleSide,
        visible: true,
    })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    planeGeometry.rotateX(-Math.PI / 2)
    plane.name = 'plane'
    let scene = engine.getScene()
    scene.add(plane)

    const shadowBoxGeometry = new THREE.BoxGeometry(10, 10, 10)
    const shadowBoxMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        opacity: 0.5,
        transparent: true,
    })

    const shadowBox = new THREE.Mesh(shadowBoxGeometry, shadowBoxMaterial)
    // shadowBox.position.set(0, 5, 0)
    scene.add(shadowBox)

    const boxGeometry = new THREE.BoxGeometry(10, 10, 10)

    objects.push(plane)
    container.value?.addEventListener('pointermove', function (event) {
        pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)
        // console.log('pointermove', pointer)

        // shadowBox.position.x= pointer.x
        // shadowBox.position.y= pointer.y
        raycaster.setFromCamera(pointer, engine.getCamera())
        const intersects = raycaster.intersectObjects(objects, false)
        // console.log(intersects)
        if (intersects.length > 0) {
            const intersect = intersects[0]
            if (intersect.point.y < -5) {
                return
            }

            shadowBox.position.copy(intersect.point).add(intersect.face?.normal!)
            shadowBox.position.divideScalar(10).floor().multiplyScalar(10).addScalar(5)
            if (event.shiftKey) {
                shadowBox.visible = false
            } else {
                shadowBox.visible = true
            }
            // shadowBox.position.y = 5
        }
    })

    container.value?.addEventListener('pointerdown', function (event) {
        console.log(event)
        if (event.button != 0) {
            return
        }
        pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)
        // console.log('pointermove', pointer)

        // shadowBox.position.x= pointer.x
        // shadowBox.position.y= pointer.y
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
                const box = new THREE.Mesh(boxGeometry, getBoxMaterial())
                box.position.copy(intersect.point).add(intersect.face?.normal!)
                box.position.divideScalar(10).floor().multiplyScalar(10).addScalar(5)
                // box.position.y = 5
                scene.add(box)

                objects.push(box)
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

        img {
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
