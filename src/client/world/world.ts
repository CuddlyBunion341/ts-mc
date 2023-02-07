import { Entity } from '../entities/entity'
import { EntitySystem } from '../entities/entitySystem'
import { ChunkFactory } from './chunk'
import { Terrain } from './terrain'

class World {
    public terrain: Terrain
    public entitySystem: EntitySystem
    public renderDistance: number

    constructor(chunkFactory: ChunkFactory, entitySystem: EntitySystem) {
        this.entitySystem = entitySystem
        chunkFactory.addEntity = (entity) => this.entitySystem.addEntity(entity)
        this.terrain = new Terrain(chunkFactory)
        this.renderDistance = 16
    }

    update(delta: number) {
        this.entitySystem.update(delta)
    }

    getActiveChunks() {}
}

export { World }
