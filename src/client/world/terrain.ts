import { Chunk, ChunkFactory } from './chunk'
import { TerrainGenerator } from './generator'

class Terrain {
    chunks: Map<string, Chunk>
    generator: TerrainGenerator
    chunkFactory: ChunkFactory

    constructor(chunkFactory: ChunkFactory, seed: number = 69420) {
        const generator = new TerrainGenerator(seed)
        this.generator = generator
        this.chunkFactory = chunkFactory
        this.chunks = new Map()
    }

    createChunk(x: number, z: number) {
        if (this.getChunk(x, z)) return
        const chunk = this.chunkFactory.createChunk(x, z)
        this.chunks.set(Terrain.key(x, z), chunk)

        this.generator.generate(chunk)

        return chunk
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
