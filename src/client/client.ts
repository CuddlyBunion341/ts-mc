import { Group, MeshNormalMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { Chunk } from './world/chunk'
import { Terrain } from './world/terrain'

const scene = new Scene()

const chunkGroup = new Group()
scene.add(chunkGroup)
Chunk.parentGroup = chunkGroup

const material = new MeshNormalMaterial()
Chunk.material = material

const terrain = new Terrain()

for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
        const chunk = terrain.createChunk(i, j)
        requestIdleCallback(() => chunk?.build())
    }
}

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(200, 200, 200)

const renderer = new WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
    stats.update()
}

function render() {
    renderer.render(scene, camera)
}
animate()
