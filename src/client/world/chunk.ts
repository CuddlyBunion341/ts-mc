import { BufferAttribute, BufferGeometry, Group, Material, Mesh } from 'three'
import { AtlasRanges } from '../blocks/atlas'
import { blockNameLookup, blockTexturesLookup } from '../blocks/blocks'
import { getGeometryData } from './builder'
import { TerrainGenerator } from './generator'

class Chunk {
    x: number
    z: number
    subchunks: number[][]
    mesh!: Mesh

    static parentGroup: Group
    static material: Material
    static generator: TerrainGenerator
    static atlasRanges: AtlasRanges

    constructor(x: number, z: number) {
        this.x = x
        this.z = z
        this.subchunks = Array(16)

        Chunk.generator.generate(this)
    }

    get(x: number, y: number, z: number) {
        if (x >= 16 || x < 0 || y >= 256 || y < 0 || z >= 16 || z < 0) return 1 // performance
        const sy = Math.floor(y / 16)
        if (!this.subchunks[sy]) return
        const index = 16 * 16 * z + 16 * (y % 16) + x
        return this.subchunks[sy][index]
    }

    set(x: number, y: number, z: number, block: number) {
        const sy = Math.floor(y / 16)
        this.subchunks[sy] ||= Array(4096).fill(0)
        const index = 16 * 16 * z + 16 * (y % 16) + x
        this.subchunks[sy][index] = block
    }

    build() {
        const positions: number[] = []
        const normals: number[] = []
        const colors: number[] = []
        const uvs: number[] = []

        for (let x = 0; x < 16; x++) {
            for (let z = 0; z < 16; z++) {
                for (let sy = 0; sy < 16; sy++) {
                    if (!this.subchunks[sy]) continue
                    for (let y = sy * 16; y < sy * 16 + 16; y++) {
                        const block = this.get(x, y, z)
                        if (!block) continue
                        const faces = [
                            !this.get(x, y, z + 1),
                            !this.get(x + 1, y, z),
                            !this.get(x, y, z - 1),
                            !this.get(x - 1, y, z),
                            !this.get(x, y + 1, z),
                            !this.get(x, y - 1, z),
                        ]
                        const textures = blockTexturesLookup.get(blockNameLookup.get(block))[0]

                        const data = getGeometryData(x, y, z, faces, textures, Chunk.atlasRanges)

                        positions.push(...data.positions)
                        normals.push(...data.normals)
                        colors.push(...data.colors)
                        uvs.push(...data.uvs)
                    }
                }
            }
        }

        const geometry = new BufferGeometry()
        const setAttribute = (name: string, arr: number[], size: number) => {
            geometry.setAttribute(name, new BufferAttribute(new Float32Array(arr), size))
        }
        setAttribute('position', positions, 3)
        setAttribute('normal', normals, 3)
        setAttribute('uv', uvs, 2)
        setAttribute('color', colors, 3)

        if (this.mesh) this.dispose()

        this.mesh = new Mesh(geometry, Chunk.material)
        this.mesh.position.set(this.x * 16, 0, this.z * 16)
        Chunk.parentGroup.add(this.mesh)
    }

    dispose() {
        this.mesh.removeFromParent()
        this.mesh.geometry.dispose()
    }
}

export { Chunk }
