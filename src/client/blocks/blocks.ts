import { BlockModelTemplates } from './models/template'
import * as StateProperty from './state/types'
import { BlockDrop, BlockSound } from './types'

type ValidBlockState = {
    axis?: StateProperty.Axis
    facing?: StateProperty.Facing
    half?: StateProperty.Half
    shape?: StateProperty.Shape
}

type BlockVariantProperties = {
    hardness?: number
    drops?: BlockDrop[]
    transparent?: boolean
    hasGravity?: boolean
    isSolid?: boolean
    soundGroup?: BlockSound
    model?: BlockModel
}

class BlockVariant {
    public parent: Block

    private hardness?: number
    private drops?: BlockDrop[]
    private transparent?: boolean
    private hasGravity?: boolean
    private isSolid?: boolean
    private soundGroup?: BlockSound
    private model?: BlockModel

    constructor(parent: Block) {
        this.parent = parent
    }

    set(property: keyof BlockVariantProperties, value: any) {
        this[property] = value
    }

    get(property: keyof BlockVariantProperties) {
        return this[property] ?? this.parent[property]
    }
}

class BlockState extends BlockVariant {
    public static count = 0
    public static list = new Map<number, BlockState>()
    public static get(id: number) {
        return BlockState.list.get(id)
    }

    public id: number = ++BlockState.count
    public values: { [key: string]: any }

    constructor(parent: Block, values: ValidBlockState) {
        super(parent)
        this.values = values
        BlockState.list.set(this.id, this)
    }

    toString() {
        let values = ''
        for (let key in this.values) {
            values += `${key}=${this.values[key]}`
        }
        return values
    }
}

class Block {
    public static count = 0

    public id: number = ++Block.count
    public name: string
    public displayName: string
    public hardness: number = 1
    public drops: BlockDrop[] = [{ itemID: this.id, probability: 1 }]
    public transparent: boolean = false
    public hasGravity: boolean = false
    public isSolid: boolean = true
    public soundGroup: BlockSound = 'stone'
    public model: BlockModel

    public validStates: { [key: string]: any[] }
    public states: BlockState[]
    public defaultStateIndex: number = 0
    public get defaultState() {
        return this.states[this.defaultStateIndex]
    }

    constructor(name: string) {
        this.displayName = name
        this.name = name.toLowerCase().replace(' ', '_')

        this.validStates = {}
        this.model = new BlockModel([])
        this.states = [new BlockState(this, {})]
    }
}

class BlockBuilder {
    private block: Block

    public static named(name: string) {
        return new BlockBuilder(name)
    }

    constructor(name: string) {
        this.block = new Block(name)
    }

    public hardness(hardness: number) {
        this.block.hardness = hardness
        return this
    }

    public transparent(transparent: boolean) {
        this.block.transparent = transparent
        return this
    }

    public gravity(gravity: boolean) {
        this.block.hasGravity = gravity
        return this
    }

    public soundgroup(soundGroup: BlockSound) {
        this.block.soundGroup = soundGroup
        return this
    }

    public solid(solid: boolean) {
        this.block.isSolid = solid
        return this
    }

    public addState(values: ValidBlockState, callback?: (state: BlockState) => void) {
        const state = new BlockState(this.block, values)
        this.block.states.push(state)
        return this
    }

    public build(): Block {
        return this.block
    }
}

const Hardness = {
    Dirt: 1.5,
    Sand: 1.5,
    Glass: 5,
    Rock: 10,
    Wood: 2,
    Leaves: 0.1,
    Unbreakable: -1,
}

// shorthand
const _ = BlockBuilder.named
const Templates = BlockModelTemplates

class Blocks {
    public static list: Block[] = [
        _('Air').solid(false).build(),
        _('Stone').hardness(Hardness.Rock).build(),
        _('Grass Block').hardness(Hardness.Dirt).build(),
        _('Dirt').hardness(Hardness.Dirt).build(),
        _('Cobblestone').hardness(Hardness.Rock).build(),
        _('Oak Planks').hardness(Hardness.Wood).build(),
        _('Oak Leaves').hardness(Hardness.Leaves).build(),
        _('Bedrock').hardness(Hardness.Unbreakable).build(),
        _('Sand').hardness(Hardness.Sand).gravity(true).build(),
        _('Water').solid(false).build(),
        _('Glass').build(),
        _('Stone Slab')
            .addState({ half: 'bottom' }, (s) => {
                s.set('model', Templates.slabBottom.clone().setTextures({ all: 'stone' }))
            })
            .addState({ half: 'top' }, (s) => {
                s.set('model', Templates.slabTop.clone().setTextures({ all: 'stone' }))
            })
            .build(),
        _('Oak Log')
            .hardness(Hardness.Wood)
            .addState({ axis: 'y' }, (s) => {
                s.set(
                    'model',
                    Templates.pillarY.clone().setTextures({ side: 'oak_log', end: 'oak_log_top' })
                )
            })
            .addState({ axis: 'x' }, (s) => {
                s.set(
                    'model',
                    Templates.pillarX.clone().setTextures({ side: 'oak_log', end: 'oak_log_top' })
                )
            })
            .addState({ axis: 'z' }, (s) => {
                s.set(
                    'model',
                    Templates.pillarZ.clone().setTextures({ side: 'oak_log', end: 'oak_log_top' })
                )
            })
            .build(),
    ]

    public static fromString(data: string) {
        const regex = /^(\w+)(?:\[(\w+=\w+(?:,\w+=\w+)*)\])?$/g
        if (regex.test(data)) throw new Error('Invalid block string')

        const matches = regex.exec(data)
        if (matches === null) throw new Error('Error parsing block string')

        const name = matches[1]
        const states = matches[2]

        const block = this.list.find((b) => b.name === name)
        if (block === undefined) throw new Error('Block not found')

        const blockStates = block.states
        if (states === undefined) return block
    }
}

export { blocks, textures, blockIDs, blockSounds, BlockSound }
