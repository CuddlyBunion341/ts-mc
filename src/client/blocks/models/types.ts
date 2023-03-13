type CompiledModel = {
    culling: FixedSizeArray<boolean, 6>
    faces: [Face[], Face[], Face[], Face[], Face[], Face[]]
    transparent: boolean
    shady: boolean
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
