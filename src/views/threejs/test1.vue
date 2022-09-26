<template>
    <div class="container" ref="container"></div>
</template>
<script setup lang="ts">
import { ref, reactive, getCurrentInstance, ComponentInternalInstance, onMounted } from 'vue'
import { TEngine } from '../../utils/threejs/TEngine'
import * as THREE from 'three'
const { proxy } = getCurrentInstance() as ComponentInternalInstance

const container = ref<HTMLElement | null>(null)

onMounted(() => {
    const engine = new TEngine(container.value!, {
        cameraConfig: {
            position: new THREE.Vector3(100, 100, 50),
        },
    })
    engine.addAmbientLight()
    engine.addAxesHelper()
    engine.addPointLight()

    const planeGeometry = new THREE.PlaneGeometry(200, 200)
    const planeMaterial = new THREE.MeshStandardMaterial({
        color: 0xcecece,
        roughness: 0,
        side: THREE.DoubleSide,
    })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.position.set(0, -0.01, 0)
    plane.receiveShadow = true
    plane.rotateX((Math.PI / 180) * 90)

    const boxGeometry = new THREE.BoxGeometry(30, 30, 30)
    const boxMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        roughness: 0.3,
        metalness: 1,
    })
    const box = new THREE.Mesh(boxGeometry, boxMaterial)
    box.position.set(0, 15, 0)
    box.castShadow = true

    engine.addObjects([plane, box])
})
</script>
<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100vh;
}
</style>
