import { Clock, Group, MeshMatcapMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { Atlas } from './blocks/atlas'
import { textures } from './blocks/blocks'
import { PlayerController } from './player/controller'
import { Chunk } from './world/chunk'
import { Terrain } from './world/terrain'

const scene = new Scene()

const chunkGroup = new Group()
scene.add(chunkGroup)
Chunk.parentGroup = chunkGroup

const atlas = new Atlas(textures)
Chunk.atlasRanges = atlas.ranges

const material = new MeshMatcapMaterial({ map: atlas.texture })
Chunk.material = material

const terrain = new Terrain()

console.time('Chunk generation')
for (let i = -1; i < 31; i++) {
    for (let j = -1; j < 31; j++) {
        terrain.createChunk(i, j)
    }
}

for (let i = 0; i < 30; i++) {
    for (let j = 0; j < 30; j++) {
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

const player = new PlayerController(terrain, camera)
document.addEventListener('keydown', (e) => player.onKeyDown(e))
document.addEventListener('mousedown', (e) => player.onMouseDown(e))
document.addEventListener('mouseup', (e) => player.onMouseUp(e))
document.addEventListener('keydown', (e) => player.onKeyDown(e))
document.addEventListener('keyup', (e) => player.onKeyUp(e))

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

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
