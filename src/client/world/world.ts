import { Entity } from '../entities/entity'
import { EntityController } from '../entities/entityController'
import { ChunkFactory } from './chunk'
import { Terrain } from './terrain'

class World {
    terrain: Terrain
    entityController: EntityController
    renderDistance: number
    constructor(chunkFactory: ChunkFactory, entityController: EntityController) {
        this.entityController = entityController
        chunkFactory.addEntity = (entity) => this.entityController.addEntity(entity)
        this.terrain = new Terrain(chunkFactory)
        this.renderDistance = 16
    }
    update(delta: number) {
        this.entityController.update(delta)
    }

    getActiveChunks() {}
}

export { World }
