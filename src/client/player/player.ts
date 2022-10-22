import { blockIDs } from '../blocks/blocks'

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
            this.setItem(i, blockIDs.get(hotbar[i]), 10)
        }
    }

    getSlot(index: number) {
        return this.inventory[index]
    }

    getSelectedSlot() {
        return this.inventory[this.selectedSlot]
    }

    setItem(index: number, itemID: number, count: number) {
        if (index < 0 || index >= 27) return
        const value = { itemID, count }
        this.inventory[index] = value
    }

    setItemCount(index: number, newCount: number) {
        if (index < 0 || index >= 27) return
        this.inventory[index].count = newCount
    }

    updateItemCount(index: number, delta: number) {
        const slot = this.getSlot(index)
        const count = slot.count
        slot.count = Math.max(slot.count + delta, 0)
        return count
    }

    addItem(itemID: number) {
        for (let i = 0; i < 27; i++) {
            if (!this.getSlot(i)) {
                this.setItem(i, itemID, 1)
                return i
            }
            if (this.getSlot(i).itemID == itemID) {
                if (this.getSlot(i).count < 64) {
                    this.getSlot(i).count++
                    return i
                }
            }
        }
        return -1
    }

    addItems(itemID: number, count: number) {
        if (count <= 0) return []
        const modifiedSlots: number[] = []

        for (let i = 0; i < 27; i++) {
            if (!this.getSlot(i)) {
                this.setItem(i, itemID, 0)
            }
            if (this.getSlot(i).itemID == itemID) {
                const c = this.getSlot(i).count
                const diff = 64 - c
                const heap = Math.min(count, diff)
                count -= heap
                this.getSlot(i).count += heap
                modifiedSlots.push(i)
                if (count == 0) break
            }
        }
        return modifiedSlots
    }
}

export { Player }
