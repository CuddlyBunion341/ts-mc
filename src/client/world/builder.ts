import { AtlasRanges } from '../blocks/atlas'

const data = [
    // front
    { pos: [-1, -1, 1], norm: [0, 0, 1], uv: [0, 1] },
    { pos: [1, -1, 1], norm: [0, 0, 1], uv: [1, 1] },
    { pos: [-1, 1, 1], norm: [0, 0, 1], uv: [0, 0] },

    { pos: [-1, 1, 1], norm: [0, 0, 1], uv: [0, 0] },
    { pos: [1, -1, 1], norm: [0, 0, 1], uv: [1, 1] },
    { pos: [1, 1, 1], norm: [0, 0, 1], uv: [1, 0] },
    // right
    { pos: [1, -1, 1], norm: [1, 0, 0], uv: [0, 1] },
    { pos: [1, -1, -1], norm: [1, 0, 0], uv: [1, 1] },
    { pos: [1, 1, 1], norm: [1, 0, 0], uv: [0, 0] },

    { pos: [1, 1, 1], norm: [1, 0, 0], uv: [0, 0] },
    { pos: [1, -1, -1], norm: [1, 0, 0], uv: [1, 1] },
    { pos: [1, 1, -1], norm: [1, 0, 0], uv: [1, 0] },
    // back
    { pos: [1, -1, -1], norm: [0, 0, -1], uv: [0, 1] },
    { pos: [-1, -1, -1], norm: [0, 0, -1], uv: [1, 1] },
    { pos: [1, 1, -1], norm: [0, 0, -1], uv: [0, 0] },

    { pos: [1, 1, -1], norm: [0, 0, -1], uv: [0, 0] },
    { pos: [-1, -1, -1], norm: [0, 0, -1], uv: [1, 1] },
    { pos: [-1, 1, -1], norm: [0, 0, -1], uv: [1, 0] },
    // left
    { pos: [-1, -1, -1], norm: [-1, 0, 0], uv: [0, 1] },
    { pos: [-1, -1, 1], norm: [-1, 0, 0], uv: [1, 1] },
    { pos: [-1, 1, -1], norm: [-1, 0, 0], uv: [0, 0] },

    { pos: [-1, 1, -1], norm: [-1, 0, 0], uv: [0, 0] },
    { pos: [-1, -1, 1], norm: [-1, 0, 0], uv: [1, 1] },
    { pos: [-1, 1, 1], norm: [-1, 0, 0], uv: [1, 0] },
    // top
    { pos: [1, 1, -1], norm: [0, 1, 0], uv: [0, 1] },
    { pos: [-1, 1, -1], norm: [0, 1, 0], uv: [1, 1] },
    { pos: [1, 1, 1], norm: [0, 1, 0], uv: [0, 0] },

    { pos: [1, 1, 1], norm: [0, 1, 0], uv: [0, 0] },
    { pos: [-1, 1, -1], norm: [0, 1, 0], uv: [1, 1] },
    { pos: [-1, 1, 1], norm: [0, 1, 0], uv: [1, 0] },
    // bottom
    { pos: [1, -1, 1], norm: [0, -1, 0], uv: [0, 1] },
    { pos: [-1, -1, 1], norm: [0, -1, 0], uv: [1, 1] },
    { pos: [1, -1, -1], norm: [0, -1, 0], uv: [0, 0] },

    { pos: [1, -1, -1], norm: [0, -1, 0], uv: [0, 0] },
    { pos: [-1, -1, 1], norm: [0, -1, 0], uv: [1, 1] },
    { pos: [-1, -1, -1], norm: [0, -1, 0], uv: [1, 0] },
]

function getGeometryData(
    x: number,
    y: number,
    z: number,
    faces: boolean[],
    textures: string[],
    ranges: AtlasRanges
) {
    const positions = []
    const normals = []
    const uvs = []
    const colors = []
    for (let i = 0; i < 6; i++) {
        if (!faces[i]) continue
        for (let j = 0; j < 6; j++) {
            const vertex = data[i * 6 + j]
            positions.push(...vertex.pos.map((v, i) => v / 2 + [x, y, z][i]))
            normals.push(...vertex.norm)

            const { u1, v1, u2, v2 } = ranges.get(textures[i]) || { u1: 0, u2: 1, v1: 0, v2: 1 }
            let [u, v] = vertex.uv
            u = u ? u2 : u1
            v = v ? v2 : v1

            uvs.push(u, v)
            colors.push(1, 1, 1)
        }
    }
    return { positions, normals, uvs, colors }
}

export { getGeometryData }
