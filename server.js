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
        io.to(room_id).emit("message", { name: 's3rver', text: `${name} has joined` })
        socket.join(room_id)

        const room = auth.client.findRoom(room_id)
        socket.emit("room-data", { room })
        console.log(room)
        callback()
    })

    socket.on("sendMessage", ({ message, room_id, name }) => {
        io.to(room_id).emit("message", { name, text: message })
    })

    socket.on("disconnect", ({ room_id, name }) => {
        io.to(room_id).emit("message", { name: 's3rver', text: `${name} has left` })
        socket.disconnect()
        console.log(`${name} left room ${room_id}`)
    })
})

server.listen(PORT, () => {
    console.log(`Server starts on port ${PORT}`)
})
