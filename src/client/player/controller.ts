import { Camera } from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
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
    constructor(terrain: Terrain, camera: Camera) {
        this.terrain = terrain
        this.width = 0.6
        this.length = 0.6
        this.height = 1.8
        this.movementSpeed = 20
        this.pressedKeys = {}
        this.camera = camera
        this.controls = new PointerLockControls(camera, document.body)
        document.body.addEventListener('click', () => this.controls.lock())
    }

    onMouseDown(e: MouseEvent) {}
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

    castRay() {}
    placeBlock() {}
    breakBlock() {}
}

export { PlayerController }
