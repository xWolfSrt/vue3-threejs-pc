<template>
    <div class="container" ref="container"></div>
</template>
<script setup lang="ts">
import { ref, reactive, getCurrentInstance, ComponentInternalInstance, onMounted } from 'vue'
import { TEngine } from '../../utils/threejs/TEngine'
import * as THREE from 'three'
import { Object3D } from 'three'
const { proxy } = getCurrentInstance() as ComponentInternalInstance
const container = ref<HTMLElement | null>(null)

let engine: TEngine
let pointer = new THREE.Vector2()
let objects: Object3D[] = []
const raycaster = new THREE.Raycaster()
onMounted(() => {
    engine = new TEngine(container.value!)
    engine.initBasicScene()
    engine.addDirectionalLight()
    engine.addGridHelper()

    const planeGeometry = new THREE.PlaneGeometry(400, 400)
    const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0xeeeeee,
        side: THREE.DoubleSide,
    })
    planeGeometry.rotateX(-Math.PI / 2)
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.name = 'plane'
    plane.position.y = -0.01

    objects.push(plane)

    const shadowBoxGeometry = new THREE.BoxGeometry(10, 10, 10)
    const shodowBoxMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        opacity: 0.5,
        transparent: true,
    })
    const shadowBox = new THREE.Mesh(shadowBoxGeometry, shodowBoxMaterial)

    engine.addObjects([plane, shadowBox])

    const boxGeometry = new THREE.BoxGeometry(10, 10, 10)
    const boxMaterial = new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load('/texture/surface/vjqpfbo/vjqpfbo_2K_Albedo.jpg'),
        bumpMap: new THREE.TextureLoader().load('/texture/surface/vjqpfbo/vjqpfbo_2K_Bump.jpg'),
        normalMap: new THREE.TextureLoader().load('/texture/surface/vjqpfbo/vjqpfbo_2K_Normal.jpg'),
        roughnessMap: new THREE.TextureLoader().load('/texture/surface/vjqpfbo/vjqpfbo_2K_Roughness.jpg'),
    })

    container.value?.addEventListener('pointermove', function (e) {
        pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)

        raycaster.setFromCamera(pointer, engine.getCamera())
        const intersects = raycaster.intersectObjects(objects, false)
        // console.log(intersects)

        if (intersects.length > 0) {
            const intersect = intersects[0]

            shadowBox.position.copy(intersect.point).add(intersect.face?.normal!)
            shadowBox.position.divideScalar(10).floor().multiplyScalar(10).addScalar(5)
            if (e.shiftKey) {
                shadowBox.visible = false
            } else {
                shadowBox.visible = true
            }
        }
    })

    container.value?.addEventListener('pointerdown', function (e) {
        if (e.button != 0) {
            return
        }
        pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)

        raycaster.setFromCamera(pointer, engine.getCamera())
        const intersects = raycaster.intersectObjects(objects, false)
        // console.log(intersects)

        if (intersects.length > 0) {
            const intersect = intersects[0]

            if (e.shiftKey && intersect.object.name != 'plane') {
                engine.getScene().remove(intersect.object)
                objects.splice(
                    objects.findIndex((item) => item.uuid == intersect.object.uuid),
                    1
                )
            } else if (!e.shiftKey) {
                const box = new THREE.Mesh(boxGeometry, boxMaterial)
                box.position.copy(intersect.point).add(intersect.face?.normal!)
                box.position.divideScalar(10).floor().multiplyScalar(10).addScalar(5)
                engine.addObjects([box])
                objects.push(box)
            }
        }
    })
})
</script>
<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100vh;
}
</style>
