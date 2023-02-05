import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger'
import { Scene } from 'three'

// init scene
const scene = new Scene()

// init physics world
const physicsWorld = new CANNON.World()
physicsWorld.gravity.set(0, -9.82, 0)

const cannonDebugger = CannonDebugger(scene, physicsWorld, {
    color: 0x00ff00,
})

export { scene, physicsWorld, cannonDebugger }
