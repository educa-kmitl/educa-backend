const express = require("express")
const socketio = require("socket.io")
const http = require("http")
const cors = require("cors")

const PORT = process.env.PORT || 5000

const app = express()
app.use(cors())
app.use(express.json())

const mountRoutes = require('./routes')
mountRoutes(app)

// SOCKET IO //
const server = http.createServer(app)
const io = socketio(server)

io.on("connection", socket => {
    console.log("We have a new connection")

    socket.on("join", ({ room_id, name }, callback) => {
        socket.join(room_id)
        callback()
    })

    socket.on("sendMessage", ({ message, room_id, name }) => {
        io.to(room_id).emit("message", { name, text: message })
    })

})

server.listen(PORT, () => {
    console.log(`Server starts on port ${PORT}`)
})
