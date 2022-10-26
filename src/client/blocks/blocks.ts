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
    transparent: boolean
    hasGravity: boolean

    static blockCount = 0
    model: BlockModel

    constructor(name: string, hardness: number, model: BlockModel, transparent = false) {
        this.id = Block.blockCount++
        this.drops = [{ itemID: this.id, probability: 1 }]
        this.displayName = name
        this.name = name.toLowerCase().replace(' ', '_')
        this.hardness = hardness
        this.model = model
        this.transparent = transparent
        this.hasGravity = false
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
    new Block('Air', 0, new EmptyModel(), true),
    new Block('Stone', 10, new CubeAllModel('stone')),
    new Block('Grass Block', 0.6, new TopSideBottomModel('grass_top', 'grass_side', 'dirt')),
    new Block('Dirt', 0.5, new CubeAllModel('dirt')),
    new Block('Cobblestone', 10, new CubeAllModel('cobblestone')),
    new Block('Oak Planks', 2, new CubeAllModel('oak_planks')),
    new Block('Oak Log', 2, new TopSideModel('oak_log_top', 'oak_log')),
    new Block('Bedrock', 100, new CubeAllModel('bedrock')),
    new Block('Sand', 0.5, new CubeAllModel('sand')),
    new Block('Water', 100, new CubeAllModel('water'), true),
    new Block('Glass', 0.3, new CubeAllModel('glass'), true),
]

const textures: string[] = []
for (const block of blocks) {
    const elements = block.model.elements
    for (const element of elements) {
        for (const texture of element.textures) {
            if (!textures.includes(texture)) textures.push(texture)
        }
    }
}

const blockIDs = new Map()

for (const block of blocks) {
    blockIDs.set(block.name, block.id)
}

function setDrop(name: string, drop: string) {
    const blockID = blockIDs.get(name)
    const dropID = blockIDs.get(drop)

    blocks[blockID].drops = [{ itemID: dropID, probability: 1 }]
}

setDrop('grass_block', 'dirt')
setDrop('stone', 'cobblestone')

export { blocks, textures, blockIDs }
