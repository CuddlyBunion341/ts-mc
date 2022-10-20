import { BufferAttribute, BufferGeometry, Group, Material, Mesh } from 'three'
import { AtlasRanges } from '../blocks/atlas'
import { blockNameLookup, blocks, blockTexturesLookup } from '../blocks/blocks'
import { getGeometryData } from './builder'
import { TerrainGenerator } from './generator'

class Chunk {
    x: number
    z: number
    subchunks: number[][]
    meshes: Mesh[]
    neighbors!: Chunk[]
    isModified: boolean

    static parentGroup: Group
    static material: Material
    static material2: Material
    static generator: TerrainGenerator
    static atlasRanges: AtlasRanges

    constructor(x: number, z: number) {
        this.x = x
        this.z = z
        this.subchunks = Array(16)
        this.meshes = []
        this.isModified = false

        Chunk.generator.generate(this)
    }

    get(x: number, y: number, z: number): number {
        if (y < 0 || y > 255) return 0
        if (x == -1) return this.neighbors[3].get(16 + x, y, z)
        if (x == 16) return this.neighbors[2].get(16 - x, y, z)
        if (z == -1) return this.neighbors[1].get(x, y, 16 + z)
        if (z == 16) return this.neighbors[0].get(x, y, 16 - z)

        const sy = Math.floor(y / 16)
        if (!this.subchunks[sy]) return 0
        const index = 16 * 16 * z + 16 * (y % 16) + x
        return this.subchunks[sy][index]
    }

    set(x: number, y: number, z: number, block: number) {
        const sy = Math.floor(y / 16)
        this.subchunks[sy] ||= Array(4096).fill(0)
        const index = 16 * 16 * z + 16 * (y % 16) + x
        this.subchunks[sy][index] = block
    }

    update(x: number, y: number, z: number, block: number) {
        if (this.get(x, y, z) == block) return
        this.set(x, y, z, block)
        this.isModified = true
        if (x == 0) this.neighbors[3].build()
        if (z == 0) this.neighbors[1].build()
        if (x == 15) this.neighbors[2].build()
        if (z == 15) this.neighbors[0].build()
        this.build()
    }

    setNeigbors(north?: Chunk, south?: Chunk, east?: Chunk, west?: Chunk) {
        const neighbors = []
        if (north) neighbors.push(north)
        if (south) neighbors.push(south)
        if (east) neighbors.push(east)
        if (west) neighbors.push(west)
        this.neighbors = neighbors
    }

    build() {
        this.dispose()

        const positions: number[] = []
        const normals: number[] = []
        const colors: number[] = []
        const uvs: number[] = []

        const positions2: number[] = []
        const normals2: number[] = []
        const colors2: number[] = []
        const uvs2: number[] = []

        for (let x = 0; x < 16; x++) {
            for (let z = 0; z < 16; z++) {
                for (let sy = 0; sy < 16; sy++) {
                    if (!this.subchunks[sy]) continue
                    for (let y = sy * 16; y < sy * 16 + 16; y++) {
                        const block = this.get(x, y, z)
                        if (!block) continue
                        const transparent = blocks[block].transparent
                        const addFace = (x: number, y: number, z: number) => {
                            const id = this.get(x, y, z)
                            if (id == 0) return true
                            return !transparent && blocks[id].transparent
                        }
                        const faces = [
                            addFace(x, y, z + 1),
                            addFace(x + 1, y, z),
                            addFace(x, y, z - 1),
                            addFace(x - 1, y, z),
                            addFace(x, y + 1, z),
                            addFace(x, y - 1, z),
                        ]
                        const textures = blockTexturesLookup.get(blockNameLookup.get(block))[0]

                        const data = getGeometryData(x, y, z, faces, textures, Chunk.atlasRanges)

                        if (transparent) {
                            positions2.push(...data.positions)
                            normals2.push(...data.normals)
                            colors2.push(...data.colors)
                            uvs2.push(...data.uvs)
                        } else {
                            positions.push(...data.positions)
                            normals.push(...data.normals)
                            colors.push(...data.colors)
                            uvs.push(...data.uvs)
                        }
                    }
                }
            }
        }

        const setAttribute = (
            geometry: BufferGeometry,
            name: string,
            arr: number[],
            size: number
        ) => {
            geometry.setAttribute(name, new BufferAttribute(new Float32Array(arr), size))
        }
        {
            const geometry = new BufferGeometry()
            setAttribute(geometry, 'position', positions, 3)
            setAttribute(geometry, 'normal', normals, 3)
            setAttribute(geometry, 'uv', uvs, 2)
            setAttribute(geometry, 'color', colors, 3)

            const mesh = new Mesh(geometry, Chunk.material)
            mesh.position.set(this.x * 16, 0, this.z * 16)
            this.meshes.push(mesh)
            Chunk.parentGroup.add(mesh)
        }
        {
            const geometry = new BufferGeometry()
            setAttribute(geometry, 'position', positions2, 3)
            setAttribute(geometry, 'normal', normals2, 3)
            setAttribute(geometry, 'uv', uvs2, 2)
            setAttribute(geometry, 'color', colors2, 3)

            const mesh = new Mesh(geometry, Chunk.material2)
            mesh.position.set(this.x * 16, 0, this.z * 16)
            this.meshes.push(mesh)
            Chunk.parentGroup.add(mesh)
        }
    }

    dispose() {
        for (const mesh of this.meshes) {
            mesh.removeFromParent()
            mesh.geometry.dispose()
        }
    }
}

export { Chunk }
