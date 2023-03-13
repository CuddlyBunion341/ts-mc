type ElementPosition = {
    x: number
    y: number
    z: number
}
type ElementDimensions = {
    w: number
    h: number
    d: number
}

class BlockModel {
    public solidSides: boolean[] = Array(6).fill(true)
    public elements: ModelElement[] = []

    constructor(elements: ModelElement[], solidSides?: boolean[]) {
        this.elements = elements
        if (solidSides) this.solidSides = solidSides
    }

    public clone() {
        return new BlockModel(this.elements, this.solidSides)
    }

    public setTextures(textures: { [key: string]: string }) {
        this.elements.forEach((element) => {
            let face: keyof ModelElement['faces']
            for (face in element.faces) {
                if (element.faces[face].texture in textures) {
                    element.faces[face].texture = textures[element.faces[face].texture]
                }
            }
        })
        return this
    }
}

class EmptyModel extends BlockModel {
    constructor() {
        super([], Array(6).fill(false))
    }
}

type ModelPosition = [number, number, number]
class ModelFace {
    texture: string = 'undefined'
    uv: [number, number, number, number] = [0, 0, 16, 16]
    rotation: number = 0

    constructor() {}

    setTexture(texture: string) {
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
}

class ModelElement {
    public from: ModelPosition = [0, 0, 0]
    public to: ModelPosition = [16, 16, 16]
    public faces: {
        north?: ModelFace
        east?: ModelFace
        south?: ModelFace
        west?: ModelFace
        up?: ModelFace
        down?: ModelFace
    } = (() => {
        let faces = ['north', 'east', 'south', 'west', 'up', 'down']
        let dict = {}

        for (let i = 0; i < 6; i++) {
            dict[faces[i]] = new ModelFace().setTexture(`#${i}`)
        }
        return {
            north: new ModelFace().setTexture('#0'),
            east: new ModelFace().setTexture('#1'),
            south: new ModelFace().setTexture('#2'),
            west: new ModelFace().setTexture('#3'),
            up: new ModelFace().setTexture('#4'),
            down: new ModelFace().setTexture('#5'),
        }
    })()

    public shade?: boolean = true

    constructor() {}
    public setFace(
        face: 'north' | 'east' | 'south' | 'west' | 'up' | 'down',
        texture: string,
        uv?: [number, number, number, number]
    ) {
        this.faces[face] = new ModelFace().setTexture(texture)
        if (uv) this.faces[face]?.withUV(uv)
        return this
    }

    public setFrom(from: ModelPosition) {
        this.from = from
        return this
    }

    public setTo(to: ModelPosition) {
        this.to = to
        return this
    }
}
