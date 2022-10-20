import { Camera, Object3D, Raycaster, Vector2, Vector3 } from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { blockIDs, blocks } from '../blocks/blocks'
import { Terrain } from '../world/terrain'
import { Outline } from './blockOutline'
import { hud } from './hud'
import { Player } from './player'

class PlayerController {
    private terrain: Terrain
    private pressedKeys: Record<string, boolean>
    private raycaster: Raycaster
    private chunkGroup: any
    private lastChunk: { x: number; z: number }
    width: number
    length: number
    height: number
    movementSpeed: number
    camera: Camera
    controls: PointerLockControls
    velocity: Vector3
    player: Player
    outline: Outline
    constructor(camera: Camera, terrain: Terrain, chunkGroup: Object3D, outline: Outline) {
        this.terrain = terrain
        this.width = 0.6
        this.length = 0.6
        this.height = 1.8
        this.movementSpeed = 20
        this.pressedKeys = {}
        this.camera = camera
        this.velocity = new Vector3(0, 0, 0)
        this.controls = new PointerLockControls(camera, document.body)
        document.body.addEventListener('click', () => this.controls.lock())
        this.raycaster = new Raycaster()
        this.chunkGroup = chunkGroup
        this.outline = outline
        this.player = new Player()

        // place player
        while (true) {
            const { x, y, z } = new Vector3().copy(camera.position).addScalar(0.5).floor()
            if (terrain.getBlock(x, y, z) == 0) {
                camera.position.y -= 1
            } else {
                camera.position.set(x, y + 2.3, z)
                this.lastChunk = { x, z }
                break
            }
        }

        for (let i = 0; i < 9; i++) {
            const slot = this.player.getSlot(i)
            if (slot) {
                hud.addItem(blocks[slot.itemID].name, i, slot.count)
            }
        }
    }

    onMouseDown(e: MouseEvent) {
        if (e.button == 2) this.placeBlock()
        else this.breakBlock()
    }
    onMouseUp(e: MouseEvent) {}
    onKeyDown(e: KeyboardEvent) {
        this.pressedKeys[e.code] = true

        if (!isNaN(Number(e.key))) {
            const slot = Number(e.key) - 1
            if (slot >= 0 && slot < 9) {
                hud.setSelectedSlot(Number(e.key) - 1)
                this.player.selectedSlot = slot
            }
        }
    }
    onKeyUp(e: KeyboardEvent) {
        this.pressedKeys[e.code] = false
    }

    update(delta: number) {
        if (this.pressedKeys['KeyW']) this.controls.moveForward(delta * this.movementSpeed)
        if (this.pressedKeys['KeyS']) this.controls.moveForward(delta * -this.movementSpeed)
        if (this.pressedKeys['KeyD']) this.controls.moveRight(delta * this.movementSpeed)
        if (this.pressedKeys['KeyA']) this.controls.moveRight(delta * -this.movementSpeed)
        if (this.pressedKeys['Space']) this.camera.position.y += delta * this.movementSpeed
        if (this.pressedKeys['ShiftLeft']) this.camera.position.y -= delta * this.movementSpeed

        const position = this.castRay(true)
        if (position) {
            const { x, y, z } = position
            this.outline.moveTo(x, y, z)
        } else this.outline.moveOut()

        // water
        const { x, y, z } = new Vector3().copy(this.camera.position).addScalar(0.5).floor()
        if (this.terrain.getBlock(x, y, z) == blockIDs.get('water')) {
            hud.showWaterOverlay()
        } else hud.hideWaterOverlay()

        const chunkX = Math.floor(x / 16)
        const chunkZ = Math.floor(z / 16)

        if (chunkX != this.lastChunk.x || chunkZ != this.lastChunk.z) {
            // render new chunks
            this.lastChunk.x = chunkX
            this.lastChunk.z = chunkZ
            for (let i = -8; i <= 8; i++) {
                for (let j = -8; j <= 8; j++) {
                    this.terrain.createChunk(i + chunkX, j + chunkZ)
                }
            }
            for (let i = -7; i < 8; i++) {
                for (let j = -7; j < 8; j++) {
                    const cx = i + chunkX
                    const cz = j + chunkZ
                    const chunk = this.terrain.getChunk(cx, cz)
                    if (chunk?.meshes.length == 0) {
                        chunk.setNeigbors(
                            this.terrain.getChunk(cx, cz + 1),
                            this.terrain.getChunk(cx, cz - 1),
                            this.terrain.getChunk(cx + 1, cz),
                            this.terrain.getChunk(cx - 1, cz)
                        )
                        requestIdleCallback(() => chunk.build())
                    }
                }
            }
        }
    }

    testCollision(dx: number, dy: number, dz: number) {
        return false
    }

    castRay(inside = true) {
        this.raycaster.setFromCamera(new Vector2(0, 0), this.camera)
        const intersect = this.raycaster.intersectObjects(this.chunkGroup.children)[0]
        if (intersect?.face) {
            const norm = intersect.face.normal.divideScalar(2).multiplyScalar(inside ? -1 : 1)
            return new Vector3().copy(intersect.point).add(norm).addScalar(0.5).floor()
        }
    }

    placeBlock() {
        const pos = this.castRay(false)
        if (!pos) return
        const { x, y, z } = pos
        const slot = this.player.getSelectedSlot()
        const index = this.player.selectedSlot
        const count = this.player.updateItemCount(index, -1)
        if (count > 0) this.terrain.setBlock(x, y, z, slot.itemID, true)
        hud.setItemCount(index, slot.count)
    }
    breakBlock() {
        const pos = this.castRay(true)
        if (!pos) return
        const { x, y, z } = pos
        const block = this.terrain.getBlock(x, y, z)
        if (block) {
            this.terrain.setBlock(x, y, z, 0, true)
            const dropped = blocks[block].drops.reduce((acc: number[], v) => {
                if (Math.random() <= v.probability) {
                    acc.push(v.itemID)
                }
                return acc
            }, [])

            const modifiedSlots: number[] = []
            for (const drop of dropped) {
                modifiedSlots.push(...this.player.addItem(drop, 1))
            }

            for (const index of [...new Set(modifiedSlots)]) {
                if (index < 9) {
                    const slot = this.player.getSlot(index)

                    hud.replaceItem(index, blocks[slot.itemID].name, slot.count)
                }
            }
        }
    }
}

export { PlayerController }
