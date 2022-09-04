import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export interface ControlsConfig {
    disableDamping?: boolean
}
/**
 *
 * @param config  默认使用 enableDamping：true
 * @returns
 */
export function initOrbitControls(camera: THREE.Camera, domElement?: HTMLElement, config?: ControlsConfig) {
    const controls = new OrbitControls(camera, domElement)
    controls.enableDamping = config?.disableDamping ? false : true
    return controls
}
