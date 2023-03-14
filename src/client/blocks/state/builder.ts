import { BlockSound, ValidBlockState } from '../types'

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
        if (callback) callback(state)
        return this
    }

    public addStates(
        values: ValidBlockState[],
        callback: (state: BlockState, index: number) => void
    ) {
        values.forEach((v, index) => this.addState(v, (state) => callback(state, index)))
        return this
    }

    public states(values: ValidBlockState[], callback: (state: BlockState, index: number) => void) {
        values.forEach((v, index) => this.addState(v, (state) => callback(state, index)))
        return this
    }

    public build(): Block {
        return this.block
    }
}

class StaticBlockBuilder {
    private static block: Block = new Block('')

    public static named(name: string) {
        StaticBlockBuilder.block.name = name
        return StaticBlockBuilder
    }

    public static hardness(hardness: number) {
        StaticBlockBuilder.block.hardness = hardness
        return StaticBlockBuilder
    }

    public static transparent(transparent: boolean) {
        StaticBlockBuilder.block.transparent = transparent
        return StaticBlockBuilder
    }

    public static solid(solid: boolean) {
        StaticBlockBuilder.block.isSolid = solid
        return StaticBlockBuilder
    }

    public static gravity(gravity: boolean) {
        StaticBlockBuilder.block.hasGravity = gravity
        return StaticBlockBuilder
    }

    public static build() {
        const block = StaticBlockBuilder.block
        StaticBlockBuilder.block = new Block('')
        return block
    }

    public static addState(values: ValidBlockState, callback?: (state: BlockState) => void) {
        const state = new BlockState(this.block, values)
        this.block.states.push(state)
        if (callback) callback(state)
        return this
    }

    public static states(
        values: ValidBlockState[],
        callback: (state: BlockState, index: number) => void
    ) {
        values.forEach((v, index) => this.addState(v, (state) => callback(state, index)))
        return StaticBlockBuilder
    }

    public static get $() {
        return StaticBlockBuilder.block
    }
}

export { BlockBuilder, StaticBlockBuilder }
