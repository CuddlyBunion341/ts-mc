import { BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { Entity } from '../entities/entity'
import * as CANNON from 'cannon-es'
import { physicsWorld, terrain } from '../global'
import { WorldCollider } from '../world/collider'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

class PlayerEntity extends Entity {
    public flying = true
    public rotation: CANNON.Vec3 = new CANNON.Vec3()

    private size: CANNON.Vec3 = new CANNON.Vec3(0.3, 0.9, 0.3)
    private movementSpeed = 5
    private canJump = true
    private body: CANNON.Body
    private collider: WorldCollider
    private lastBlockPosition: CANNON.Vec3 = new CANNON.Vec3()
    private lastPosition: CANNON.Vec3 = new CANNON.Vec3()

    constructor() {
        super('Player')

        // mesh
        this.mesh = new Mesh(
            new BoxGeometry(0.3, 0.9, 0.3),
            new MeshBasicMaterial({ color: 0x00ff00 })
        )

        this.body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(80, 77, 80),
            shape: new CANNON.Box(this.size),
            fixedRotation: true,
        })

        physicsWorld.addBody(this.body)

        const { x, y, z } = this.body.position
        this.collider = new WorldCollider(terrain, x, y, z, 4)
    }

    moveForward(delta: number) {
        // get direction vector
        const direction = new CANNON.Vec3()
        direction.copy(this.rotation)

        // move player forward
        this.body.velocity.x -= Math.sin(direction.y) * this.movementSpeed * delta
        this.body.velocity.z -= Math.cos(direction.y) * this.movementSpeed * delta
    }

    moveBackward(delta: number) {
        this.moveForward(-delta)
    }

    moveRight(delta: number) {
        // get direction vector
        const direction = new CANNON.Vec3()
        direction.copy(this.rotation)

        // move player forward
        this.body.velocity.x += Math.sin(direction.y + Math.PI / 2) * this.movementSpeed * delta
        this.body.velocity.z += Math.cos(direction.y + Math.PI / 2) * this.movementSpeed * delta
    }

    moveLeft(delta: number) {
        this.moveRight(-delta)
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

    get velocity() {
        return this.body.velocity
    }

    set velocity(velocity: CANNON.Vec3) {
        this.body.velocity.set(velocity.x, velocity.y, velocity.z)
    }

    get position() {
        return this.body.position
    }

    set position(position: CANNON.Vec3) {
        this.body.position.copy(position)
    }

    update(delta: number) {
        super.update(delta)

        this.body.velocity.x *= 0.9 ** delta
        this.body.velocity.z *= 0.9 ** delta

        this.position.set(this.body.position.x, this.body.position.y, this.body.position.z)
        this.velocity.set(this.body.velocity.x, this.body.velocity.y, this.body.velocity.z)

        if (this.position.distanceTo(this.lastBlockPosition) > 1) {
            this.collider.move(this.position.x, this.position.y, this.position.z)
            this.lastBlockPosition.copy(this.position)
        }

        if (Math.abs(this.position.y - this.lastPosition.y) < 0.01) {
            this.canJump = true
        }

        this.lastPosition.copy(this.position)
    }
}

export { PlayerEntity }
