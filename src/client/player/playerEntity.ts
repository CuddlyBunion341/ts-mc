import { BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { Entity } from '../entities/entity'
import * as CANNON from 'cannon-es'
import { physicsWorld, terrain } from '../global'
import { WorldCollider } from '../world/collider'

class PlayerEntity extends Entity {
    public flying = true
    public rotation: Vector3 = new Vector3()
    // public inventory: number[] = []

    private size: CANNON.Vec3 = new CANNON.Vec3(0.3, 0.9, 0.3)
    private movementSpeed = 10
    private canJump = true
    private body: CANNON.Body
    private collider: WorldCollider

    private lastPosition: Vector3 = new Vector3()

    constructor() {
        super('Player')

        // mesh
        this.mesh = new Mesh(
            new BoxGeometry(0.3, 0.9, 0.3),
            new MeshBasicMaterial({ color: 0x00ff00 })
        )

        this.body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(80, 100, 80),
            shape: new CANNON.Box(this.size),
        })
        physicsWorld.addBody(this.body)

        const { x, y, z } = this.body.position
        this.collider = new WorldCollider(terrain, x, y, z, 3)
    }

    moveForward(delta: number) {
        const { x, z } = this.rotation
        this.body.velocity.x = x * this.movementSpeed * delta
        this.body.velocity.z = z * this.movementSpeed * delta
    }

    moveBackward(delta: number) {
        const { x, z } = this.rotation
        this.body.velocity.x = -x * this.movementSpeed * delta
        this.body.velocity.z = -z * this.movementSpeed * delta
    }

    moveLeft(delta: number) {
        const { x, z } = this.rotation
        this.body.velocity.x = -z * this.movementSpeed * delta
        this.body.velocity.z = x * this.movementSpeed * delta
    }

    moveRight(delta: number) {
        const { x, z } = this.rotation
        this.body.velocity.x = z * this.movementSpeed * delta
        this.body.velocity.z = -x * this.movementSpeed * delta
    }

    jump() {
        if (this.canJump) {
            this.body.velocity.y = 10
            this.canJump = false
        }
    }

    kill() {
        super.kill()
        // TODO: drop all items
    }

    update(delta: number) {
        super.update(delta)

        this.body.velocity.x *= 0.9 ** delta
        this.body.velocity.z *= 0.9 ** delta

        this.position.set(this.body.position.x, this.body.position.y, this.body.position.z)
        this.velocity.set(this.body.velocity.x, this.body.velocity.y, this.body.velocity.z)

        if (this.position.distanceTo(this.lastPosition) > 1) {
            this.collider.move(this.position.x, this.position.y, this.position.z)
            console.log('moved', this.position)
        }

        this.lastPosition.copy(this.position)
    }
}

export { PlayerEntity }
