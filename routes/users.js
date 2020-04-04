const Router = require('express-promise-router')
const router = new Router()

const db = require('../db')

router.get('/users', async (req, res) => {
    const { user_id } = req.body
    if (!user_id) return res.status(404).json({ error: 'User not found' })

    const user = await db.query('SELECT user_id, name, profile_icon, role FROM users WHERE user_id = $1', [user_id])
    if (user.rows.length == 0) return res.status(404).json({ error: 'User not found' })

    let likes = 0
    if (user.rows[0].role) {
        const rooms = await db.query('SELECT room_id FROM rooms WHERE teacher_id = $1', [user_id])
        if (rooms.rows.length > 0) {
            const room_ids = rooms.rows.map(room => room.room_id).toString()
            const allLikes = await db.query(`SElECT * FROM likes WHERE room_id IN (${room_ids})`)
            likes = allLikes.rows.length
        }
    }
    res.json({ user: { ...user.rows[0], likes } })

})

router.get('/all-teachers', async (req, res) => {
    const { rows } = await db.query('SELECT user_id, name, profile_icon FROM users WHERE role=true')
    const teacherData = []
    for (let i = 0; i < rows.length; i++) {
        const teacher_id = rows[i].user_id
        const rooms = await db.query('SELECT room_id FROM rooms WHERE teacher_id = $1', [teacher_id])
        let likes = 0
        if (rooms.rows.length > 0) {
            const room_ids = rooms.rows.map(room => room.room_id).toString()
            const allLikes = await db.query(`SElECT * FROM likes WHERE room_id IN (${room_ids})`)
            likes = allLikes.rows.length
        }
        teacherData.push({ ...rows[i], likes })
    }
    res.json({ teachers: teacherData })
})


module.exports = router