import { BufferAttribute, BufferGeometry, Material, Mesh } from 'three'
import { AtlasRanges } from '../blocks/atlas'
import { blocks } from '../blocks/blocks'
import { getGeometryData } from '../world/builder'
import { Entity } from './entity'
import { EntitySystem } from './entitySystem'

class ItemEntity extends Entity {
    itemID: number
    count: number
    x: number
    y: number
    z: number
    time: number
    constructor(x: number, y: number, z: number, itemID: number) {
        super('item')
        this.itemID = itemID
        this.x = x
        this.y = y
        this.z = z
        this.time = 0
        this.count = 0
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
        this.mesh.position.set(
            this.x + Math.random() / 4,
            this.y + Math.random() / 4,
            this.z + Math.random() / 4
        )
        this.mesh.scale.set(0.25, 0.25, 0.25)
    }

    update(delta: number): void {
        this.time += delta
        if (!this.mesh) return
        this.mesh.rotateY(delta) // rotate
        this.mesh.position.y = Math.sin(this.time) * 0.2 + this.y // bob up and down
        // TODO: test for player collision
        this.entitySystem.entities.forEach((entity) => {
            if (entity == this) return
            if (!this.alive) return
            // TODO: STACK
        })
    }
}

export { ItemEntity }
