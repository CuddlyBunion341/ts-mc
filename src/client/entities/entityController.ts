import { Object3D } from 'three'
import { Entity } from './entity'

class EntityController {
    entities: Entity[]
    parent: Object3D
    constructor(parent: Object3D) {
        this.parent = parent
        this.entities = []
    }
    update(delta: number) {
        this.entities.forEach((e) => e.update(delta))
    }
    addEntity(entity: Entity) {
        if (entity.mesh) this.parent.add(entity.mesh)
        this.entities.push(entity)
    }
    removeEntity(entity: Entity) {
        if (entity.mesh) this.parent.remove(entity.mesh)
        const index = this.entities.indexOf(entity)
        if (index != -1) this.entities.splice(index, 1)
    }
}

export { EntityController }
