class InventoryController {
    public hotbar: HTMLDivElement
    public hotbarItems: HTMLDivElement
    constructor() {
        this.hotbar = document.querySelector('.hotbar')!
        this.hotbarItems = document.querySelector('.hotbar .items')!
    }
}
