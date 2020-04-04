const Router = require('express-promise-router')
const bcrypt = require("bcryptjs")
const db = require("../db")

const router = new Router()

router.get('/rooms', async (req, res) => {
    const { room_id, password } = req.headers
    if (!room_id) return res.json({ error: 'Room not found' })

    const rooms = await db.query('SELECT name, subject, private, password, time, teacher_id FROM rooms WHERE room_id=$1', [room_id])
    if (rooms.rows.length == 0) return res.json({ error: 'Room not found' })

    if (rooms.rows[0].private && (rooms.rows[0].password != password)) return res.status(400).json({ error: "Invalid password" })

    const teacher = await db.query('SELECT name FROM users WHERE user_id=$1', [rooms.rows[0].teacher_id])

    const resources = await db.query('SELECT resource_id, topic, video_url, file_url from resources WHERE room_id=$1', [room_id])

    const roomData = {
        ...rooms.rows[0],
        teacher_name: teacher.rows[0].name,
        resources: resources.rows
    }
    res.json({ room: roomData })
})

router.get("/all-rooms", async (req, res) => {
    const { rows } = await db.query("SELECT room_id, users.user_id AS teacher_id, users.name AS teacher_name, rooms.name, subject, private, time AS date_created FROM rooms INNER JOIN users ON rooms.teacher_id = users.user_id")
    const roomData = []
    for (let i = 0; i < rows.length; i++) {
        const room = rows[i]
        const roomResources = await db.query("SELECT resource_id FROM resources WHERE room_id=$1", [room.room_id])
        roomData.push({ ...room, resource_length: roomResources.rows.length })
    }

    res.json({ rooms: roomData })
})

router.post("/rooms", async (req, res) => {
    const { name, subject, private, password, resources, teacher_id, date_created } = req.body

    if (name && subject && (typeof private === "boolean") && resources && teacher_id && date_created) {
        if (private && !password) return res.status(400).json({ error: "Can't create room" })

        const { rows } = await db.query("SELECT name FROM rooms WHERE name=$1", [name])
        if (rows.length > 0) return res.status(400).json({ error: `Name "${name}" is already used` })

        // Insert room
        const roomQuery = {
            name: 'insert-room',
            text: 'INSERT INTO rooms (name, subject, private, password, teacher_id, time) VALUES ($1, $2, $3, $4, $5, $6)',
            values: [name, subject, private, (password && private) ? password : null, teacher_id, date_created],
        }
        await db.query(roomQuery)

        // Get room_id after insert
        const room = await db.query("SELECT room_id FROM rooms WHERE name=$1", [name])
        const { room_id } = room.rows[0]

        // Insert resources
        for (let i = 0; i < resources.length; i++) {
            const { topic, video_url, file_url } = resources[i]
            const resourceQuery = {
                name: 'insert-resource',
                text: 'INSERT INTO resources (topic, video_url, file_url, room_id) VALUES ($1, $2, $3, $4)',
                values: [topic, video_url, file_url ? file_url : null, room_id]
            }
            await db.query(resourceQuery)
        }

        res.json({ room: { room_id } })
    } else {
        res.status(400).json({ error: "Can't create room" })
    }
})

router.get("/room-privacy", async (req, res) => {
    const { room_id } = req.headers
    if (room_id) {
        const { rows } = await db.query("SELECT private FROM rooms WHERE room_id=$1", [room_id])
        if (rows.length == 0) return res.status(400).json({ error: "Room not found" })
        else return res.json({ lock: rows[0].private })
    } else {
        res.status(400).json({ error: "Can't get room privacy" })
    }
})

router.delete("/rooms", async (req, res) => {
    const { room_id, teacher_id, password } = req.body

    if (room_id && teacher_id && password) {
        const { rows } = await db.query("SELECT password from users WHERE user_id=$1", [teacher_id])
        const validPass = await bcrypt.compare(password, rows[0].password)
        if (!validPass) return res.status(400).json({ error: "Invalid password" })

        const result = await db.query("DELETE FROM rooms WHERE room_id=$1", [room_id])
        if (result.rowCount == 1) {
            return res.json({ success: `Room ${room_id} was deleted` })
        } else {
            return res.status(400).json({ error: "Can't delete this room" })
        }
    } else {
        res.status(400).json({ error: "Can't delete this room" })
    }
})

router.patch("/rooms", async (req, res) => {
    const { room_id, teacher_password, name, private, password, subject } = req.body

    if (!(room_id && teacher_password)) return res.status(400).json({ error: "Can't update room" })
    if (typeof teacher_password != "string") return res.status(400).json({ error: "Invalid password" })

    const room = await db.query("SELECT * FROM rooms WHERE room_id=$1", [room_id])

    if (room.rows.length == 0) return res.status(404).json({ error: "Rooom not found" })

    const user = await db.query("SELECT password FROM users WHERE user_id=$1", [room.rows[0].teacher_id])

    const validPass = await bcrypt.compare(teacher_password, user.rows[0].password)
    if (!validPass) return res.status(400).json({ error: "Invalid password" })

    const { name: default_name, private: default_private, password: default_password, subject: default_subject } = room.rows[0]
    const query = {
        name: "update room",
        text: "UPDATE rooms SET name=$1, private=$2, password=$3, subject=$4 WHERE room_id=$5",
        values: [
            name ? name : default_name,
            (typeof private == 'boolean') ? private : default_private,
            password ? password : default_password,
            subject ? subject : default_subject,
            room_id
        ]
    }

    const { rowCount } = await db.query(query)
    if (rowCount)
        res.json({ room: { room_id } })
    else
        res.status(400).json({ error: "Can't update this room" })

})

module.exports = router