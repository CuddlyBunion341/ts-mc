import { BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { Chunk } from '../world/chunk'
import { Entity } from './entity'

class FallingBlock extends Entity {
    private x: number
    private z: number

    entityID: number = Entity.count++
    static acceleration = 20
    itemID: number
    chunk: Chunk
    constructor(x: number, y: number, z: number, chunk: Chunk, itemID: number = 1) {
        super('falling_block')
        this.x = x
        this.z = z
        this.position = new Vector3(x + chunk.x * 16, y, z + chunk.z * 16)
        this.velocity = new Vector3(0, 0, 0)
        this.itemID = itemID
        this.chunk = chunk
        this.mesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0xff0000 }))
        this.mesh.position.set(x, y, z)
    }

    update(delta: number) {
        if (!this.alive) return

        this.velocity.y -= FallingBlock.acceleration * delta
        this.position.add(new Vector3().copy(this.velocity).multiplyScalar(delta))
        const { x, z } = this
        const y = this.position.y | 0

        if (this.chunk.get(x, y, z)) {
            this.chunk.update(x, y + 1, z, this.itemID)
            return this.kill()
        }

        this.mesh?.position.copy(this.position)
    }
}

export { FallingBlock }
