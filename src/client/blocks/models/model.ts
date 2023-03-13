import { CompiledModel } from './compiler'
import { FixedSizeArray } from '../../../util/types'

class Model {
    static compile: (model: Model) => CompiledModel

    elements: Element[] = []
    transparent = false
    shady = true
    culling: FixedSizeArray<6, boolean> = [true, true, true, true, true, true]

    constructor() {}

    setTextures(textures: string[]) {
        this.elements.forEach((element) => {
            for (const face in element.faces) {
                if (element.faces[face] == null) continue
                element.faces[face].texture = textures[0]
            }
        })
    }

    rotate(axis: RotationAxis, angle: RotationAngle) {
        this.elements.forEach((element) => {})
    }
}

export { Model }
