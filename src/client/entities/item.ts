import { Mesh, Vector3 } from 'three'
import { AABB } from './aabb'
import { Entity } from './entity'

class Item extends Entity {
    // public position: Vector3 = new Vector3()
    public itemID: number
    public position: Vector3 = new Vector3()

    private time: number

    constructor(x: number, y: number, z: number, itemID: number) {
        super('item')
        this.itemID = itemID

        this.position = new Vector3(x, y, z)
        this.time = 0
    }

    update(delta: number) {
        this.time += delta
    }
}

export { Item }
