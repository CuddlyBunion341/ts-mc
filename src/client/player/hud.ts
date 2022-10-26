class InventorySlot {
    private _index: number
    private _count: number
    private _name: string

    container: HTMLDivElement
    image: HTMLImageElement
    span: HTMLSpanElement

    static parentElement: HTMLElement
    constructor(index: number, name: string, count: number) {
        this._index = index
        this._name = name
        this._count = count

        this.container = document.createElement('div')
        this.container.classList.add('item')
        this.image = document.createElement('img')
        this.span = document.createElement('span')
        this.span.classList.add('count')

        this.index = index
        this.name = name
        this.count = count

        this.container.appendChild(this.image)
        this.container.appendChild(this.span)

        InventorySlot.parentElement.appendChild(this.container)
    }

    remove() {
        const parent = this.container.parentElement!
        parent.removeChild(this.container)
    }

    set count(count: number) {
        this._count = count
        this.span.innerHTML = String(count)
    }

    set index(index: number) {
        this._index = index
        this.container.style.setProperty('--index', String(index))
    }

    set name(name: string) {
        this._name = name
        this.image.src = `textures/items/${name}.webp`
    }

    get count() {
        return this._count
    }

    get index() {
        return this._index
    }

    get name() {
        return this._name
    }
}

class HudController {
    waterOverlay: HTMLImageElement
    bubblebar: HTMLDivElement
    hungerbar: HTMLDivElement
    healthbar: HTMLDivElement
    hearts: HTMLImageElement[]
    hunger: HTMLImageElement[]
    bubbles: HTMLImageElement[]
    selectedSlot: HTMLImageElement
    itemContainer: HTMLDivElement
    slots: Array<InventorySlot | null>

    constructor() {
        this.waterOverlay = document.querySelector('.water-overlay')!
        this.selectedSlot = document.querySelector('.selected')!
        this.itemContainer = document.querySelector('.items')!

        this.slots = Array(27).fill(null)
        InventorySlot.parentElement = this.itemContainer

        this.bubblebar = document.querySelector('.bubblebar')!
        this.bubbles = Array(10)
            .fill(null)
            .map(() => {
                const bubble = document.createElement('img')
                bubble.classList.add('bubble')
                return this.bubblebar.appendChild(bubble)
            })

        this.healthbar = document.querySelector('.healthbar')!
        this.hearts = Array(10)
            .fill(null)
            .map(() => {
                const heart = document.createElement('img')
                heart.classList.add('heart')
                return this.healthbar.appendChild(heart)
            })

        this.hungerbar = document.querySelector('.hungerbar')!
        this.hunger = Array(10)
            .fill(null)
            .map(() => {
                const food = document.createElement('img')
                food.classList.add('hunger')
                return this.hungerbar.appendChild(food)
            })
    }

    showSurvivalHUD() {
        this.bubblebar.style.display = 'inline-flex'
        this.healthbar.style.display = 'inline-flex'
        this.hungerbar.style.display = 'inline-flex'
    }

    hideSurvivalHUD() {
        this.bubblebar.style.display = 'none'
        this.healthbar.style.display = 'none'
        this.hungerbar.style.display = 'none'
    }

    showWaterOverlay() {
        this.waterOverlay.style.setProperty('display', 'block')
        this.bubblebar.style.setProperty('display', 'inline-flex')
    }

    hideWaterOverlay() {
        this.waterOverlay.style.setProperty('display', 'none')
        this.bubblebar.style.setProperty('display', 'none')
    }

    setSelectedSlot(index: number) {
        if (index < 0 || index > 8) return
        this.selectedSlot.style.setProperty('--index', String(index))
    }

    replaceSlot(index: number, name: string, count: number) {
        if (count <= 0) {
            this.slots[index]?.remove()
            this.slots[index] = null
            return null
        }

        let slot
        if ((slot = this.getSlot(index))) {
            slot.name = name
            slot.count = count
        } else {
            slot = new InventorySlot(index, name, count)
            this.slots[index] = slot
        }
        return slot
    }

    moveSlot(index: number, newIndex: number) {
        if (index == newIndex) return
        const slot = this.getSlot(index)
        if (!slot) return
        slot.index = newIndex
        this.slots[index] = null
        this.slots[newIndex] = slot
    }

    getSlot(index: number) {
        return this.slots[index]
    }
}

const hud = new HudController()

export { hud }
