import { Mesh } from 'three'

import { v4 as uuid4 } from 'uuid'
import { WorldCollider } from '../world/terrain'
import { EntitySystem } from './entitySystem'

abstract class Entity {
    public static count: number

    public uuid: string
    public name: string
    public mesh: Mesh | undefined
    public alive: boolean
    public worldCollider: WorldCollider | null

    public entitySystem!: EntitySystem

    constructor(name: string) {
        this.name = name
        this.uuid = uuid4()
        this.alive = true
        this.worldCollider = null
    }

    update(delta: number): void {}

    kill() {
        this.alive = false
        this.mesh?.removeFromParent()
        this.mesh?.geometry.dispose()
        this.entitySystem.removeEntity(this)
    }
}

export { Entity }
