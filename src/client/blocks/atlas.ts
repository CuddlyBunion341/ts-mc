import { LinearFilter, NearestFilter, Texture } from 'three'

interface AtlasRange {
    x: number
    y: number
    u1: number
    v1: number
    u2: number
    v2: number
}

type AtlasRanges = Map<string, AtlasRange>

class Atlas {
    names: string[]
    size: number
    ranges: AtlasRanges
    texture: Texture

    constructor(texturesNames: string[]) {
        this.names = texturesNames
        this.size = Atlas.calculateSize(texturesNames.length)
        this.ranges = Atlas.calculateRanges(texturesNames, this.size)

        this.texture = Atlas.createTexture()

        Atlas.loadImages(texturesNames).then((images) => {
            const url = Atlas.combineImages(images, 16, this.size)
            Atlas.updateTexture(this.texture, url)
        })
    }

    static calculateSize(itemCount: number) {
        let size = 0
        while (++size * size < itemCount || !(size % 2 == 0 || size % 5 == 0));
        return size
    }

    static calculateRanges(textureNames: string[], size: number): AtlasRanges {
        const positions: AtlasRanges = new Map()
        const frac = 1 / size
        for (let i = 0; i < textureNames.length; i++) {
            const x = i % size
            const y = Math.floor(i / size)
            const u1 = x * frac
            const v1 = (size - y) * frac
            const u2 = (x + 1) * frac
            const v2 = (size - y - 1) * frac
            positions.set(textureNames[i], { x, y, u1, v1, u2, v2 })
        }
        return positions
    }

    static loadImages(
        fileNames: string[],
        root = 'textures/block/',
        ext = '.png'
    ): Promise<HTMLImageElement[]> {
        return new Promise((resolve, reject) => {
            let loaded = 0
            const images = Array(fileNames.length)
            for (let i = 0; i < fileNames.length; i++) {
                const fileName = fileNames[i]
                const image = new Image()
                image.src = `${root}${fileName}${ext}`
                image.addEventListener('load', () => {
                    images[i] = image
                    if (++loaded >= fileNames.length) {
                        resolve(images)
                    }
                })
                image.addEventListener('error', (e) => {
                    e.preventDefault()
                    reject(`Image '${fileName}' could not be loaded!`)
                })
            }
        })
    }

    static combineImages(images: HTMLImageElement[], imageWidth: number = 16, atlasWidth: number) {
        const canvas = document.createElement('canvas')
        canvas.width = atlasWidth * imageWidth
        canvas.height = atlasWidth * imageWidth
        const ctx = canvas.getContext('2d')

        for (let i = 0; i < images.length; i++) {
            const image = images[i]
            const x = i % atlasWidth
            const y = Math.floor(i / atlasWidth)
            ctx?.drawImage(image, x * imageWidth, y * imageWidth)
        }
        return canvas.toDataURL()
    }

    static createTexture() {
        const texture = new Texture()
        texture.minFilter = LinearFilter
        texture.magFilter = NearestFilter
        return texture
    }

    static updateTexture(texture: Texture, imageURL: string) {
        const image = new Image()
        image.src = imageURL
        texture.image = image
        texture.needsUpdate = true
        return texture
    }
}

export { Atlas, AtlasRanges, AtlasRange }
