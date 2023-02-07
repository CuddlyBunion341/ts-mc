import { BufferAttribute, BufferGeometry, Material, Mesh, Vector3 } from 'three'
import { AtlasRanges } from '../blocks/atlas'
import { blocks } from '../blocks/blocks'
import { getGeometryData } from '../world/builder'
import { Entity } from './entity'
import { EntitySystem } from './entitySystem'

class ItemEntity extends Entity {
    public itemID: number
    public count: number
    public blockPos: Vector3
    public time: number

    constructor(x: number, y: number, z: number, itemID: number) {
        super('item')
        this.blockPos = new Vector3(x, y, z)
        this.itemID = itemID
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
            this.blockPos.x + Math.random() / 4,
            this.blockPos.y + Math.random() / 4,
            this.blockPos.z + Math.random() / 4
        )
        this.mesh.scale.set(0.25, 0.25, 0.25)
    }

    update(delta: number): void {
        this.time += delta
        if (!this.mesh) return
        this.mesh.rotateY(delta) // rotate
        this.mesh.position.y = Math.sin(this.time) * 0.2 + this.blockPos.y // bob up and down
        // TODO: test for player collision
        this.entitySystem.entities.forEach((entity) => {
            if (entity == this) return
            if (!this.alive) return
            // TODO: STACK
        })
    }
}

export { ItemEntity }
