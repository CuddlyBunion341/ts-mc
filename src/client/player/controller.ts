import { Camera, Object3D, Raycaster, Vector2, Vector3 } from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { blockIDLookup } from '../blocks/blocks'
import { Terrain } from '../world/terrain'

class PlayerController {
    terrain: Terrain
    width: number
    length: number
    height: number
    pressedKeys: Record<string, boolean>
    movementSpeed: number
    camera: Camera
    controls: PointerLockControls
    raycaster: Raycaster
    chunkGroup: any
    constructor(camera: Camera, terrain: Terrain, chunkGroup: Object3D) {
        this.terrain = terrain
        this.width = 0.6
        this.length = 0.6
        this.height = 1.8
        this.movementSpeed = 20
        this.pressedKeys = {}
        this.camera = camera
        this.controls = new PointerLockControls(camera, document.body)
        document.body.addEventListener('click', () => this.controls.lock())
        this.raycaster = new Raycaster()
        this.chunkGroup = chunkGroup
    }

    onMouseDown(e: MouseEvent) {
        if (e.button == 2) this.placeBlock()
        else this.breakBlock()
    }
    onMouseUp(e: MouseEvent) {}
    onKeyDown(e: KeyboardEvent) {
        this.pressedKeys[e.code] = true
    }
    onKeyUp(e: KeyboardEvent) {
        this.pressedKeys[e.code] = false
    }

    update(delta: number) {
        if (this.pressedKeys['KeyW']) this.controls.moveForward(delta * this.movementSpeed)
        if (this.pressedKeys['KeyS']) this.controls.moveForward(delta * -this.movementSpeed)
        if (this.pressedKeys['KeyD']) this.controls.moveRight(delta * this.movementSpeed)
        if (this.pressedKeys['KeyA']) this.controls.moveRight(delta * -this.movementSpeed)
        if (this.pressedKeys['Space']) this.camera.position.y += delta * this.movementSpeed
        if (this.pressedKeys['ShiftLeft']) this.camera.position.y -= delta * this.movementSpeed
    }

    castRay(inside = true) {
        this.raycaster.setFromCamera(new Vector2(0, 0), this.camera)
        const intersect = this.raycaster.intersectObjects(this.chunkGroup.children)[0]
        if (intersect?.face) {
            const norm = intersect.face.normal.divideScalar(2).multiplyScalar(inside ? -1 : 1)
            return new Vector3().copy(intersect.point).add(norm).addScalar(0.5).floor()
        }
    }

    placeBlock() {
        const pos = this.castRay(false)
        if (!pos) return
        const { x, y, z } = pos
        const block = blockIDLookup.get('stone')
        this.terrain.setBlock(x, y, z, block, true)
    }
    breakBlock() {
        const pos = this.castRay(true)
        if (!pos) return
        const { x, y, z } = pos
        this.terrain.setBlock(x, y, z, 0, true)
    }
}

export { PlayerController }
