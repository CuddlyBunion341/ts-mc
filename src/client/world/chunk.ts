import { BufferAttribute, BufferGeometry, Group, Material, Mesh } from 'three'
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

    constructor(x: number, z: number) {
        this.x = x
        this.z = z
        this.subchunks = Array(16)

        Chunk.generator.generate(this)
    }

    set(x: number, y: number, z: number, block: number) {
        const sy = Math.floor(y / 16)
        if (!this.subchunks[sy]) this.subchunks[sy] = Array(4096).fill(0)
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
                    for (let y = sy * 16; y < sy * 16 + 16; sy++) {
                        const data = getGeometryData(x, y, z, Array(6).fill(true))
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
        Chunk.parentGroup.add(this.mesh)
    }

    dispose() {
        this.mesh.removeFromParent()
        this.mesh.geometry.dispose()
    }
}

export { Chunk }
