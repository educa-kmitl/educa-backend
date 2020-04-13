const Router = require('express-promise-router')
const db = require('../db')

const router = new Router()

router.get("/followers", async (req, res) => {
    const { user_id } = req.headers
    if (!user_id) return res.status(400).json({ error: "Can't get follower data" })

    const query = `SELECT followers.student_id, users.name, users.profile_icon FROM followers
                   INNER JOIN users
                   ON (followers.student_id = users.user_id) AND (followers.teacher_id=${user_id})`

    const { rows: followers } = await db.query(query)

    res.json({ followers })
})


router.get("/followings", async (req, res) => {
    const { user_id } = req.headers
    if (!user_id) return res.status(400).json({ error: "Can't get follower data" })

    const query = `SELECT followers.teacher_id, users.name, users.profile_icon FROM followers
                   INNER JOIN users
                   ON (followers.teacher_id = users.user_id) AND (followers.student_id=${user_id})`
    const { rows: followings } = await db.query(query)

    res.json({ followings })
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
        res.status(400).json({ error: e.detail ? e.detail : e.name })
    }
})

module.exports = router