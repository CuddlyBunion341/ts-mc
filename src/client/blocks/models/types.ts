import { FixedSizeArray } from '../../../util/types'
import { Vertex } from './builder'

type ElementPosition = [number, number, number]

type CompiledElement = {
    vertices: Record<FaceName, Vertex[]>
}

type CompiledModel = {
    culling: FixedSizeArray<6, boolean>
    transparent: boolean
    vertices: Record<FaceName, Vertex[]>
}

type FaceName = 'north' | 'south' | 'west' | 'east' | 'up' | 'down'
type Face = {}
type Element = {
    from: [number, number, number]
    to: [number, number, number]
    faces: {
        [key in FaceName]?: Face
    }
}

type RotationAxis = 'x' | 'y' | 'z'
type RotationAngle = 0 | 90 | 180 | 270

export {
    ElementPosition,
    CompiledModel,
    FaceName,
    Face,
    Element,
    RotationAxis,
    RotationAngle,
    CompiledElement,
}
