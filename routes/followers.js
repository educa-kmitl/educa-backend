const Router = require('express-promise-router')
const db = require('../db')

const router = new Router()

router.get("/followers", async (req, res) => {
    const { user_id } = req.headers
    if (!user_id) return res.status(400).json({ error: "Can't get follower data" })

    const followers = await db.query("SELECT student_id FROM followers WHERE teacher_id=$1", [user_id])

    const followerData = []
    for (let i = 0; i < followers.rows.length; i++) {
        const follower = followers.rows[i]
        const user = await db.query("SELECT name FROM users WHERE user_id=$1", [follower.student_id])
        followerData.push({ ...follower, ...user.rows[0] })
    }

    res.json({ followers: followerData })
})

module.exports = router