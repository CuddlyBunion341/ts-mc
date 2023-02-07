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
        ;[x, y, z] = [x, y, z].map(Math.floor)
        this.position.set(x, y, z)
        this.update()
    }

    update() {
        this.destroy()

        const { x, y, z } = this.position
        const [_x, _y, _z] = [x, y, z].map(Math.floor)

        const chunk = this.terrain.getChunkFromBlock(_x, _z)
        if (!chunk) return

        const bodies = chunk.getCollider(_x % 16, _y, _z % 16, this.radius)

        for (const body of bodies) {
            physicsWorld.addBody(body)
            this.bodies.push(body)
        }
    }

    get size() {
        return this.bodies.length
    }

    destroy() {
        this.bodies.forEach((body) => physicsWorld.removeBody(body))
        this.bodies = []
    }
}

export { WorldCollider }
