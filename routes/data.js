const Router = require('express-promise-router')
const router = new Router()

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

module.exports = router