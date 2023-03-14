import { FixedSizeArray } from '../../../util/types'

enum FaceIndex {
    Front = 0,
    Right = 1,
    Back = 2,
    Left = 3,
    Top = 4,
    Bottom = 5,
}

type Face = FixedSizeArray<6, Vertex>

type Vertex = {
    shade: number
    pos: [number, number, number]
    norm: [number, number, number]
    uv: [number, number]
}

class GeometryBuilder {
    public static faces = <const>{
        front: 0,
        right: 1,
        back: 2,
        left: 3,
        top: 4,
        bottom: 5,
    }

    public static getFace(faceIndex: FaceIndex) {
        return this.data.slice(faceIndex * 6, faceIndex * 6 + 6)
    }

    public static data: Vertex[] = [
        // front
        { shade: 1, pos: [-1, -1, 1], norm: [0, 0, 1], uv: [0, 1] },
        { shade: 1, pos: [1, -1, 1], norm: [0, 0, 1], uv: [1, 1] },
        { shade: 1, pos: [-1, 1, 1], norm: [0, 0, 1], uv: [0, 0] },

        { shade: 1, pos: [-1, 1, 1], norm: [0, 0, 1], uv: [0, 0] },
        { shade: 1, pos: [1, -1, 1], norm: [0, 0, 1], uv: [1, 1] },
        { shade: 1, pos: [1, 1, 1], norm: [0, 0, 1], uv: [1, 0] },
        // right
        { shade: 2, pos: [1, -1, 1], norm: [1, 0, 0], uv: [0, 1] },
        { shade: 2, pos: [1, -1, -1], norm: [1, 0, 0], uv: [1, 1] },
        { shade: 2, pos: [1, 1, 1], norm: [1, 0, 0], uv: [0, 0] },

        { shade: 2, pos: [1, 1, 1], norm: [1, 0, 0], uv: [0, 0] },
        { shade: 2, pos: [1, -1, -1], norm: [1, 0, 0], uv: [1, 1] },
        { shade: 2, pos: [1, 1, -1], norm: [1, 0, 0], uv: [1, 0] },
        // back
        { shade: 1, pos: [1, -1, -1], norm: [0, 0, -1], uv: [0, 1] },
        { shade: 1, pos: [-1, -1, -1], norm: [0, 0, -1], uv: [1, 1] },
        { shade: 1, pos: [1, 1, -1], norm: [0, 0, -1], uv: [0, 0] },

        { shade: 1, pos: [1, 1, -1], norm: [0, 0, -1], uv: [0, 0] },
        { shade: 1, pos: [-1, -1, -1], norm: [0, 0, -1], uv: [1, 1] },
        { shade: 1, pos: [-1, 1, -1], norm: [0, 0, -1], uv: [1, 0] },
        // left
        { shade: 2, pos: [-1, -1, -1], norm: [-1, 0, 0], uv: [0, 1] },
        { shade: 2, pos: [-1, -1, 1], norm: [-1, 0, 0], uv: [1, 1] },
        { shade: 2, pos: [-1, 1, -1], norm: [-1, 0, 0], uv: [0, 0] },

        { shade: 2, pos: [-1, 1, -1], norm: [-1, 0, 0], uv: [0, 0] },
        { shade: 2, pos: [-1, -1, 1], norm: [-1, 0, 0], uv: [1, 1] },
        { shade: 2, pos: [-1, 1, 1], norm: [-1, 0, 0], uv: [1, 0] },
        // top
        { shade: 0, pos: [1, 1, -1], norm: [0, 1, 0], uv: [0, 1] },
        { shade: 0, pos: [-1, 1, -1], norm: [0, 1, 0], uv: [1, 1] },
        { shade: 0, pos: [1, 1, 1], norm: [0, 1, 0], uv: [0, 0] },

        { shade: 0, pos: [1, 1, 1], norm: [0, 1, 0], uv: [0, 0] },
        { shade: 0, pos: [-1, 1, -1], norm: [0, 1, 0], uv: [1, 1] },
        { shade: 0, pos: [-1, 1, 1], norm: [0, 1, 0], uv: [1, 0] },
        // bottom
        { shade: 3, pos: [1, -1, 1], norm: [0, -1, 0], uv: [0, 1] },
        { shade: 3, pos: [-1, -1, 1], norm: [0, -1, 0], uv: [1, 1] },
        { shade: 3, pos: [1, -1, -1], norm: [0, -1, 0], uv: [0, 0] },

        { shade: 3, pos: [1, -1, -1], norm: [0, -1, 0], uv: [0, 0] },
        { shade: 3, pos: [-1, -1, 1], norm: [0, -1, 0], uv: [1, 1] },
        { shade: 3, pos: [-1, -1, -1], norm: [0, -1, 0], uv: [1, 0] },
    ]
}

export { FaceIndex, GeometryBuilder, Vertex }
export default GeometryBuilder
