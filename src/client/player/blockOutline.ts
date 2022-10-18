import { BoxGeometry, BoxHelper, Mesh, MeshBasicMaterial, Object3D } from 'three'

class Outline {
    mesh: Object3D
    helper: BoxHelper

    constructor() {
        const geometry = new BoxGeometry(1.001, 1.001, 1.001)

        const material = new MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2,
        })
        const mesh = new Mesh(geometry, material)
        this.mesh = mesh
        this.helper = new BoxHelper(mesh, 0x0)
    }

    moveTo(x: number, y: number, z: number) {
        this.mesh.position.set(x, y, z)
        this.helper.update()
    }

    moveOut() {
        // move mesh to funny position
        this.mesh.position.set(69, 420, 80085)
        this.helper.update()
    }
}

export { Outline }
