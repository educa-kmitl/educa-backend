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


router.get("/followings", async (req, res) => {
    const { user_id } = req.headers
    if (!user_id) return res.status(400).json({ error: "Can't get follower data" })

    const followings = await db.query("SELECT teacher_id FROM followers WHERE student_id=$1", [user_id])

    const followingsData = []
    for (let i = 0; i < followings.rows.length; i++) {
        const follower = followings.rows[i]
        const user = await db.query("SELECT name FROM users WHERE user_id=$1", [follower.teacher_id])
        followingsData.push({ ...follower, ...user.rows[0] })
    }

    res.json({ followings: followingsData })
})

router.post("/followings", async (req, res) => {
    const { teacher_id, student_id } = req.body

    if (!(teacher_id && student_id)) return res.status(400).json({ error: "Can't follow this user" })

    try {
        const { rowCount } = await db.query("INSERT INTO followers (teacher_id, student_id) VALUES ($1, $2)", [teacher_id, student_id])
        if (rowCount) {
            res.json({ success: "You followed this user" })
        } else {
            res.status(400).json({ error: "Can't follow this user" })
        }
    } catch (e) {
        res.status(400).json({ error: e.detail })
    }
})

router.delete("/followings", async (req, res) => {
    const { teacher_id, student_id } = req.body

    if (!(teacher_id && student_id)) return res.status(400).json({ error: "Can't unfollow this user" })

    try {
        const { rowCount } = await db.query("DELETE FROM followers WHERE teacher_id=$1 AND student_id=$2", [teacher_id, student_id])
        if (rowCount) {
            res.json({ success: "You unfollowed this user" })
        } else {
            res.status(400).json({ error: "Can't unfollow this user" })
        }
    } catch (e) {
        res.status(400).json({ error: e.detail })
    }
})

module.exports = router