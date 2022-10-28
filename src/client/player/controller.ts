import { Camera, Object3D, Raycaster, Vector2, Vector3, WebGLObjects } from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { blockIDs, blocks, BlockSound } from '../blocks/blocks'
import { ParticleEmitter } from '../misc/particles'
import { SoundPlayer } from '../misc/soundPlayer'
import { Terrain } from '../world/terrain'
import { Outline } from './blockOutline'
import { hud } from './hud'
import { GameMode, Player } from './player'

interface PlayerOptions {
    camera: Camera
    terrain: Terrain
    chunkGroup: Object3D
    outline: Outline
    particleEmitter: ParticleEmitter
    soundPlayer: SoundPlayer
}

class PlayerController {
    private terrain: Terrain
    private pressedKeys: Record<string, boolean>
    private raycaster: Raycaster
    private chunkGroup: any
    private lastChunk: { x: number; z: number }
    private outline: Outline
    private particleEmitter: ParticleEmitter
    private soundPlayer: SoundPlayer

    width: number
    length: number
    height: number
    movementSpeed: number
    camera: Camera
    controls: PointerLockControls
    velocity: Vector3
    player: Player

    constructor(options: PlayerOptions) {
        const { camera, terrain, chunkGroup, outline, particleEmitter, soundPlayer } = options

        this.width = 0.6
        this.length = 0.6
        this.height = 1.8

        this.terrain = terrain
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
        this.particleEmitter = particleEmitter
        this.soundPlayer = soundPlayer

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
                hud.replaceSlot(i, blocks[slot.itemID].name, slot.count)
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

        let matches
        if ((matches = /Digit(\d)/.exec(e.code))) {
            const digit = Number(matches[1]) - 1
            const slot = digit
            if (slot >= 0 && slot < 9) {
                hud.setSelectedSlot(digit)
                this.player.selectedSlot = slot
            }
        }
    }
    onKeyUp(e: KeyboardEvent) {
        this.pressedKeys[e.code] = false
    }

    onWheel(e: WheelEvent) {
        const slot = (this.player.selectedSlot += e.deltaY > 0 ? 1 : -1 % 9)
        hud.setSelectedSlot(slot)
    }

    move(dx: number, dy: number, dz: number) {
        let { x, y, z } = this.camera.position
        let newPos = { x, y, z }

        const floor = (x: number, y: number, z: number) => new Vector3(x, y, z).floor().toArray()

        if (this.terrain.getBlock(...floor(x + dx, y, z)) == 0) {
            newPos.x += dx
        }

        if (this.terrain.getBlock(...floor(x, y + dy, z)) == 0) {
            newPos.y += dy
        }

        if (this.terrain.getBlock(...floor(x, y, z + dz)) == 0) {
            newPos.z += dz
        }

        this.camera.position.set(newPos.x, newPos.y, newPos.z)
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

        this.particleEmitter.update(delta)
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

    get gamemode() {
        return this.player.gamemode
    }

    set gamemode(gamemode: GameMode) {
        this.player.gamemode = gamemode
        if (gamemode != 'survival') {
            hud.hideSurvivalHUD()
        } else {
            hud.showSurvivalHUD()
        }
    }

    placeBlock() {
        const pos = this.castRay(false)
        if (!pos) return
        const { x, y, z } = pos
        const slot = this.player.getSelectedSlot()
        if (!slot) return

        this.playSound(blocks[slot.itemID].soundGroup)

        this.terrain.setBlock(x, y, z, slot.itemID, true)

        const count = this.player.updateItemCount(slot.index, -1)

        hud.replaceSlot(slot.index, blocks[slot.itemID].name, count)
    }

    playSound(sound: BlockSound) {
        if (sound == 'none') return

        let index = Math.floor(Math.random() * 4) + 1
        let soundName = `${sound}${index}`
        this.soundPlayer.playSound(soundName)
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

            this.playSound(blocks[block].soundGroup)

            for (const drop of dropped) {
                const index = this.player.addItem(drop) || 0
                if (index < 9 && index >= 0) {
                    const slot = this.player.getSlot(index)
                    if (slot) hud.replaceSlot(index, blocks[slot.itemID].name, slot.count)
                }
            }

            // emit particles
            for (let i = 0; i < 10; i++) {
                const [px, py, pz] = [
                    x + Math.random() - 0.5,
                    y + Math.random() - 0.5,
                    z + Math.random() - 0.5,
                ]
                const texture = blocks[block].model.elements[0].textures[0]
                this.particleEmitter.emitParticle(px, py, pz, texture)
            }
        }
    }
}

export { PlayerController }
