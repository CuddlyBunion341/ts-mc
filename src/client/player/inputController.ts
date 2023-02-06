interface ControllerState {
    leftButton: boolean
    rightButton: boolean
    mouseX: number
    mouseY: number
    mouseDeltaX: number
    mouseDeltaY: number
}

class InputController {
    private events: Record<string, Function[]>

    current: ControllerState
    previous: ControllerState
    keys: Record<string, boolean>
    previousKeys: Record<string, boolean>

    constructor() {
        this.current = {
            leftButton: false,
            rightButton: false,
            mouseX: 0,
            mouseY: 0,
            mouseDeltaX: 0,
            mouseDeltaY: 0,
        }
        this.previous = { ...this.current }
        this.keys = {}
        this.previousKeys = {}
        this.events = {}

        document.addEventListener('mousedown', (e) => this.onMouseDown(e), false)
        document.addEventListener('mouseup', (e) => this.onMouseUp(e), false)
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false)
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false)
        document.addEventListener('mousemove', (e) => this.onMouseMove(e), false)
    }

    onMouseDown(e: MouseEvent) {
        if (e.button == 0) this.current.leftButton = true
        else if (e.button == 2) this.current.rightButton = true
        this.emit('mousedown', e)
    }

    onMouseUp(e: MouseEvent) {
        if (e.button == 0) this.current.leftButton = false
        else if (e.button == 2) this.current.rightButton = false
        this.emit('mouseup', e)
    }

    onKeyDown(e: KeyboardEvent) {
        this.keys[e.code] = true
        this.emit('keydown', e)
    }

    onKeyUp(e: KeyboardEvent) {
        this.keys[e.code] = false
        this.emit('keyup', e)
    }

    onMouseMove(e: MouseEvent) {
        this.current.mouseX = e.pageX - window.innerWidth / 2
        this.current.mouseY = e.pageY - window.innerHeight / 2

        this.current.mouseDeltaX = this.current.mouseX - this.previous.mouseX
        this.current.mouseDeltaY = this.current.mouseY - this.previous.mouseY
        this.emit('mousemove', e)
    }

    isKeyDown(key: string) {
        return this.keys[key]
    }

    on(event: string, callback: (e: any) => void) {
        if (!this.events[event]) this.events[event] = []
        this.events[event].push(callback)
    }

    emit(event: string, e: any) {
        if (!this.events[event]) return
        this.events[event].forEach((callback) => callback(e))
    }

    update() {
        this.previous = { ...this.current }
        this.previousKeys = { ...this.keys }
    }
}

export { InputController }
