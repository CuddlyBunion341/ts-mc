import { AtlasRanges } from '../blocks/atlas'

const data = [
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

            const shade = [1, 0.8, 0.5, 0.3][vertex.shade]
            colors.push(shade, shade, shade)
        }
    }
    return { positions, normals, uvs, colors }
}

export { getGeometryData }
