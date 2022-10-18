import { Camera, Object3D, Raycaster, Vector2, Vector3 } from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { blockIDLookup } from '../blocks/blocks'
import { Terrain } from '../world/terrain'
import { Outline } from './blockOutline'

class PlayerController {
    private terrain: Terrain
    private pressedKeys: Record<string, boolean>
    private raycaster: Raycaster
    width: number
    length: number
    height: number
    movementSpeed: number
    camera: Camera
    controls: PointerLockControls
    chunkGroup: any
    velocity: Vector3
    outline: Outline
    constructor(camera: Camera, terrain: Terrain, chunkGroup: Object3D, outline: Outline) {
        this.terrain = terrain
        this.width = 0.6
        this.length = 0.6
        this.height = 1.8
        this.movementSpeed = 10
        this.pressedKeys = {}
        this.camera = camera
        this.velocity = new Vector3(0, 0, 0)
        this.controls = new PointerLockControls(camera, document.body)
        document.body.addEventListener('click', () => this.controls.lock())
        this.raycaster = new Raycaster()
        this.chunkGroup = chunkGroup
        this.outline = outline

        // place player
        while (true) {
            const { x, y, z } = new Vector3().copy(camera.position).addScalar(0.5).floor()
            if (terrain.getBlock(x, y, z) == 0) {
                camera.position.y -= 1
            } else {
                camera.position.set(x, y + 2.3, z)
                break
            }
        }
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

        const position = this.castRay(true)
        if (position) {
            const { x, y, z } = position
            this.outline.moveTo(x, y, z)
        } else this.outline.moveOut()
    }

    testCollision(dx: number, dy: number, dz: number) {
        return false
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
        const block = blockIDLookup.get('glass')
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
