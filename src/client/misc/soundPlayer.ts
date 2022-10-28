class SoundPlayer {
    private path: string
    private ext: string
    constructor(path: string, ext: string) {
        this.path = path
        this.ext = ext
    }
    load(names: string[]) {
        for (const name of names) {
            // preload audio
            new Audio(`${this.path}${name}${this.ext}`)
        }
    }
    playSound(name: string) {
        let sound
        sound = new Audio(`${this.path}${name}${this.ext}`)
        sound.play()
    }
}

export { SoundPlayer }
