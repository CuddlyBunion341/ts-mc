import { Chunk } from './chunk'
import { TerrainGenerator } from './generator'

class Terrain {
    chunks: Map<string, Chunk>

    constructor(seed: number = 69420) {
        const generator = new TerrainGenerator(seed)
        Chunk.generator = generator
        this.chunks = new Map()
    }

    createChunk(x: number, z: number) {
        if (this.getChunk(x, z)) return
        const chunk = new Chunk(x, z)
        this.chunks.set(Terrain.key(x, z), chunk)

        return chunk
    }

    getChunk(x: number, z: number) {
        return this.chunks.get(Terrain.key(x, z))
    }

    setBlock(x: number, y: number, z: number, block: number) {
        const chunkX = Math.floor(x / 16)
        const chunkZ = Math.floor(z / 16)
        const chunk = this.getChunk(chunkX, chunkZ)
        if (chunk?.get(x % 16, y, z % 16) != block) {
            chunk?.set(x % 16, y, z % 16, block)
            chunk?.build()
            return true
        }
    }

    getBlock(x: number, y: number, z: number) {
        const chunkX = Math.floor(x / 16)
        const chunkZ = Math.floor(z / 16)
        const chunk = this.getChunk(chunkX, chunkZ)
        return chunk?.get(x % 16, y, z % 16)
    }

    static key(x: number, z: number) {
        return `${x}:${z}`
    }
}

export { Terrain }
