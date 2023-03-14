const blockSoundList = <const>['none', 'cloth', 'grass', 'gravel', 'sand', 'snow', 'stone', 'wood']
import * as StateProperty from './state/types'
type BlockDrop = {
    probability: number
    itemID: number
}
type ValidBlockState = {
    axis?: StateProperty.Axis
    facing?: StateProperty.Facing
    half?: StateProperty.Half
    shape?: StateProperty.Shape
}
type BlockSound = typeof blockSoundList[number]
const BlockFaces = <const>['north', 'east', 'south', 'west', 'up', 'down']
type BlockFace = typeof BlockFaces[number]
type BlockFaceUV = [number, number, number, number]
type BlockFaceModel = {
    texture: string
    uv: BlockFaceUV
    rotation: number
}

export {
    blockSoundList,
    BlockDrop,
    BlockSound,
    BlockFace,
    BlockFaceUV,
    BlockFaceModel,
    BlockFaces,
    ValidBlockState,
}
