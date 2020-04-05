const Router = require('express-promise-router')
const bcrypt = require('bcryptjs')
const db = require('../db')

const router = new Router()

router.get('/users', async (req, res) => {
    const { user_id } = req.headers
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

router.patch('/users', async (req, res) => {
    const { user_id, password, name, profile_icon } = req.body
    if (!(user_id && password)) return res.status(400).json({ error: "Can't update user" })
    if (typeof password != "string") return res.status(400).json({ error: "Password required" })

    const { rows } = await db.query("SELECT user_id, name, profile_icon, password FROM users WHERE user_id=$1", [user_id])
    if (rows.length == 0) return res.status(404).json({ error: "User not found" })

    const validPass = await bcrypt.compare(password, rows[0].password)
    if (!validPass) return res.status(400).json({ error: "Invalid password" })

    const { name: default_name, profile_icon: default_profile_icon } = rows[0]
    const query = {
        name: "update user",
        text: "UPDATE users SET name=$1, profile_icon=$2 WHERE user_id=$3",
        values: [name ? name : default_name, profile_icon ? profile_icon : default_profile_icon, user_id]
    }

    const { rowCount } = await db.query(query)
    if (rowCount)
        res.json({ user: { user_id } })
    else
        res.status(400).json({ error: "Can't update this user" })

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