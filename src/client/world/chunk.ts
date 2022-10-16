class Chunk {
    x: number
    z: number
    subchunks: number[][]

    constructor(x: number, z: number) {
        this.x = x
        this.z = z
        this.subchunks = Array(16)
    }

    set(x: number, y: number, z: number, block: number) {
        const sy = Math.floor(y / 16)
        if (!this.subchunks[sy]) this.subchunks[sy] = Array(4096).fill(0)
        const index = 16 * 16 * z + 16 * (y % 16) + x
        this.subchunks[sy][index] = block
    }
}
