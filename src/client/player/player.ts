type GameMode = 'survival' | 'creative' | 'spectator'

interface Slot {
    count: number
    itemID: number
}

class Player {
    gamemode: GameMode
    health: number
    inventory: Slot[]
    constructor() {
        this.gamemode = 'survival'
        this.health = 20
        this.inventory = []
    }
}
