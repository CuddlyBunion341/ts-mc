import {
    BoxGeometry,
    Camera,
    DirectionalLightShadow,
    Mesh,
    MeshBasicMaterial,
    NearestFilter,
    Object3D,
    Quaternion,
    Raycaster,
    TextureLoader,
    Vector2,
    Vector3,
    WebGLObjects,
} from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { blockIDs, blocks, BlockSound } from '../blocks/blocks'
import { ParticleEmitter } from '../misc/particles'
import { SoundPlayer } from '../misc/soundPlayer'
import { Terrain } from '../world/terrain'
import { Outline } from './blockOutline'
import { hud } from '../hud/hud'
import { GameMode, Player } from './player'
import { World } from '../world/world'
import { timingSafeEqual } from 'crypto'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

interface PlayerOptions {
    camera: Camera
    terrain: Terrain
    chunkGroup: Object3D
    outline: Outline
    particleEmitter: ParticleEmitter
    soundPlayer: SoundPlayer
}

interface ControllerState {
    leftButton: boolean
    rightButton: boolean
    mouseX: number
    mouseY: number
    mouseDeltaX: number
    mouseDeltaY: number
}

class InputController {
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

        document.addEventListener('mousedown', (e) => this.onMouseDown(e), false)
        document.addEventListener('mouseup', (e) => this.onMouseUp(e), false)
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false)
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false)
        document.addEventListener('mousemove', (e) => this.onMouseMove(e), false)
    }

    onMouseDown(e: MouseEvent) {
        if (e.button == 0) this.current.leftButton = true
        else if (e.button == 2) this.current.rightButton = true
    }

    onMouseUp(e: MouseEvent) {
        if (e.button == 0) this.current.leftButton = false
        else if (e.button == 2) this.current.rightButton = false
    }

    onKeyDown(e: KeyboardEvent) {
        this.keys[e.code] = true
    }

    onKeyUp(e: KeyboardEvent) {
        this.keys[e.code] = false
    }

    onMouseMove(e: MouseEvent) {
        this.current.mouseX = e.pageX - window.innerWidth / 2
        this.current.mouseY = e.pageY - window.innerHeight / 2

        this.current.mouseDeltaX = this.current.mouseX - this.previous.mouseX
        this.current.mouseDeltaY = this.current.mouseY - this.previous.mouseY
    }

    update() {
        this.previous = { ...this.current }
        this.previousKeys = { ...this.keys }
    }
}

// class FirstPersonCamera {
//     camera: Camera
//     input: InputController
//     rotation: Quaternion
//     translation: Vector3
//     constructor(camera: Camera) {
//         this.camera = camera
//         this.input = new InputController()
//         this.rotation = new Quaternion()
//         this.translation = new Vector3()
//     }
// }

class PlayerController {
    private terrain: Terrain
    private raycaster = new Raycaster()
    private chunkGroup: Object3D
    private lastChunk: { x: number; z: number }
    private outline: Outline
    private particleEmitter: ParticleEmitter
    private soundPlayer: SoundPlayer
    private input = new InputController()

    width = 0.6
    length = 0.6
    height = 1.6
    cameraHeight = 1.2
    movementSpeed = 50
    verticalFlySpeed = 10
    horizontalFlySpeed = 200
    velocity = new Vector3(0, 0, 0)
    position = new Vector3(0, 0, 0)
    canJump = false
    flying = true

    controls: PointerLockControls
    player = new Player()
    camera: Camera

    // private steve: Object3D = new Object3D()

    constructor(options: PlayerOptions) {
        const { camera, terrain, chunkGroup, outline, particleEmitter, soundPlayer } = options

        this.raycaster.far = 6

        this.terrain = terrain
        this.camera = camera

        this.controls = new PointerLockControls(camera, document.body)
        document.body.addEventListener('click', () => this.controls.lock())

        this.particleEmitter = particleEmitter
        this.soundPlayer = soundPlayer
        this.chunkGroup = chunkGroup
        this.outline = outline

        // const loader = new GLTFLoader()
        // loader.load(
        //     'models/steve/steve.gltf',
        //     (gltf) => {
        //         const model = gltf.scene
        //         model.scale.set(0.06, 0.06, 0.06)
        //         model.position.y = -0.5
        //         this.chunkGroup.add(model)
        //         this.steve = model
        //         // make materials
        //         model.traverse((child) => {
        //             if (child instanceof Mesh) {
        //                 // child.material = new MeshBasicMaterial({ color: 0xffffff })
        //                 console.log(child.material)
        //                 child.material = new MeshBasicMaterial({ map: child.material.map })
        //             }
        //         })
        //         console.log(model)
        //     },
        //     (xhr) => {
        //         console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        //     },
        //     (error) => {
        //         console.error(error)
        //     }
        // )

        // place player
        while (true) {
            const { x, y, z } = new Vector3().copy(camera.position).addScalar(0.5).floor()
            if (terrain.getBlock(x, y, z) == 0) {
                camera.position.y -= 1
            } else {
                this.updatePosition(x, y + 1, z)
                this.lastChunk = { x, z }
                break
            }
        }

        for (let i = 0; i < 9; i++) {
            const slot = this.player.getSlot(i)
            if (!slot) continue

            const blockName = blocks[slot.itemID].name
            if (slot) hud.replaceSlot(i, blockName, slot.count)
        }

        // get chunk collider
        setTimeout(() => {
            this.terrain.updateCollider(this.position.x, this.position.x, this.position.z)
        }, 5000)
    }

    onMouseDown(e: MouseEvent) {
        if (e.button == 2) this.placeBlock()
        else this.breakBlock()
    }

    onMouseUp(e: MouseEvent) {}

    onKeyDown(e: KeyboardEvent) {
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
        if (e.code == 'Period') {
            // this.flying = !this.flying
        }
    }

    onWheel(e: WheelEvent) {
        const slot = (this.player.selectedSlot += e.deltaY > 0 ? 1 : -1 % 9)
        hud.setSelectedSlot(slot)
    }

    move(dx: number, dy: number, dz: number) {
        const { width, height, length: depth } = this
        const { x, y, z } = this.position
        const newPos = { x, y, z }

        newPos.x += dx
        newPos.y += dy
        newPos.z += dz

        this.updatePosition(newPos.x, newPos.y, newPos.z)
    }

    moveForward(delta: number) {
        const speed = this.flying ? this.horizontalFlySpeed : this.movementSpeed

        const directionVector = new Vector3()
        this.camera.getWorldDirection(directionVector)
        directionVector.y = 0
        directionVector.normalize()

        this.velocity.add(directionVector.multiplyScalar(speed * delta))
    }

    moveRight(delta: number) {
        const speed = this.flying ? this.horizontalFlySpeed : this.movementSpeed

        const directionVector = new Vector3()
        this.camera.getWorldDirection(directionVector)
        directionVector.y = 0
        directionVector.normalize()
        directionVector.cross(this.camera.up)
        this.velocity.add(directionVector.multiplyScalar(speed * delta))
    }

    moveUp(delta: number) {
        // this.velocity.add(new Vector3(0, this.movementSpeed, 0))
        // this.velocity.add(new Vector3(0, this.movementSpeed * delta, 0))
        this.move(0, delta * this.verticalFlySpeed, 0)
    }

    update(delta: number) {
        this.input.update()

        // rotate steve to face away from the camera
        // this.steve.rotation.y = this.camera.rotation.y + Math.PI
        // this.steve.rotation.set(
        //     this.camera.rotation.x,
        //     this.camera.rotation.y + Math.PI,
        //     this.camera.rotation.z
        // )

        // movement
        if (this.input.keys['KeyW']) this.moveForward(delta)
        if (this.input.keys['KeyS']) this.moveForward(-delta)
        if (this.input.keys['KeyD']) this.moveRight(delta)
        if (this.input.keys['KeyA']) this.moveRight(-delta)
        if (this.input.keys['Space']) {
            if (this.flying) {
                this.moveUp(delta)
            } else if (this.canJump) {
                this.velocity.y = 10
                this.canJump = false
            }
        }
        if (this.input.keys['ShiftLeft']) {
            if (this.flying) {
                this.moveUp(-delta)
            }
        }

        this.velocity.y -= 30 * delta

        if (this.flying) this.velocity.y = 0
        const { x: dx, y: dy, z: dz } = this.velocity
        this.move(dx * delta, dy * delta, dz * delta)

        this.canJump =
            this.terrain.getBlock(this.position.x, this.position.y - 0.2, this.position.z) != 0

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
        }

        this.velocity.multiply(new Vector3(0.9, 1, 0.9))

        this.particleEmitter.update(delta)
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

    updatePosition(x: number, y: number, z: number) {
        this.position.set(x, y, z)
        this.camera.position.set(x, y + this.cameraHeight, z)
        // this.camera.translateZ(10)
        // this.HEADDEBUG.position.set(x, y + this.cameraHeight, z)
        // this.BODYDEBUG.position.set(x, y, z)
        // this.steve.position.set(x, y + 0.5, z)
    }

    updatePositionVector(vector: Vector3) {
        this.position.set(vector.x, vector.y, vector.z)
        this.camera.position.set(vector.x, vector.y + this.cameraHeight, vector.z)
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

        const index = Math.floor(Math.random() * 4) + 1
        const soundName = `${sound}${index}`
        this.soundPlayer.playSound(soundName)
    }

    breakBlock() {
        const pos = this.castRay(true)
        if (!pos) return
        const { x, y, z } = pos
        const block = this.terrain.getBlock(x, y, z)
        if (!block) return
        this.terrain.setBlock(x, y, z, 0, true)

        // get dropped items
        const dropped = blocks[block].drops.reduce((acc: number[], v) => {
            if (Math.random() <= v.probability) {
                acc.push(v.itemID)
            }
            return acc
        }, [])

        this.playSound(blocks[block].soundGroup)

        // update hud
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

export { PlayerController }
