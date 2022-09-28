import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBEloader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as ThreeUtil from './util'
import { MOUSE, Object3D } from 'three'

export interface TEngineConfig {
    cameraConfig: ThreeUtil.CameraConfig
}
export class TEngine {
    dom: HTMLElement
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    controls: OrbitControls

    constructor(dom: HTMLElement, config?: TEngineConfig) {
        this.dom = dom

        this.scene = new THREE.Scene()
        this.camera = ThreeUtil.initCamera(Object.assign({ aspect: dom.offsetWidth / dom.offsetHeight }, config?.cameraConfig))
        this.scene.add(this.camera)

        let width = dom.offsetWidth
        let height = dom.offsetHeight
        this.renderer = ThreeUtil.initWebGLRenderer({ width, height })
        // this.renderer.physicallyCorrectLights = true
        this.renderer.shadowMap.enabled = true
        // this.renderer.setClearColor(0xffffff, 1)
        // this.renderer.outputEncoding = THREE.sRGBEncoding //防止模型过暗
        this.renderer.setAnimationLoop(this.render.bind(this))
        this.dom.appendChild(this.renderer.domElement)

        this.controls = ThreeUtil.initOrbitControls(this.camera, this.renderer.domElement)
        // this.controls.autoRotate = true //自动旋转
        this.controls.mouseButtons = {
            LEFT: null as unknown as MOUSE, //释放鼠标左键
            MIDDLE: MOUSE.DOLLY, //缩放
            RIGHT: MOUSE.ROTATE, //使用鼠标右键 旋转视角，按住ctrl+右键 平移视角
        }
        // window.addEventListener('resize', windowResizeCb)
    }
    initBasicScene() {
        this.addAxesHelper()
        this.addAmbientLight()
        this.addPointLight()
        // this.addDirectionalLight()
    }
    renderListener?: Function
    addRenderListener(listener: Function) {
        this.renderListener = listener
    }
    getScene() {
        return this.scene
    }
    getCamera() {
        return this.camera
    }
    render() {
        this.controls.update()
        this.renderer.render(this.scene, this.camera)

        if (!!this.renderListener) {
            this.renderListener()
        }
    }

    addAxesHelper() {
        const axesHelper = new THREE.AxesHelper(100)
        this.scene.add(axesHelper)
        return axesHelper
    }

    addGridHelper(size?: number, divisions?: number, color1?: THREE.ColorRepresentation, color2?: THREE.ColorRepresentation) {
        const gridHelper = new THREE.GridHelper(size || 400, divisions || 40, color1 || 0x999999, color2 || 0x999999)
        this.scene.add(gridHelper)
        return gridHelper
    }

    addAmbientLight() {
        const ambient = new THREE.AmbientLight(0x444444)
        this.scene.add(ambient)
        return ambient
    }

    addPointLight() {
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 500)
        pointLight.position.set(-100, 50, 0)
        pointLight.castShadow = true
        this.scene.add(pointLight)
        const pointLightHelper = new THREE.PointLightHelper(pointLight, 5, 0xff0000)
        this.scene.add(pointLightHelper)
    }

    addDirectionalLight() {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
        directionalLight.position.set(100, 100, 100)
        directionalLight.target = this.scene
        this.scene.add(directionalLight)
    }

    addObjects(objects: Object3D[]) {
        objects.forEach((item) => {
            this.scene.add(item)
        })
    }
}
