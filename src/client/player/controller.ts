import { Terrain } from '../world/terrain'

class PlayerController {
    terrain: Terrain
    width: number
    length: number
    height: number
    pressedKeys: Record<string, boolean>
    constructor(terrain: Terrain) {
        this.terrain = terrain
        this.width = 0.6
        this.length = 0.6
        this.height = 1.8
        this.pressedKeys = {}
    }

    // events
    onMouseDown(e: MouseEvent) {}
    onMouseUp(e: MouseEvent) {}
    onKeyDown(e: KeyboardEvent) {
        this.pressedKeys[e.code] = true
    }
    onKeyUp(e: KeyboardEvent) {
        this.pressedKeys[e.code] = false
    }

    update(delta: number) {}

    castRay() {}
    placeBlock() {}
    breakBlock() {}
}

export { PlayerController }
