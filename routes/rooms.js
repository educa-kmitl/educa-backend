const Router = require('express-promise-router')
const router = new Router()

const db = require("../db")

router.get('/rooms', async (req, res) => {
    const { room_id } = req.body
    if (!room_id) return res.json({ error: 'Room not found' })

    const rooms = await db.query('SELECT name, subject, private, time, teacher_id FROM rooms WHERE room_id=$1', [room_id])
    if (rooms.rows.length == 0) return res.json({ error: 'Room not found' })

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
    const { rows } = await db.query("SELECT room_id, users.name AS teacher_name, rooms.name, subject, private, time AS date_created FROM rooms INNER JOIN users ON rooms.teacher_id = users.user_id")
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

    if (name && subject && (private != undefined) && resources && teacher_id && date_created) {
        if (private && !password) return res.status(400).json({ error: "Can't create room" })

        const { rows } = await db.query("SELECT name FROM rooms WHERE name=$1", [name])
        if (rows.length > 0) return res.status(400).json({ error: `Name "${name}" is already used` })

        const query = {
            name: 'insert-room',
            text: 'INSERT INTO rooms (name, subject, private, password, teacher_id, time) VALUES ($1, $2, $3, $4, $5, $6)',
            values: [name, subject, private, (password && private) ? password : null, teacher_id, date_created],
        }

        await db.query(query)
        const room = await db.query("SELECT room_id FROM rooms WHERE name=$1", [name])
        res.json({ room: { ...room.rows[0] } })
    } else {
        res.status(400).json({ error: "Can't create room" })
    }
})

module.exports = router