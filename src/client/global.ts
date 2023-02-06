import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'
import { Group, MeshBasicMaterial, Scene } from 'three'
import { Atlas } from './blocks/atlas'
import { textures } from './blocks/blocks'
import { ChunkFactory } from './world/chunk'
import { Terrain } from './world/terrain'

const atlas = new Atlas(textures)

const materialOptions = { map: atlas.texture, vertexColors: true }
const materials = {
    opaque: new MeshBasicMaterial(materialOptions),
    transparent: new MeshBasicMaterial({ ...materialOptions, transparent: true, opacity: 1 }),
}

const groups = {
    chunk: new Group(),
    entity: new Group(),
}

// init scene
const scene = new Scene()
scene.add(groups.chunk)
scene.add(groups.entity)

// init physics world
const physicsWorld = new CANNON.World()
physicsWorld.gravity.set(0, -1, 0) // -9.82 m/s²

const cannonDebugger = CannonDebugger(scene, physicsWorld, {
    color: 0xff00ff,
})

const factory = new ChunkFactory(groups.chunk, atlas.ranges)

const terrain = new Terrain(factory)
terrain.renderDistance = 16

export { scene, physicsWorld, cannonDebugger, atlas, materials, groups, terrain, factory }
