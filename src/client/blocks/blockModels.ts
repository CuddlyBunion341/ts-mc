import { FixedSizeArray } from '../../util/types'
import GeometryBuilder, { FaceIndex, Vertex } from './models/builder'
import { CompiledElement, CompiledModel, ElementPosition, FaceName } from './models/types'

class BlockModel {
    public solidSides: FixedSizeArray<6, boolean> = Array(6).fill(true)
    public elements: ModelElement[] = []
    public transparent = false

    public static compile(model: BlockModel): CompiledModel {
        const vertices: Record<string, any[]> = {}
        for (let i = 0; i < model.elements.length; i++) {
            const element = model.elements[i]

            const compiledElement = element.compile()
            let face: keyof CompiledElement['vertices']
            for (face in compiledElement.vertices) {
                if (!vertices[face]) vertices[face] = []
                vertices[face].push(...compiledElement.vertices[face])
            }
        }

        return {
            vertices,
            culling: model.solidSides,
            transparent: model.transparent,
        }
    }

    private _compiledModel?: CompiledModel

    constructor(elements: ModelElement[], solidSides?: FixedSizeArray<6, boolean>) {
        this.elements = elements
        if (solidSides) this.solidSides = solidSides
    }

    public clone() {
        const model = new BlockModel([])
        const elements = []
        for (let i = 0; i < this.elements.length; i++) {
            elements.push(this.elements[i].clone())
        }
        model.elements = elements
        model.solidSides = this.solidSides
        model.transparent = this.transparent
        return model
    }

    public setTextures(textures: { [key: string]: string }) {
        this.elements.forEach((element) => {
            let face: keyof ModelElement['faces']
            for (face in element.faces) {
                // todo: implement
            }
        })
        return this
    }

    public compileModel(force = false) {
        if (this._compiledModel && !force) return
        this._compiledModel = BlockModel.compile(this)
    }

    public get compiledModel() {
        this.compileModel()
        return this._compiledModel
    }
}

class ModelFace {
    texture: string | null = 'undefined'
    uv: [number, number, number, number] = [0, 0, 16, 16]
    rotation: number = 0

    constructor() {}

    setTexture(texture: string | null) {
        this.texture = texture
        return this
    }

    setUV(uv: [number, number, number, number]) {
        this.uv = uv
        return this
    }

    setRotation(rotation: number) {
        this.rotation = rotation
        return this
    }

    clone() {
        const face = new ModelFace()
        face.texture = this.texture
        face.uv = [...this.uv]
        face.rotation = this.rotation
        return face
    }
}

class ModelElement {
    public from: ElementPosition = [0, 0, 0]
    public to: ElementPosition = [16, 16, 16]
    public faces: Record<FaceName, ModelFace | null> = {
        north: new ModelFace(),
        east: new ModelFace(),
        south: new ModelFace(),
        west: new ModelFace(),
        up: new ModelFace(),
        down: new ModelFace(),
    }

    public shade?: boolean = true

    constructor() {}

    public setFace(
        face: 'north' | 'east' | 'south' | 'west' | 'up' | 'down',
        texture: string | null,
        uv?: [number, number, number, number]
    ) {
        if (texture == null) {
            delete this.faces[face]
            return this
        }

        this.faces[face] = new ModelFace().setTexture(texture)
        if (uv) this.faces[face]?.setUV(uv)
        return this
    }

    public setFrom(from: ElementPosition) {
        this.from = from
        return this
    }

    public setTo(to: ElementPosition) {
        this.to = to
        return this
    }

    public clone() {
        const element = new ModelElement()
        element.from = [...this.from]
        element.to = [...this.to]
        element.shade = this.shade

        const faces: Record<FaceName, ModelFace | null> = {
            north: null,
            east: null,
            south: null,
            west: null,
            up: null,
            down: null,
        }

        let face: keyof ModelElement['faces']

        for (face in this.faces) {
            if (this.faces[face] == null) {
                faces[face] = null
                continue
            }
            faces[face] = this.faces[face]!.clone()
        }

        return element
    }

    public compile(): CompiledElement {
        const [x1, y1, z1] = this.from.map((v) => v / 16)
        const [x2, y2, z2] = this.to.map((v) => v / 16)

        const dx = x2 - x1
        const dy = y2 - y1
        const dz = z2 - z1

        const getVertices = (faceIndex: FaceIndex) => {
            const face = GeometryBuilder.getFace(faceIndex)
            const vertices: Vertex[] = []

            for (let i = 0; i < 6; i++) {
                const vertex = face[i]
                const [x, y, z] = vertex.pos
                const [u, v] = vertex.uv
                const [nx, ny, nz] = vertex.norm

                vertices.push({
                    pos: [x * dx + x1, y * dy + y1, z * dz + z1],
                    uv: [u, v],
                    norm: [nx, ny, nz],
                    shade: this.shade ? vertex.shade : 1,
                })
            }
            return vertices
        }

        return {
            vertices: {
                north: getVertices(FaceIndex.Front),
                east: getVertices(FaceIndex.Right),
                south: getVertices(FaceIndex.Back),
                west: getVertices(FaceIndex.Left),
                up: getVertices(FaceIndex.Top),
                down: getVertices(FaceIndex.Bottom),
            },
        }
    }
}

export { BlockModel, ModelElement, ModelFace }
