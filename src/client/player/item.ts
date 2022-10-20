class Item {
    name: string
    dom: HTMLElement
    static parentContainer: HTMLElement
    constructor(name: string) {
        this.name = name
        this.dom = document.createElement('div')
    }
}
