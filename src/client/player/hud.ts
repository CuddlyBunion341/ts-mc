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

    addItem(itemName: string, index: number, count: number) {
        const item = document.createElement('div')
        item.classList.add('item')
        item.style.setProperty('--index', String(index))

        const img = document.createElement('img')
        img.src = `textures/items/${itemName}.webp`
        item.appendChild(img)

        const span = document.createElement('span')
        span.innerHTML = String(count)
        span.classList.add('count')
        item.appendChild(span)

        this.itemContainer.appendChild(item)
    }
}

const hud = new HudController()

export { hud }
