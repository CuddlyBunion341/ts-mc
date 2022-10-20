class HudController {
    waterOverlay: HTMLElement
    hearts: HTMLElement[]
    hunger: HTMLElement[]
    selectedSlot: HTMLElement
    itemContainer: HTMLElement

    constructor() {
        this.waterOverlay = document.querySelector('.water-overlay')!
        this.selectedSlot = document.querySelector('.selected')!
        this.itemContainer = document.querySelector('.items')!

        const healthbar = document.querySelector('.healthbar')!
        this.hearts = Array(10)
            .fill(null)
            .map(() => {
                const heart = document.createElement('img')
                heart.classList.add('heart')
                return healthbar.appendChild(heart)
            })

        const hungerbar = document.querySelector('.hungerbar')!
        this.hunger = Array(10)
            .fill(null)
            .map(() => {
                const food = document.createElement('img')
                food.classList.add('hunger')
                return hungerbar.appendChild(food)
            })
    }

    showWaterOverlay() {
        this.waterOverlay.style.setProperty('display', 'block')
    }

    hideWaterOverlay() {
        this.waterOverlay.style.setProperty('display', 'none')
    }

    setSelectedSlot(index: number) {
        if (index < 0 || index > 8) return
        this.selectedSlot.style.setProperty('--index', String(index))
    }

    getItem(index: number): HTMLElement | null {
        return document.querySelector(`.item[data-index='${index}']`)
    }

    // Items
    addItem(itemName: string, index: number, count: number) {
        const item = document.createElement('div')
        item.classList.add('item')
        item.style.setProperty('--index', String(index))
        item.dataset.index = String(index)

        const img = document.createElement('img')
        img.src = `textures/items/${itemName}.webp`
        item.appendChild(img)

        const span = document.createElement('span')
        span.innerHTML = String(count)
        span.classList.add('count')
        item.appendChild(span)

        this.itemContainer.appendChild(item)
    }

    hideItem(index: number) {
        const item = this.getItem(index)
        item?.style.setProperty('display', 'none')
    }

    showItem(index: number) {
        const item = this.getItem(index)
        item?.style.setProperty('display', 'block')
    }

    replaceItem(index: number, name: string, count: number) {
        const item = this.getItem(index)
        if (!item) return

        const span = item.querySelector('.count')!
        span.innerHTML = String(count)

        const img = item.querySelector('img')!
        img.src = `textures/items/${name}.webp`
    }

    setItemName(index: number, name: string) {
        const item = this.getItem(index)
        if (!item) return

        const img = item.querySelector('img')!
        img.src = `textures/items/${name}.webp`
    }

    setItemCount(index: number, count: number) {
        const item = this.getItem(index)
        if (!item) return

        if (count <= 0) {
            item.parentElement?.removeChild(item)
        }

        const span = item.querySelector('.count')!
        span.innerHTML = String(count)
    }

    setItemIndex(index: number, newIndex: number) {
        const item = this.getItem(index)
        if (!item) return

        item.style.setProperty('index', String(newIndex))
        item.dataset.index = String(newIndex)
    }
}

const hud = new HudController()

export { hud }
