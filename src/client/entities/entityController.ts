import { Entity } from './entity'

class EntityController {
    entities: Entity[]
    constructor() {
        this.entities = []
    }
    update(delta: number) {
        this.entities.forEach((e) => e.update(delta))
    }
    addEntity(entity: Entity) {
        this.entities.push(entity)
    }
    removeEntity(entity: Entity) {
        const index = this.entities.indexOf(entity)
        if (index != -1) this.entities.splice(index, 1)
    }
}

export { EntityController }
