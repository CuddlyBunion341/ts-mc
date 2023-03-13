const blockSoundList = <const>['none', 'cloth', 'grass', 'gravel', 'sand', 'snow', 'stone', 'wood']
type BlockDrop = {
    probability: number
    itemID: number
}
type BlockSound = typeof blockSoundList[number]
type BlockFace = 'north' | 'east' | 'south' | 'west' | 'up' | 'down'
type BlockFaceUV = [number, number, number, number]
type BlockFaceModel = {
    texture: string
    uv: BlockFaceUV
    rotation: number
}

export { blockSoundList, BlockDrop, BlockSound, BlockFace, BlockFaceUV, BlockFaceModel }
