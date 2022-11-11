import { Chunk, ChunkFactory } from './chunk'
import { TerrainGenerator } from './generator'

class Terrain {
    chunks: Map<string, Chunk>
    generator: TerrainGenerator
    chunkFactory: ChunkFactory
    renderDistance: number

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

    render(x: number, z: number, force = false) {
        console.log(x, z)

        // // generate chunks
        // for (let i = -this.renderDistance - 1; i <= this.renderDistance; i++) {
        //     for (let j = -this.renderDistance - 1; j <= this.renderDistance; j++) {
        //         if (this.getChunk(x + i, z + j)) continue
        //         this.createChunk(x + i, z + j)
        //     }
        // }
        // // set neighbors & build
        // for (let i = -this.renderDistance; i < this.renderDistance; i++) {
        //     for (let j = -this.renderDistance; j < this.renderDistance; j++) {
        //         const chunk = this.getChunk(i, j)
        //         if (chunk?.meshes.length == 0 || force) {
        //             chunk?.setNeigbors(
        //                 this.getChunk(x + i, z + j + 1),
        //                 this.getChunk(x + i, z + j - 1),
        //                 this.getChunk(x + i + 1, z + j),
        //                 this.getChunk(x + i - 1, z + j)
        //             )
        //             requestIdleCallback(() => chunk?.build())
        //         }
        //     }
        // }
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

export { Terrain }
