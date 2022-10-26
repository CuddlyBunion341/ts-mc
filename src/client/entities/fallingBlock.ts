import { Vector3 } from 'three'
import { Chunk } from '../world/chunk'
import { Entity } from './entity'

class FallingBlock extends Entity {
    entityID: number = Entity.count++
    static acceleration = 0.4
    itemID: number
    chunk: Chunk
    constructor(x: number, y: number, z: number, chunk: Chunk, itemID: number = 1) {
        super('falling_block')
        this.position = new Vector3(x, y, z)
        this.velocity = new Vector3(0, 0, 0)
        this.itemID = itemID
        this.chunk = chunk
    }

    update(delta: number) {
        if (!this.alive) return

        this.velocity.y -= FallingBlock.acceleration * delta
        this.position.add(this.velocity.clone().multiplyScalar(delta))
        const { x, y, z } = this.position

        if (this.chunk.get(x, y, z)) {
            this.chunk.update(x, y - 1, z, this.itemID)
            this.kill()
        }
    }
}

export { FallingBlock }
