import alea from 'alea'
import { createNoise2D, NoiseFunction2D } from 'simplex-noise'
import { blockIDs } from '../blocks/blocks'
import { Chunk } from './chunk'

function fractalNoise2D(
    noise: NoiseFunction2D,
    x: number,
    y: number,
    octaves: number,
    lacunarity: number,
    persistence: number
) {
    let value = 0
    let p = 1
    let l = 1
    for (let i = 0; i < octaves; i++) {
        value += noise(x * l, y * l) * p
        l *= lacunarity
        p *= persistence
    }
    return value
}

function createFractalNoise2D(
    noise: NoiseFunction2D,
    octaves = 2,
    lacunarity = 2,
    persistence = 0.5
): NoiseFunction2D {
    return function (x: number, y: number) {
        return fractalNoise2D(noise, x, y, octaves, lacunarity, persistence)
    }
}

class TerrainGenerator {
    seed: number
    noise: NoiseFunction2D
    hilliness = 10
    spread = 64
    minHeight = 65
    seaLevel = 65

    constructor(seed: number = 69420) {
        this.seed = seed
        this.noise = createNoise2D(alea(seed))
        this.noise = createFractalNoise2D(this.noise)
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
                    let block = blockIDs.get('stone')

                    if (y == height - 1 && y > this.seaLevel) block = blockIDs.get('grass_block')
                    else if (y == height - 1 && y <= this.seaLevel) block = blockIDs.get('sand')
                    else if (y >= height - 5) block = blockIDs.get('dirt')
                    else if (y == 0) block = blockIDs.get('bedrock')

                    chunk.set(x, y, z, block)

                    // add water
                    for (let y = height; y <= this.seaLevel; y++) {
                        chunk.set(x, y, z, blockIDs.get('water'))
                    }

                    // spawn tree
                    if (block == blockIDs.get('grass_block') && Math.random() < 0.01) {
                        if (x % 16 < 2 || z % 16 < 2 || x % 16 > 13 || z % 16 > 13) continue
                        // trunk
                        const trunkSize = Math.floor(Math.random() * 3 + 5)
                        for (let t = 0; t < trunkSize; t++) {
                            chunk.set(x, y + t, z, blockIDs.get('oak_log'))
                        }
                        // bush
                        for (let t = 0; t < 2; t++) {
                            for (let i = -2; i <= 2; i++) {
                                for (let j = -2; j <= 2; j++) {
                                    if (i == 0 && j == 0) continue
                                    chunk.set(
                                        x + i,
                                        y + trunkSize - 3 + t,
                                        z + j,
                                        blockIDs.get('oak_leaves')
                                    )
                                }
                            }

                            for (let i = -1; i <= 1; i++) {
                                for (let j = -1; j <= 1; j++) {
                                    if (i == 0 && j == 0 && t != 1) continue
                                    chunk.set(
                                        x + i,
                                        y + trunkSize - 1 + t,
                                        z + j,
                                        blockIDs.get('oak_leaves')
                                    )
                                }
                            }
                        }
                        // remove corner blocks
                        chunk.set(x + 1, y + trunkSize, z + 1, 0)
                        chunk.set(x - 1, y + trunkSize, z + 1, 0)
                        chunk.set(x + 1, y + trunkSize, z - 1, 0)
                        chunk.set(x - 1, y + trunkSize, z - 1, 0)
                    }
                }
            }
        }
    }
}

export { TerrainGenerator }
