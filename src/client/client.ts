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
import Stats from 'three/examples/jsm/libs/stats.module'
import { Atlas } from './blocks/atlas'
import { textures } from './blocks/blocks'
import { ParticleEmitter } from './misc/particles'
import { Outline } from './player/blockOutline'
import { PlayerController } from './player/controller'
import { ChunkFactory } from './world/chunk'
import { Terrain } from './world/terrain'

const scene = new Scene()
scene.background = new Color(0x78a7ff)
scene.fog = new Fog(0xf0f0f0, 64, 300)

const chunkGroup = new Group()
scene.add(chunkGroup)

const atlas = new Atlas(textures)

const materialOptions = { map: atlas.texture, vertexColors: true }
const material1 = new MeshBasicMaterial(materialOptions)
const material2 = new MeshBasicMaterial({ ...materialOptions, transparent: true, opacity: 0.8 })

const factory = new ChunkFactory(chunkGroup, atlas.ranges, material1, material2)

const terrain = new Terrain(factory)

const renderDistance = 16

console.time('Chunk generation')
// todo: move to terrain class
for (let i = -1; i <= renderDistance; i++) {
    for (let j = -1; j <= renderDistance; j++) {
        terrain.createChunk(i, j)
    }
}

for (let i = 0; i < renderDistance; i++) {
    for (let j = 0; j < renderDistance; j++) {
        const chunk = terrain.getChunk(i, j)
        chunk?.setNeigbors(
            terrain.getChunk(i, j + 1),
            terrain.getChunk(i, j - 1),
            terrain.getChunk(i + 1, j),
            terrain.getChunk(i - 1, j)
        )
        requestIdleCallback(() => chunk?.build())
    }
}

console.timeEnd('Chunk generation')

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(200, 200, 200)

const renderer = new WebGLRenderer({ logarithmicDepthBuffer: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)

const outline = new Outline()
scene.add(outline.mesh)
scene.add(outline.helper)

const particleEmitter = new ParticleEmitter(atlas, scene, camera)

const player = new PlayerController(camera, terrain, chunkGroup, outline, particleEmitter)
document.addEventListener('keydown', (e) => player.onKeyDown(e))
document.addEventListener('mousedown', (e) => player.onMouseDown(e))
document.addEventListener('mouseup', (e) => player.onMouseUp(e))
document.addEventListener('keydown', (e) => player.onKeyDown(e))
document.addEventListener('keyup', (e) => player.onKeyUp(e))

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
})

const stats = Stats()
document.body.appendChild(stats.dom)

const clock = new Clock()

function animate() {
    requestAnimationFrame(animate)
    player.update(clock.getDelta())
    render()
    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()
