import { BlockModel } from '../blockModels'
import { BlockModelTemplates } from '../models/template'
import { StaticBlockBuilder as B } from './builder'

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
const T = (name: keyof typeof BlockModelTemplates) => BlockModelTemplates[name].clone()

class BlockList {
    public static dict = <const>{
        air: B.solid(false).$,
        stone: B.hardness(Hardness.Rock).$,
        grass_block: B.hardness(Hardness.Dirt).$,
        dirt: B.hardness(Hardness.Dirt).$,
        cobblestone: B.hardness(Hardness.Rock).$,
        oak_planks: B.hardness(Hardness.Wood).$,
        oak_leaves: B.hardness(Hardness.Leaves).$,
        bedrock: B.hardness(Hardness.Unbreakable).$,
        sand: B.hardness(Hardness.Sand).gravity(true).$,
        water: B.solid(false).$,
        glass: B.transparent(true).$,
        oak_log: B.hardness(Hardness.Wood).states(
            [{ axis: 'y' }, { axis: 'x' }, { axis: 'z' }],
            (s, i) => {
                const template = <const>['pillarY', 'pillarX', 'pillarZ']
                s.model = T(template[i]).setTextures({ side: 'oak_log', end: 'oak_log_top' })
            }
        ).$,
        stone_slab: B.hardness(Hardness.Rock).states(
            [{ half: 'double' }, { half: 'top' }, { half: 'bottom' }],
            (s, i) => {
                const template = <const>['slabDouble', 'slabTop', 'slabBottom']
                s.model = T(template[i]).setTextures({ all: 'stone' })
            }
        ).$,
    }

    public static list = Object.values(this.dict)
    public static ModelLookup: Record<number, BlockModel>
    public static StateIDLookup: Record<string, BlockState>

    private static initialize = (() => {
        for (const block of this.list) {
            const states = block.states
            for (const state of states) {
                const stateString = state.toString()
                this.StateIDLookup[stateString] = state

                const model = state.model
                if (model) this.ModelLookup[state.id] = model
            }
        }
    })()

    public static fromString(data: string) {
        const regex = /^(\w+)(?:\[(\w+=\w+(?:,\w+=\w+)*)\])?$/g
        if (regex.test(data)) throw new Error('Invalid block string')

        const matches = regex.exec(data)
        if (matches === null) throw new Error('Error parsing block string')

        const name = matches[1]
        const states = matches[2]

        if (!(name in this.dict)) throw new Error('Block not found')
        const block = this.dict[name as keyof typeof this.dict]

        const blockStates = block.states
        if (blockStates.length == 1) return blockStates[0]

        for (const state of blockStates) {
            if (state.toString() == states) return state
        }

        throw new Error('Block state not found')
    }
}

const Blocks = BlockList.dict
const BlockStates = BlockList.StateIDLookup

Blocks.cobblestone.getState('[half=double]')
