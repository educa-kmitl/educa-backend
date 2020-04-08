const Router = require('express-promise-router')
const bcrypt = require("bcryptjs")
const db = require("../db")

const router = new Router()

router.get('/rooms', async (req, res) => {
    const { room_id, password } = req.headers
    if (!room_id) return res.status(400).json({ error: "Can't get room data" })

    const rooms = await db.query('SELECT name, subject, private, password, time, teacher_id FROM rooms WHERE room_id=$1', [room_id])
    if (rooms.rows.length == 0) return res.status(400).json({ error: 'Room not found' })

    if (rooms.rows[0].private && (rooms.rows[0].password != password)) return res.status(400).json({ error: "Invalid password" })

    const teacher = await db.query('SELECT name FROM users WHERE user_id=$1', [rooms.rows[0].teacher_id])

    const resources = await db.query('SELECT resource_id, topic, video_url, file_url from resources WHERE room_id=$1', [room_id])

    const likes = await db.query('SELECT user_id FROM likes WHERE room_id=$1', [room_id])

    const roomData = {
        ...rooms.rows[0],
        teacher_name: teacher.rows[0].name,
        resources: resources.rows,
        likes: likes.rows
    }
    res.json({ room: roomData })
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
    if (typeof teacher_password != "string") return res.status(400).json({ error: "Password required" })

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


router.get("/my-rooms", async (req, res) => {

    const { user_id, limit } = req.headers
    if (!user_id) return res.status(400).json({ error: "Can't find any room" })

    const { rows: users } = await db.query("SELECT name FROM users WHERE user_id=$1", [user_id])
    if (users.length == 0) return res.status(404).json({ error: "User not found" })

    const limitQuery = limit ? Number.parseInt(limit) : 6
    const roomQuery = `SELECT room_id, teacher_id, name, subject, private, time AS date_created
                       FROM rooms 
                       WHERE teacher_id=${user_id} 
                       ORDER BY time DESC
                       LIMIT ${limitQuery + 1}`
    const { rows: rooms } = await db.query(roomQuery)

    const have_more = rooms.length > limitQuery
    if (have_more) rooms.pop()

    const roomData = []
    for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i]
        const { rows: resources } = await db.query("SELECT resource_id FROM resources WHERE room_id=$1", [room.room_id])

        const { rows: likes } = await db.query("SELECT user_id FROM likes WHERE room_Id=$1", [room.room_id])
        roomData.push({ ...room, resource_length: resources.length, teacher_name: users[0].name, likes: likes.length })
    }

    res.json({ rooms: roomData, have_more })

})

router.get("/all-rooms", async (req, res) => {

    const { text, sort_by, arrange_by, limit } = req.headers
    const queryStr = text ? text : ''

    const limitQuery = limit ? Number.parseInt(limit) : 6
    const query = `SELECT rooms.room_id, users.user_id AS teacher_id, users.name AS teacher_name, rooms.name, rooms.subject, rooms.private, rooms.time AS date_created, COUNT(likes.room_id) AS likes FROM users
                   INNER JOIN rooms
                   ON (users.user_id=rooms.teacher_id) and (users.name like '%${queryStr}%' or rooms.name like '%${queryStr}%' or rooms.subject like '%${queryStr}%')
                   LEFT JOIN likes
                   ON (rooms.room_id=likes.room_id)
                   GROUP BY (rooms.room_id, users.user_id, users.name, rooms.name, rooms.subject, rooms.private, rooms.time)
                   ORDER BY ${(sort_by == 2) ? 'date_created' : 'likes'} ${(arrange_by == 2) ? 'ASC' : 'DESC'}
                   LIMIT ${limitQuery + 1}`
    const { rows: rooms } = await db.query(query)

    const have_more = rooms.length > limitQuery
    if (have_more) rooms.pop()

    const roomData = []
    for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i]
        const { rows: resources } = await db.query("SELECT resource_id FROM resources WHERE room_id=$1", [room.room_id])
        roomData.push({ ...room, resource_length: resources.length })
    }

    res.json({ rooms: roomData, have_more })
})

router.get("/following-rooms", async (req, res) => {
    const { user_id, limit } = req.headers
    if (!user_id) res.status(400).json({ error: "Can't get your following rooms" })

    const limitQuery = limit ? Number.parseInt(limit) : 6
    const roomQuery = `SELECT R.room_id, T.teacher_id, U.name AS teacher_name, 
                          R.name, R.subject, R.private, R.time AS date_created,
                          COUNT(L.user_id) AS likes
                       FROM (SELECT teacher_id FROM followers WHERE student_id=${user_id}) AS T
                       INNER JOIN rooms R
                       ON R.teacher_id = T.teacher_id
                       INNER JOIN users U
                       ON T.teacher_id = U.user_id
                       LEFT JOIN likes L
                       ON L.room_id = R.room_id
                       GROUP BY (R.room_id, T.teacher_id, U.name, R.name, R.subject, R.private)
                       ORDER BY likes DESC
                       LIMIT ${limitQuery + 1}`
    const { rows: rooms } = await db.query(roomQuery)
    const have_more = rooms.length > limitQuery
    if (have_more) rooms.pop()

    const roomData = []
    for (let i = 0; i < rooms.length; i++) {
        const { room_id } = rooms[i]
        const { rows: resources } = await db.query("SELECT room_id FROM resources WHERE room_id=$1", [room_id])
        roomData.push([{ ...rooms[i], resource_length: resources.length }])
    }

    res.json({ rooms: roomData, have_more })
})

module.exports = router