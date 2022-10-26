import { blockIDs } from '../blocks/blocks'

type GameMode = 'survival' | 'creative' | 'spectator'

interface Slot {
    index: number
    count: number
    itemID: number
}

class Player {
    gamemode: GameMode
    health: number
    inventory: Array<Slot | null>
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

    setItem(index: number, itemID: number, count: number): Slot | null {
        if (index < 0 || index >= 27) return null
        const slot = { itemID, count, index }
        return (this.inventory[index] = slot)
    }

    setItemCount(index: number, newCount: number) {
        if (index < 0 || index >= 27) return null

        if (newCount <= 0) {
            return (this.inventory[index] = null)
        }

        const slot = this.inventory[index]
        if (!slot) return null
        slot.count = newCount

        return slot
    }

    updateItemCount(index: number, delta: number) {
        const slot = this.getSlot(index)
        if (!slot) return 0

        slot.count = slot.count + delta

        if (slot.count == 0) {
            this.inventory[index] = null
        }

        return slot.count || 0
    }

    addItem(itemID: number) {
        for (let i = 0; i < 27; i++) {
            const slot = this.getSlot(i)
            if (slot && slot.itemID == itemID) {
                if (slot.count < 64) {
                    slot.count++
                    return i
                }
            }
        }
        for (let i = 0; i < 27; i++) {
            if (!this.getSlot(i)) {
                this.setItem(i, itemID, 1)
                return i
            }
        }
        return -1
    }

    addItems(itemID: number, count: number) {
        if (count <= 0) return []
        const modifiedSlots: number[] = []

        for (let i = 0; i < 27; i++) {
            const slot = this.getSlot(i)
            if (slot?.itemID == itemID) {
                const c = slot.count
                const diff = 64 - c
                const heap = Math.min(count, diff)
                count -= heap
                slot.count += heap
                modifiedSlots.push(i)
                if (count == 0) break
            }
        }

        for (let i = 0; i < 27; i++) {
            if (!this.getSlot(i)) {
                const heap = Math.min(64, count)
                count -= heap
                this.setItem(i, itemID, heap)
                modifiedSlots.push(i)
                if (count == 0) break
            }
        }
        return modifiedSlots
    }
}

export { Player, GameMode }
