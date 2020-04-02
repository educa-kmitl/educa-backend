const Router = require('express-promise-router')
const db = require('../db')

const router = new Router()

router.get('/users', async (req, res) => {
    const { user_id } = req.body
    if (!user_id) return res.status(404).json({ error: 'User not found' })

    const user = await db.query('SELECT name, profile_icon, role FROM users WHERE user_id = $1', [user_id])

    if (user.rows.length == 0) return res.status(404).json({ error: 'User not found' })

    if (user.rows[0].role) {
        const rooms = await db.query('SELECT room_id FROM rooms WHERE rooms.teacher_id = $1', [user_id])
        const room_ids = rooms.rows.map(room => room.room_id).toString()
        console.log(room_ids)
        const allLikes = await db.query(`SElECT * FROM likes WHERE room_id IN (${room_ids.toString()})`)
        res.json({ ...user.rows[0], likes: allLikes.rows.length })
    } else {
        res.json({ ...user.rows[0], likes: 0 })
    }
})

router.get('/all-teachers', async (req, res) => {
    const { rows } = await db.query('SELECT user_id, name, profile_icon FROM users WHERE role=true')
    res.json(rows)
})

router.get('/rooms', async (req, res) => {
    const { room_id } = req.body
    if (!room_id) return res.json({ error: 'Room not found' })

    const rooms = await db.query('SELECT name, subject, private, time, teacher_id FROM rooms WHERE room_id=$1', [room_id])
    if (rooms.rows.length == 0) return res.json({ error: 'Room not found' })

    const teacher = await db.query('SELECT name FROM users WHERE user_id=$1', [rooms.rows[0].teacher_id])

    const resources = await db.query('SELECT resource_id, topic, video_url, file_url from rooms r INNER JOIN resources rs ON r.room_id=rs.room_id')

    const roomData = {
        ...rooms.rows[0],
        teacher_name: teacher.rows[0].name,
        resources: resources.rows
    }
    res.json(roomData)
})


// For debugs
router.get('/dev-all-users', async (req, res) => {
    const { rows } = await db.query("SELECT * FROM users")
    res.json(rows)
})

router.get('/dev-all-rooms', async (req, res) => {
    const { rows } = await db.query("SELECT * FROM rooms")
    res.json(rows)
})

router.get('/dev-all-resources', async (req, res) => {
    const { rows } = await db.query("SELECT * FROM resources")
    res.json(rows)
})

module.exports = router