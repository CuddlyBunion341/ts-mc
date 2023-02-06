class InventoryController {
    hotbar: HTMLDivElement
    hotbarItems: HTMLDivElement
    constructor() {
        this.hotbar = document.querySelector('.hotbar')!
        this.hotbarItems = document.querySelector('.hotbar .items')!
    }
}
