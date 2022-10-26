class SoundPlayer {
    private path: string
    private ext: string
    private sounds: Map<string, HTMLAudioElement>
    constructor(path: string, ext: string) {
        this.sounds = new Map()
        this.path = path
        this.ext = ext
    }
    playSound(name: string) {
        let sound
        if (!(sound = this.sounds.get(name))) {
            sound = new Audio(`${this.path}${name}${this.ext}`)
            this.sounds.set(name, sound)
        }
        sound.play()
    }
    stopSound(name: string) {
        this.sounds.get(name)?.pause()
    }
}

export { SoundPlayer }
