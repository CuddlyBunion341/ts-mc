import { Mesh, Vector3 } from 'three'

import { v4 as uuid4 } from 'uuid'

abstract class Entity {
    static count: number
    uuid: string
    position: Vector3
    velocity: Vector3
    name: string
    mesh: Mesh | undefined
    alive: boolean
    constructor(name: string) {
        this.name = name
        this.uuid = uuid4()
        this.position = new Vector3()
        this.velocity = new Vector3()
        this.alive = true
    }
    update(delta: number): void {}

    kill() {
        this.alive = false
        this.mesh?.removeFromParent()
        this.mesh?.geometry.dispose()
    }
}

export { Entity }
