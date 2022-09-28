import * as THREE from 'three'

export interface RendererConfig {
    width: number
    height: number
}
/**
 *
 * @param config  默认使用width：window.innerWidth ，height： window.innerHeight
 * @returns
 */
export function initWebGLRenderer(config: RendererConfig) {
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
    })
    renderer.setSize(config.width, config.height)
    // renderer.outputEncoding = THREE.sRGBEncoding //防止模型过暗
    return renderer
}
