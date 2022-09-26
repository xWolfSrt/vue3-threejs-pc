import * as THREE from 'three'

export interface CameraConfig {
    fov?: number
    aspect?: number
    near?: number
    far?: number
    position?: THREE.Vector3
    lookAt?: THREE.Vector3
}
/**
 * 默认使用参数
 * position：(0,0,0)，
 * fov：75，
 * aspect：window.innerWidth / window.innerHeight，
 * near：1，
 * far：1000
 * lookAt：(0,0,0)，
 * @param config
 * @returns
 */
export function initCamera(config?: CameraConfig) {
    const camera = new THREE.PerspectiveCamera(config?.fov || 75, config?.aspect || 1, config?.near || 1, config?.far || 1000)
    if (config?.position) {
        camera.position.set(config.position.x, config.position.y, config.position.z)
    } else {
        camera.position.set(100, 100, 100)
    }
    if (config?.lookAt) {
        camera.lookAt(config.lookAt)
    } else {
        camera.lookAt(0, 0, 0)
    }
    return camera
}

// export default {
//     initCamera,
// }
