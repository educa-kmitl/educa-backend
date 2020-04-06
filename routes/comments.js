const Router = require('express-promise-router')
const db = require('../db')

const router = new Router()

router.get("/comments", async (req, res) => {
    const { resource_id, limit } = req.headers
    if (!(resource_id && limit)) return res.status(400).json({ error: "Can't get comment" })

    const comments = await db.query("SELECT text, time, user_id FROM comments WHERE resource_id=$1 ORDER BY time DESC LIMIT $2", [resource_id, limit])

    const commentData = []
    for (let i = 0; i < comments.rows.length; i++) {
        const comment = comments.rows[i];
        const user = await db.query("SELECT name, role, profile_icon FROM users WHERE user_id=$1", [comment.user_id])
        commentData.unshift({ ...comment, name: user.rows[0].name, role: user.rows[0].role, profile_icon: user.rows[0].profile_icon })
    }
    res.json({ comments: commentData })
})

router.post("/comments", async (req, res) => {
    const { user_id, resource_id, text, time } = req.body

    if (!(user_id && resource_id && text && time)) return res.status(400).json({ error: "Can't add comment" })

    const query = {
        name: "insert comment",
        text: "INSERT INTO comments (user_id, resource_id, text, time) VALUES ($1, $2, $3, $4)",
        values: [user_id, resource_id, text, time]
    }

    try {
        const { rowCount } = await db.query(query)

        if (rowCount)
            res.json({ user: { user_id } })
        else
            res.status(400).json({ error: "Can't add comment" })
    } catch (e) {
        res.status(400).json({ error: e.detail })
    }



})

module.exports = router