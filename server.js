const express = require("express")
const socketio = require("socket.io")
const http = require("http")
const cors = require("cors")

const PORT = process.env.PORT || 5000

const auth = require("./routes/auth")

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/user", auth.router)

// SOCKET IO //
const server = http.createServer(app)
const io = socketio(server)

io.on("connection", socket => {
    console.log("We have a new connection")

    socket.on("join", ({ room_id, name }, callback) => {
        io.to(room_id).emit("message", { name: 's3rver', text: `${name} has joined` })
        socket.join(room_id)
        auth.client.addUserToRoom({ socket_id: socket.id, name }, room_id)
        callback()
    })

    socket.on("disconnect", ({ room_id }) => {
        const user = auth.client.removeUserFromRoom(socket.id, room_id)
        io.to(room_id).emit("message", { name: 's3rver', text: `${user.name} has left` })
        console.log(user.name + 'left')
    })

    socket.on("sendMessage", ({ message, room_id, name }) => {
        io.to(room_id).emit("message", { name, text: message })
        console.log(room_id + message + name)
    })
})

server.listen(PORT, () => {
    console.log(`Server starts on port ${PORT}`)
})
