import { BoxBufferGeometry, Mesh, MeshBasicMaterial } from 'three'

class Outline {
    mesh: Mesh<BoxBufferGeometry, MeshBasicMaterial>

    constructor() {
        const geometry = new BoxBufferGeometry(1.001, 1.001, 1.001)
        const material = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 })
        const mesh = new Mesh(geometry, material)
        this.mesh = mesh
    }

    moveTo(x: number, y: number, z: number) {
        this.mesh.position.set(x, y, z)
    }

    moveOut() {
        // move mesh to funny position
        this.mesh.position.set(69, 420, 80085)
    }
}

export { Outline }
