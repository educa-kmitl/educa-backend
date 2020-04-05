const Router = require('express-promise-router')
const db = require('../db')

const router = new Router()

router.get("/comments", async (req, res) => {
    const { resource_id } = req.headers
    if (!resource_id) return res.status(400).json({ error: "Can't get comment" })

    const comments = await db.query("SELECT text, time, user_id FROM comments WHERE resource_id=$1 ORDER BY time", [resource_id])

    const commentData = []
    for (let i = 0; i < comments.rows.length; i++) {
        const comment = comments.rows[i];
        const user = await db.query("SELECT name, role FROM users WHERE user_id=$1", [comment.user_id])
        commentData.push({ ...comment, name: user.rows[0].name, role: user.rows[0].role })
    }
    res.json({ comments: commentData })
})

module.exports = router