import { Vector3 } from 'three'

function inRange(v: number, a: number, b: number) {
    return a <= v && v <= b
}

class AABB {
    position: Vector3
    dimensions: Vector3
    constructor(x: number, y: number, z: number, dx: number, dy: number, dz: number) {
        this.position = new Vector3(x, y, z)
        this.dimensions = new Vector3(dx, dy, dz)
    }

    contains(x: number, y: number, z: number) {
        return !(
            x < this.position.x ||
            y < this.position.y ||
            z < this.position.z ||
            x > this.position.x + this.dimensions.x ||
            y > this.position.y + this.dimensions.y ||
            z > this.position.z + this.dimensions.z
        )
    }

    colides(other: AABB) {
        // TODO: FIXME
        return (
            (inRange(this.position.x, other.position.x, other.position.x + other.dimensions.x) &&
                inRange(this.position.y, other.position.y, other.position.y + other.dimensions.y) &&
                inRange(
                    this.position.z,
                    other.position.z,
                    other.position.z + other.dimensions.z
                )) ||
            (inRange(other.position.x, this.position.x, this.position.x + this.dimensions.x) &&
                inRange(other.position.y, this.position.y, this.position.y + this.dimensions.y) &&
                inRange(other.position.z, this.position.z, this.position.z + this.dimensions.z))
        )
    }
}

export { AABB }
