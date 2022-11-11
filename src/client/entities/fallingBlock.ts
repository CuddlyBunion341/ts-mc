import {
    BoxGeometry,
    BufferAttribute,
    BufferGeometry,
    Material,
    Mesh,
    MeshBasicMaterial,
    Texture,
    Vector3,
} from 'three'
import { AtlasRanges } from '../blocks/atlas'
import { blocks } from '../blocks/blocks'
import { getGeometryData } from '../world/builder'
import { Chunk } from '../world/chunk'
import { Entity } from './entity'

class FallingBlock extends Entity {
    private x: number
    private y: number
    private z: number

    entityID: number = Entity.count++
    static acceleration = 20
    itemID: number
    chunk: Chunk
    constructor(x: number, y: number, z: number, chunk: Chunk, itemID: number = 1) {
        super('falling_block')
        this.x = x
        this.y = y
        this.z = z
        this.position = new Vector3(x + chunk.x * 16, y, z + chunk.z * 16)
        this.velocity = new Vector3(0, 0, 0)
        this.itemID = itemID
        this.chunk = chunk
    }

    createMesh(atlasRanges: AtlasRanges, material: Material) {
        const textures = blocks[this.itemID].model.elements[0].textures
        const data = getGeometryData(0, 0, 0, Array(6).fill(true), textures, atlasRanges)
        const { positions, normals, uvs, colors } = data

        const setAttr = (name: string, arr: number[], size: number) =>
            geometry.setAttribute(name, new BufferAttribute(new Float32Array(arr), size))

        const geometry = new BufferGeometry()
        setAttr('position', positions, 3)
        setAttr('normal', normals, 3)
        setAttr('uv', uvs, 2)
        setAttr('color', colors, 3)

        this.mesh = new Mesh(geometry, material)
        this.mesh.position.set(this.x, this.y, this.z)
    }

    update(delta: number) {
        if (!this.alive) return

        this.velocity.y -= FallingBlock.acceleration * delta
        this.position.add(new Vector3().copy(this.velocity).multiplyScalar(delta))
        const { x, z } = this
        const y = this.position.y | 0

        if (this.chunk.get(x, y, z)) {
            this.chunk.update(x, y + 1, z, this.itemID)
            return this.kill()
        }

        this.mesh?.position.copy(this.position)
    }
}

export { FallingBlock }
