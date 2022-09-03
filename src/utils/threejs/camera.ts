import * as THREE from 'three'

interface CameraConfig {
    fov?: number
    aspect?: number
    near?: number
    far?: number
    position?: THREE.Vector3
}
const initCamera = (config?: CameraConfig) => {
    const camera = new THREE.PerspectiveCamera(
        config?.fov || 75,
        config?.aspect || window.innerWidth / window.innerHeight,
        config?.near || 1,
        config?.far || 1000
    )
    if (config?.position) {
        camera.position.set(config.position.x, config.position.y, config.position.z)
    } else {
        camera.position.set(0, 0, 0)
    }
    return camera
}

export default {
    initCamera,
}
