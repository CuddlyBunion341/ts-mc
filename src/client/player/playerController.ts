import { Camera, Vector3 } from 'three'
import { PlayerEntity } from './playerEntity'
import { InputController } from './inputController'
import { vector3ToVec3 } from '../misc/vectors'

class PlayerController {
    private input: InputController
    private entity: PlayerEntity
    private camera: Camera

    constructor(playerEntity: PlayerEntity, camera: Camera) {
        this.input = new InputController()
        this.entity = playerEntity
        this.camera = camera

        this.input.on('keyDown', (e) => {
            const key = e.code
            // TODO: Slots
        })
    }

    update(delta: number) {
        this.input.update()

        const rotVec = new Vector3()
        this.camera.getWorldDirection(rotVec)
        this.entity.rotation = vector3ToVec3(rotVec)

        this.entity.rotation.y = 0
        this.entity.rotation.normalize()

        if (this.input.isKeyDown('KeyW')) this.entity.moveForward(delta)
        if (this.input.isKeyDown('KeyS')) this.entity.moveBackward(delta)
        if (this.input.isKeyDown('KeyA')) this.entity.moveLeft(delta)
        if (this.input.isKeyDown('KeyD')) this.entity.moveRight(delta)
        if (this.input.isKeyDown('Space')) this.entity.jump()
    }
}

export { PlayerController }
