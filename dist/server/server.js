const express = require('express')
const http = require('http')
const path = require('path')

const port = 3000

class App {
    constructor(port) {
        this.port = port
        const app = express()
        app.use(express.static(path.join(__dirname, '../client')))
        this.server = new http.Server(app)
    }

    Start() {
        this.server.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}.`)
            console.log('\x1b[35m%s\x1b[0m', `Running on http://localhost:${this.port}`)
        })
    }
}

new App(port).Start()
