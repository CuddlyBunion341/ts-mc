import {
    Clock,
    Color,
    Fog,
    Group,
    MeshBasicMaterial,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from 'three'
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'
import Stats from 'three/examples/jsm/libs/stats.module'

import { scene, physicsWorld } from './global'

import { Atlas } from './blocks/atlas'
import { blockSounds, textures } from './blocks/blocks'
import { EntityController } from './entities/entityController'
import { ParticleEmitter } from './misc/particles'
import { SoundPlayer } from './misc/soundPlayer'
import { Outline } from './player/blockOutline'
import { PlayerController } from './player/controller'
import { ChunkFactory } from './world/chunk'
import { Terrain } from './world/terrain'
import { World } from './world/world'

scene.background = new Color(0xf0f0f0) // 0x78a7ff
scene.fog = new Fog(0xf0f0f0, 64, 300) // 0xf0f0f0

const chunkGroup = new Group() // stores meshes of all chunks
scene.add(chunkGroup)

const entityGroup = new Group() // stores all entities
scene.add(entityGroup)

const atlas = new Atlas(textures)

const materialOptions = { map: atlas.texture, vertexColors: true }
const material1 = new MeshBasicMaterial(materialOptions) // opaque chunk material
const material2 = new MeshBasicMaterial({ ...materialOptions, transparent: true, opacity: 1 }) // transparent chunk material

const factory = new ChunkFactory(chunkGroup, atlas.ranges, material1, material2)

const terrain = new Terrain(factory)
terrain.renderDistance = 16

const entityController = new EntityController(entityGroup)
const world = new World(factory, entityController)

console.time('Chunk generation')
terrain.render(0, 0)
console.timeEnd('Chunk generation')

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(128, 100, 128)

const renderer = new WebGLRenderer({ logarithmicDepthBuffer: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)

const outline = new Outline()
scene.add(outline.mesh)
scene.add(outline.helper)

const particleEmitter = new ParticleEmitter(atlas, scene, camera)

const soundPlayer = new SoundPlayer('/sounds/', '.ogg')
const soundFiles = blockSounds.reduce((names: string[], current) => {
    if (current == 'none') return names
    for (let i = 1; i <= 4; i++) {
        names.push(`${current}${i}`)
    }
    return names
}, [])
soundPlayer.load(soundFiles)

const player = new PlayerController({
    camera,
    terrain,
    chunkGroup,
    outline,
    particleEmitter,
    soundPlayer,
})

document.addEventListener('keydown', (e) => player.onKeyDown(e))
document.addEventListener('mousedown', (e) => player.onMouseDown(e))
document.addEventListener('mouseup', (e) => player.onMouseUp(e))
document.addEventListener('keydown', (e) => player.onKeyDown(e))
document.addEventListener('keyup', (e) => player.onKeyUp(e))
document.addEventListener('wheel', (e) => player.onWheel(e))

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
})

// CANNON

const groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Plane(),
    position: new CANNON.Vec3(96, 70, 96),
})

// add a cube to the ground
const cubeShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))
const cubeBody = new CANNON.Body({
    mass: 1,
    shape: cubeShape,
    position: new CANNON.Vec3(96, 100, 96),
})

physicsWorld.addBody(cubeBody)

groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
physicsWorld.addBody(groundBody)

const stats = Stats()
document.body.appendChild(stats.dom)

const clock = new Clock()

const cannonDebugger = CannonDebugger(scene, physicsWorld, {
    color: 0x00ff00,
})

function animate() {
    requestAnimationFrame(animate)
    const delta = clock.getDelta()
    player.update(delta)
    world.update(delta)
    physicsWorld.step(delta)
    cannonDebugger.update()
    render()
    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()
