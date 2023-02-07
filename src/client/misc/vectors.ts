import { Vec3 } from 'cannon-es'
import { Vector3 } from 'three'

function vec3ToVector3(vec3: Vec3): Vector3 {
    return new Vector3(vec3.x, vec3.y, vec3.z)
}

function vector3ToVec3(vector3: Vector3): Vec3 {
    return new Vec3(vector3.x, vector3.y, vector3.z)
}

export { vec3ToVector3, vector3ToVec3 }
