import { physicsWorld } from '../global'
import { Chunk, ChunkFactory } from './chunk'
import { TerrainGenerator } from './generator'
import * as CANNON from 'cannon-es'
import { WorldCollider } from './collider'

class Terrain {
    public chunks: Map<string, Chunk>
    public generator: TerrainGenerator
    public chunkFactory: ChunkFactory
    public renderDistance: number

    private colliders: WorldCollider[] = []

    constructor(chunkFactory: ChunkFactory, seed: number = 69420, renderDistance = 16) {
        const generator = new TerrainGenerator(seed)
        this.generator = generator
        this.chunkFactory = chunkFactory
        this.chunks = new Map()
        this.renderDistance = renderDistance
    }

    createChunk(x: number, z: number) {
        if (this.getChunk(x, z)) return
        const chunk = this.chunkFactory.createChunk(x, z)
        this.chunks.set(Terrain.key(x, z), chunk)

        this.generator.generate(chunk)

        return chunk
    }

    getChunkFromBlock(x: number, z: number) {
        return this.getChunk(Math.floor(x / 16), Math.floor(z / 16))
    }

    getChunk(x: number, z: number) {
        return this.chunks.get(Terrain.key(x, z))
    }

    setBlock(x: number, y: number, z: number, block: number, update: boolean) {
        const chunkX = Math.floor(x / 16)
        const chunkZ = Math.floor(z / 16)
        const chunk = this.getChunk(chunkX, chunkZ)
        if (chunk?.get(x % 16, y, z % 16) != block) {
            if (!update) chunk?.set(x % 16, y, z % 16, block)
            else chunk?.update(x % 16, y, z % 16, block)
            return chunk
        }
    }

    getBlock(x: number, y: number, z: number) {
        ;[x, y, z] = [x, y, z].map(Math.floor)

        const chunkX = Math.floor(x / 16)
        const chunkZ = Math.floor(z / 16)
        const chunk = this.getChunk(chunkX, chunkZ)
        return chunk?.get(x % 16, y, z % 16)
    }

    getCollider(x: number, y: number, z: number) {
        ;[x, y, z] = [x, y, z].map(Math.floor)

        let colliders: CANNON.Body[] = []

        const chunkX = Math.floor(x / 16)
        const chunkZ = Math.floor(z / 16)
        const chunk = this.getChunk(chunkX, chunkZ)
        const collider = chunk?.getCollider(x % 16, y, z % 16, 5)
        if (collider) colliders.push(...collider)

        return colliders
    }

    updateCollider(x: number, y: number, z: number) {
        const colliders = this.getCollider(x, y, z)

        if (!colliders) return
        for (const collider of colliders) {
            physicsWorld.addBody(collider)
        }
    }

    render(x: number, z: number, force = false) {
        // TODO: render chunks in a circle
        console.log(x, z)

        for (let i = -1; i <= this.renderDistance; i++) {
            for (let j = -1; j <= this.renderDistance; j++) {
                this.createChunk(i, j)
            }
        }

        for (let i = 0; i < this.renderDistance; i++) {
            for (let j = 0; j < this.renderDistance; j++) {
                const chunk = this.getChunk(i, j)
                chunk?.setNeigbors(
                    this.getChunk(i, j + 1),
                    this.getChunk(i, j - 1),
                    this.getChunk(i + 1, j),
                    this.getChunk(i - 1, j)
                )
                requestIdleCallback(() => chunk?.build())
            }
        }
    }

    static key(x: number, z: number) {
        return `${x}:${z}`
    }
}

export { Terrain, WorldCollider }
