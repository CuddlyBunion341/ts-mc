import { BufferAttribute, BufferGeometry, Material, Mesh } from 'three'
import { AtlasRanges } from '../blocks/atlas'
import { blocks } from '../blocks/blocks'
import { getGeometryData } from '../world/builder'
import { Entity } from './entity'

class ItemEntity extends Entity {
    itemID: number
    x: number
    y: number
    z: number
    constructor(x: number, y: number, z: number, itemID: number) {
        super('item')
        this.itemID = itemID
        this.x = x
        this.y = y
        this.z = z
    }

    createMesh(atlasRanges: AtlasRanges, material: Material) {
        const textures = blocks[this.itemID].model.elements[0].textures

        const data = getGeometryData(0, 0, 0, Array(6).fill(true), textures, atlasRanges)
        const { positions, normals, uvs, colors } = data
        const geometry = new BufferGeometry()

        const setAttr = (name: string, arr: number[], size: number) =>
            geometry.setAttribute(name, new BufferAttribute(new Float32Array(arr), size))

        setAttr('position', positions, 3)
        setAttr('normal', normals, 3)
        setAttr('uv', uvs, 2)
        setAttr('color', colors, 3)

        this.mesh = new Mesh(geometry, material)
        this.mesh.position.set(this.x, this.y, this.z)
        this.mesh.scale.set(0.5, 0.5, 0.5)
    }

    update(delta: number): void {
        // TODO: rotate item around y axis
        // TODO: move Item up and down
        // TODO: test for player collision
    }
}

export { ItemEntity }
