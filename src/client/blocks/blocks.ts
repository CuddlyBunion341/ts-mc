import { BlockModel } from './blockModels'
import { BlockModelTemplates } from './models/template'
import { StaticBlockBuilder } from './state/builder'
import { BlockDrop, BlockSound, ValidBlockState } from './types'

class BlockVariant {
    public parent: Block

    private _hardness?: number
    private _drops?: BlockDrop[]
    private _transparent?: boolean
    private _hasGravity?: boolean
    private _isSolid?: boolean
    private _soundGroup?: BlockSound
    private _model?: BlockModel

    constructor(parent: Block) {
        this.parent = parent
    }

    public get model(): BlockModel {
        return this._model ?? this.parent.model
    }

    public set model(model: BlockModel) {
        this._model = model
    }

    public get hardness(): number {
        return this._hardness ?? this.parent.hardness
    }

    public set hardness(hardness: number) {
        this._hardness = hardness
    }
}

class BlockState extends BlockVariant {
    public static count = 0
    public static list = new Map<number, BlockState>()
    public static get(id: number) {
        return BlockState.list.get(id)
    }

    public static addDefaultsToString(state: string, defaults: BlockState) {
        const stateArr = state.split(',').map((s) => s.split('='))
        for (let key in defaults.values) {
            if (!state.includes(key)) {
                state += `,${key}=${defaults.values[key]}`
            }
        }
    }

    public static reduceStateStringWithDefaults(state: string, defaults: BlockState) {}

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

    public valueOf() {
        return this.id
    }
}

class Block {
    public static count = 0

    public id: number = ++Block.count
    private _name: string = ''
    private _displayName: string = ''
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
        this.name = name

        this.validStates = {}
        this.model = new BlockModel([])
        this.states = [new BlockState(this, {})]
    }

    public getState(state: string) {
        return this.states.find((s) => s.toString() === state)
    }

    public get displayName() {
        return this._displayName
    }

    public set displayName(name: string) {
        this._displayName = name
        this._name = name.toLowerCase().replace(' ', '_')
    }

    public get name() {
        return this._name
    }

    public set name(name: string) {
        this._name = name
        this._displayName = name
            .split('_')
            .map((s) => s[0].toUpperCase() + s.slice(1))
            .join(' ')
    }

    public onPlace() {}
    public onBreak() {}
    public onInteract() {}
    // public onTick() {}
}

export { Blocks, BlockStates }
