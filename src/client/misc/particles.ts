import {
    BufferAttribute,
    Camera,
    Material,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    PlaneGeometry,
    Quaternion,
    Texture,
    Vector3,
} from 'three'
import { Atlas, AtlasRange, AtlasRanges } from '../blocks/atlas'

class Particle {
    mesh: Mesh
    velocity: Vector3
    age: number
    alive: boolean
    static material: Material
    constructor(x: number, y: number, z: number, range: AtlasRange) {
        this.age = 0
        this.velocity = new Vector3(Math.random() * 5 - 2.5, 0, Math.random() * 5 - 2.5)

        const sprite = new Mesh(new PlaneGeometry(0.2, 0.2, 1, 1), Particle.material)

        const { u1, u2, v1, v2 } = range
        const uvs = [u1, v1, u2, v1, u1, v2, u2, v2, u2, v1, u1, v1]
        sprite.geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))

        this.alive = true
        sprite.position.set(x, y, z)
        this.mesh = sprite
    }
    update(delta: number, quaternion: Quaternion) {
        if (!this.alive) return
        if (this.age >= 2) {
            this.mesh.removeFromParent()
            this.alive = false
            return
        }
        const deltaV = new Vector3().copy(this.velocity)
        this.mesh.quaternion.copy(quaternion)
        this.velocity.multiplyScalar(0.99)
        this.velocity.y -= delta * 10
        this.mesh.position.add(deltaV.multiplyScalar(delta))
        this.age += delta
    }
}

class ParticleEmitter {
    ranges: AtlasRanges
    texture: Texture
    particles: Particle[]
    parent: Object3D
    size: number
    camera: Camera
    constructor(atlas: Atlas, parent: Object3D, camera: Camera) {
        this.size = atlas.size
        this.ranges = atlas.ranges
        this.texture = atlas.texture
        this.particles = []
        this.camera = camera
        this.parent = parent

        Particle.material = new MeshBasicMaterial({ map: this.texture, transparent: true })
    }

    emitParticle(x: number, y: number, z: number, textureName: string) {
        const range = { ...this.ranges.get(textureName)! }

        range.u2 -= 1 / this.size / 2
        range.v2 += 1 / this.size / 2

        const particle = new Particle(x, y, z, range)
        this.parent.add(particle.mesh)
        this.particles.push(particle)
    }

    update(delta: number) {
        this.particles = this.particles.filter((p) => p.alive)
        for (const particle of this.particles) {
            particle.update(delta, this.camera.quaternion)
        }
    }
}

export { Particle, ParticleEmitter }
