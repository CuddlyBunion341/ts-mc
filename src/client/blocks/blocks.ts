interface drop {
    probability: number
    id: number
}

interface Block {
    id: number
    name: string
    displayName: string
    stackSize: number
    diggable: boolean
    hardness: string
    boundingBox: string
    drops: drop[]
    transparent: boolean
}
