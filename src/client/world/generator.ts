import alea from 'alea'
import { createNoise2D, NoiseFunction2D } from 'simplex-noise'
import { blockIDLookup } from '../blocks/blocks'
import { Chunk } from './chunk'

class TerrainGenerator {
    seed: number
    noise: NoiseFunction2D
    hilliness = 10
    spread = 64
    minHeight = 60
    seaLevel = 65

    constructor(seed: number = 69420) {
        this.seed = seed
        this.noise = createNoise2D(alea(seed))
    }

    createHeightMap(originX: number, originZ: number, width: number, height: number) {
        const heights = []

        for (let i = 0; i < width; i++) {
            const row = []
            for (let j = 0; j < height; j++) {
                let value = this.noise((originX + i) / this.spread, (originZ + j) / this.spread)
                value = (value + 1) * this.hilliness
                value += this.minHeight
                row.push(value)
            }
            heights.push(row)
        }

        return heights
    }

    generate(chunk: Chunk) {
        const heights = this.createHeightMap(chunk.x * 16, chunk.z * 16, 16, 16)
        for (let x = 0; x < 16; x++) {
            for (let z = 0; z < 16; z++) {
                const height = Math.floor(heights[x][z])
                for (let y = 0; y < height; y++) {
                    let block = blockIDLookup.get('stone')

                    if (y == height - 1 && y > this.seaLevel)
                        block = blockIDLookup.get('grass_block')
                    else if (y == height - 1 && y <= this.seaLevel)
                        block = blockIDLookup.get('sand')
                    else if (y >= height - 5) block = blockIDLookup.get('dirt')
                    else if (y == 0) block = blockIDLookup.get('bedrock')

                    const sy = Math.floor(y / 16)
                    const index = 16 * 16 * z + 16 * (y % 16) + x
                    chunk.subchunks[sy] ||= Array(4096).fill(0)
                    chunk.subchunks[sy][index] = block
                }

                // add water
                for (let y = height; y <= this.seaLevel; y++) {
                    const sy = Math.floor(y / 16)
                    const index = 16 * 16 * z + 16 * (y % 16) + x
                    chunk.subchunks[sy] ||= Array(4096).fill(0)
                    chunk.subchunks[sy][index] = blockIDLookup.get('water')
                }
            }
        }
    }
}

export { TerrainGenerator }
