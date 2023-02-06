import { physicsWorld } from '../global'
import { Terrain } from './terrain'
import * as CANNON from 'cannon-es'

class WorldCollider {
    public radius: number

    private terrain: Terrain
    private position: CANNON.Vec3 = new CANNON.Vec3()
    private bodies: CANNON.Body[] = []

    constructor(terrain: Terrain, x: number, y: number, z: number, radius: number) {
        this.terrain = terrain
        this.radius = radius
        this.move(x, y, z)
        this.bodies = []
    }

    move(x: number, y: number, z: number) {
        this.position.set(x, y, z)
        this.update()
    }

    update() {
        // this.bodies.forEach((body) => physicsWorld.removeBody(body))
        this.bodies = []

        const { x, y, z } = this.position

        const chunk = this.terrain.getChunkFromBlock(x, z)
        if (!chunk) return

        chunk.getCollider(x, y, z, 5).forEach((body) => {
            physicsWorld.addBody(body)

            this.bodies.push(body)
        })
    }

    destroy() {
        this.bodies.forEach((body) => physicsWorld.removeBody(body))
        this.bodies = []
    }
}

export { WorldCollider }
