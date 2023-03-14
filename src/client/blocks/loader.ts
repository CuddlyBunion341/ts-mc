import { BlockModel } from './blockModels'
import { Blocks } from './blocks'

const StateIDLookup: Record<string, number> = {}
// exapmple: States['stone_slab[half=bottom]']
// used for placing blocks

const BlockModelLookup: Record<number, BlockModel> = {}
// example: BlockModelLookup['stone_slab']
// used for rendering blocks

Blocks.list.forEach((block) => {
    // precompile models
    block.states.forEach((state) => {
        state.getModel().compileModel()
    })

    // create lookup tables
    block.states.forEach((state) => {
        const key = `${block.name}[${state}]`
        if (StateIDLookup[key]) {
            throw new Error(`Duplicate block state: ${key}`)
        }
        StateIDLookup[key] = state.id

        if (BlockModelLookup[state.id]) {
            throw new Error(`Duplicate block model: ${state.id}`)
        }
        BlockModelLookup[state.id] = state.getModel()
    })
})
