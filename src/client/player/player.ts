import { blockIDLookup } from '../blocks/blocks'

type GameMode = 'survival' | 'creative' | 'spectator'

interface Slot {
    count: number
    itemID: number
}

class Player {
    gamemode: GameMode
    health: number
    inventory: Slot[]
    selectedSlot: number
    constructor() {
        this.gamemode = 'survival'
        this.selectedSlot = 0
        this.inventory = Array(27).fill(null)
        this.health = 20

        const hotbar = ['stone', 'cobblestone', 'dirt', 'oak_log', 'oak_planks', 'glass']

        for (let i = 0; i < hotbar.length; i++) {
            this.setItem(i, blockIDLookup.get(hotbar[i]), 64)
        }
    }

    getSlot(index: number) {
        return this.inventory[index]
    }

    getSelectedItem() {
        return this.inventory[this.selectedSlot]?.itemID
    }

    setItem(index: number, itemID: number, count: number) {
        if (index < 0 || index >= 27) return
        const value = { itemID, count }
        this.inventory[index] = value
    }
}

export { Player }
