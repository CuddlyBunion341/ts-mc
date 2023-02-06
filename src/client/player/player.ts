import { Camera } from 'three'
import { PlayerController } from './playerController'
import { PlayerEntity } from './playerEntity'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'

class Player {
    private camera: Camera
    private playerController: PlayerController
    private pointerController: PointerLockControls
    private entity: PlayerEntity
    private cameraOffset: number = 1.5
    private elapsedTime: number = 0

    constructor(camera: Camera) {
        this.camera = camera
        this.entity = new PlayerEntity()
        this.playerController = new PlayerController(this.entity, camera)
        this.pointerController = new PointerLockControls(camera, document.body)
    }

    update(delta: number) {
        this.playerController.update(delta)
        this.entity.update(delta)

        this.camera.position.copy(this.entity.position)
        this.camera.position.y += this.cameraOffset
        this.camera.translateZ(5)
    }
}

export { Player }
