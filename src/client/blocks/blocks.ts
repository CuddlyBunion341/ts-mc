interface BlockDrop {
    probability: number
    itemID: number
}

interface ElementPosition {
    x: number
    y: number
    z: number
}
interface ElementDimensions {
    w: number
    h: number
    d: number
}

class Block {
    id: number
    name: string
    displayName: string
    hardness: number
    drops: BlockDrop[]
    transparent: boolean = false

    static blockCount = 0
    model: BlockModel

    constructor(name: string, hardness: number, model: BlockModel) {
        this.id = Block.blockCount++
        this.drops = [{ itemID: this.id, probability: 1 }]
        this.displayName = name
        this.name = name.toLowerCase().replace(' ', '_')
        this.hardness = hardness
        this.model = model
    }
}

// ---- Block Models ---------------------------------------------------------------------

class BlockModel {
    solidSides: boolean[]
    elements: ModelElement[]
    constructor(elements: ModelElement[], solidSides: boolean[]) {
        this.solidSides = solidSides
        this.elements = elements
    }
}

class EmptyModel extends BlockModel {
    constructor() {
        super([], Array(6).fill(false))
    }
}

class ModelElement {
    pos: ElementPosition
    dim: ElementDimensions
    textures: string[]
    constructor(pos: ElementPosition, dim: ElementDimensions, textures: string[]) {
        this.pos = pos
        this.dim = dim
        this.textures = textures
    }
}

class CubeModel extends BlockModel {
    constructor(
        front: string,
        right: string,
        back: string,
        left: string,
        top: string,
        bottom: string
    ) {
        const textures = [front, right, back, left, top, bottom]
        const [x, y, z] = [0, 0, 0]
        const [w, h, d] = [16, 16, 16]
        const faces = Array(6).fill(true)
        super([new ModelElement({ x, y, z }, { w, h, d }, textures)], faces)
    }
}

class TopSideBottomModel extends CubeModel {
    constructor(top: string, side: string, bottom: string) {
        super(side, side, side, side, top, bottom)
    }
}
class TopSideModel extends TopSideBottomModel {
    constructor(top: string, side: string) {
        super(top, side, top)
    }
}
class CubeAllModel extends TopSideModel {
    constructor(texture: string) {
        super(texture, texture)
    }
}

// ---- Blocks ---------------------------------------------------------------------------

const blocks: Block[] = [
    new Block('Air', 0, new EmptyModel()),
    new Block('Stone', 10, new CubeAllModel('stone')),
    new Block('Grass Block', 0.6, new TopSideBottomModel('grass_top', 'grass_side', 'dirt')),
    new Block('Dirt', 0.5, new CubeAllModel('dirt')),
    new Block('Cobblestone', 10, new CubeAllModel('cobblestone')),
    new Block('Oak Planks', 2, new CubeAllModel('oak_planks')),
    new Block('Oak Log', 2, new TopSideModel('oak_log_top', 'oak_log')),
    new Block('Bedrock', 100, new CubeAllModel('bedrock')),
    new Block('sand', 0.5, new CubeAllModel('sand')),
]

// ---- Lookup Tables --------------------------------------------------------------------
const textures: string[] = []
for (const block of blocks) {
    const elements = block.model.elements
    for (const element of elements) {
        for (const texture of element.textures) {
            if (!textures.includes(texture)) textures.push(texture)
        }
    }
}

const blockIDLookup = new Map()
const blockNameLookup = new Map()
const blockSidesLookup = new Map()
const blockTexturesLookup = new Map()

for (const block of blocks) {
    blockIDLookup.set(block.name, block.id)
    blockNameLookup.set(block.id, block.name)
    blockSidesLookup.set(block.name, block.model.solidSides)
    blockTexturesLookup.set(
        block.name,
        block.model.elements.map((e) => e.textures)
    )
}

export { blocks, textures, blockIDLookup, blockNameLookup, blockSidesLookup, blockTexturesLookup }
