import { BufferAttribute, BufferGeometry, Group, Material, Mesh } from 'three'
import { AtlasRanges } from '../blocks/atlas'
import { blocks } from '../blocks/blocks'
import { Entity } from '../entities/entity'
import { FallingBlock } from '../entities/fallingBlock'
import { ItemEntity } from '../entities/itemEntity'
import { getGeometryData } from './builder'
import { World } from './world'

interface ChunkOptions {
    material1: Material
    material2: Material
    parentGroup: Group
    ranges: AtlasRanges
    addEntity: (entity: Entity) => void
}

class Chunk {
    x: number
    z: number
    subchunks: number[][]
    meshes: Mesh[]
    neighbors!: Chunk[]
    isModified: boolean
    addEntity: (entity: Entity) => void

    // set by factory
    private parentGroup: Group
    private atlasRanges: AtlasRanges
    private material1: Material
    private material2: Material

    constructor(x: number, z: number, options: ChunkOptions) {
        this.x = x
        this.z = z
        this.subchunks = Array(16)
        this.meshes = []
        this.isModified = false

        this.material1 = options.material1
        this.material2 = options.material2
        this.atlasRanges = options.ranges
        this.parentGroup = options.parentGroup
        this.addEntity = options.addEntity
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

    update(x: number, y: number, z: number, block: number, drop = true) {
        const prevBlock = this.get(x, y, z)
        if (prevBlock == block) return

        if (drop && prevBlock != 0) {
            const item = new ItemEntity(x + this.x * 16, y, z + this.z * 16, prevBlock)
            item.createMesh(this.atlasRanges, this.material1)
            this.addEntity(item)
        }

        this.set(x, y, z, block)
        this.isModified = true
        // // send blockupdates
        this.blockUpdate(x, y, z)
        this.blockUpdate(x + 1, y, z)
        this.blockUpdate(x - 1, y, z)
        this.blockUpdate(x, y + 1, z)
        this.blockUpdate(x, y - 1, z)
        this.blockUpdate(x, y, z + 1)
        this.blockUpdate(x, y, z - 1)
        // build chunks
        if (x == 0) this.neighbors[3].build()
        if (z == 0) this.neighbors[1].build()
        if (x == 15) this.neighbors[2].build()
        if (z == 15) this.neighbors[0].build()
        this.build()
    }

    blockUpdate(x: number, y: number, z: number) {
        const block = this.get(x, y, z)
        if (!block) return

        if (blocks?.[block].hasGravity) {
            const below = this.get(x, y - 1, z)
            if (below == 0) {
                this.set(x, y, z, 0)
                this.build()
                const entity = new FallingBlock(x, y, z, this, block)
                entity.createMesh(this.atlasRanges, this.material1)
                this.addEntity(entity)
                setTimeout(() => this.blockUpdate(x, y + 1, z), 50)
            }
        }
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
                            return (
                                (!transparent && blocks[id].transparent) ||
                                blocks[id].name.includes('leaves')
                            )
                        }
                        const faces = [
                            addFace(x, y, z + 1),
                            addFace(x + 1, y, z),
                            addFace(x, y, z - 1),
                            addFace(x - 1, y, z),
                            addFace(x, y + 1, z),
                            addFace(x, y - 1, z),
                        ]
                        const textures = blocks[block].model.elements[0].textures

                        const data = getGeometryData(x, y, z, faces, textures, this.atlasRanges)

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

            const mesh = new Mesh(geometry, this.material1)
            mesh.position.set(this.x * 16, 0, this.z * 16)
            this.parentGroup.add(mesh)
            this.meshes.push(mesh)
        }
        {
            const geometry = new BufferGeometry()
            setAttribute(geometry, 'position', positions2, 3)
            setAttribute(geometry, 'normal', normals2, 3)
            setAttribute(geometry, 'uv', uvs2, 2)
            setAttribute(geometry, 'color', colors2, 3)

            const mesh = new Mesh(geometry, this.material2)
            mesh.position.set(this.x * 16, 0, this.z * 16)
            this.parentGroup.add(mesh)
            this.meshes.push(mesh)
        }
    }

    dispose() {
        for (const mesh of this.meshes) {
            mesh.removeFromParent()
            mesh.geometry.dispose()
        }
    }
}

class ChunkFactory {
    chunkGroup: Group
    chunkMaterial: Material
    chunkTransparentMaterial: Material
    atlasRanges: AtlasRanges
    addEntity!: (entity: Entity) => void

    constructor(chunkGroup: Group, ranges: AtlasRanges, material1: Material, material2: Material) {
        this.chunkGroup = chunkGroup
        this.chunkMaterial = material1
        this.chunkTransparentMaterial = material2
        this.atlasRanges = ranges
    }

    createChunk(x: number, z: number) {
        const chunk = new Chunk(x, z, {
            material1: this.chunkMaterial,
            material2: this.chunkTransparentMaterial,
            parentGroup: this.chunkGroup,
            ranges: this.atlasRanges,
            addEntity: this.addEntity,
        })
        return chunk
    }
}
export { Chunk, ChunkFactory }
