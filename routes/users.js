const Router = require('express-promise-router')
const bcrypt = require('bcryptjs')
const db = require('../db')

const router = new Router()

router.get('/users', async (req, res) => {
    const { user_id } = req.headers
    if (!user_id) return res.status(404).json({ error: 'User not found' })

    const { rows: users } = await db.query('SELECT user_id, name, profile_icon, role FROM users WHERE user_id = $1', [user_id])
    if (users.length == 0) return res.status(404).json({ error: 'User not found' })

    let likes = 0
    if (users[0].role) {
        const query = `SELECT COUNT(likes.user_id) AS likes FROM users 
                       INNER JOIN rooms
                       ON users.user_id=${user_id} AND rooms.teacher_id=${user_id}
                       LEFT JOIN likes
                       ON rooms.room_id=likes.room_id
                       GROUP BY (users.user_id, users.name, users.profile_icon, users.role)`
        const { rows: likesArr } = await db.query(query)
        likes = (likesArr.length > 0) ? likesArr[0].likes : 0
    }
    res.json({ user: { ...users[0], likes } })

})

router.patch('/users', async (req, res) => {
    const { user_id, password, name, profile_icon } = req.body
    if (!(user_id && password)) return res.status(400).json({ error: "Can't update user" })
    if (typeof password != "string") return res.status(400).json({ error: "Invalid password" })

    const { rows:users } = await db.query("SELECT user_id, name, profile_icon, password FROM users WHERE user_id=$1", [user_id])
    if (users.length == 0) return res.status(404).json({ error: "User not found" })

    const validPass = await bcrypt.compare(password, users[0].password)
    if (!validPass) return res.status(400).json({ error: "Invalid password" })

    const { name: default_name, profile_icon: default_profile_icon } = users[0]
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
    const { limit } = req.headers

    const limitQuery = limit ? Number.parseInt(limit) : 20

    const query = ` SELECT teachers.user_id, teachers.name, teachers.profile_icon, COUNT(likes.user_id) AS likes
                    FROM ( SELECT users.user_id, users.name, users.profile_icon 
                           FROM users 
                           WHERE role=true) AS teachers
                    LEFT JOIN rooms
                    ON rooms.teacher_id = teachers.user_id
                    LEFT JOIN likes
                    ON likes.room_id = rooms.room_id
                    GROUP BY (teachers.user_id, teachers.name, teachers.profile_icon, rooms.teacher_id)
                    ORDER BY likes DESC
                    LIMIT ${limitQuery + 1}
                   `

    const { rows: teachers } = await db.query(query)
    const have_more = teachers.length > limitQuery
    if (have_more) teachers.pop()
    res.json({ teachers, have_more })
})


module.exports = router