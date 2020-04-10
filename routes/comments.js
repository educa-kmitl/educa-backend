const Router = require('express-promise-router')
const db = require('../db')

const router = new Router()

router.get("/comments", async (req, res) => {
    const { resource_id, limit } = req.headers
    if (!resource_id) return res.status(400).json({ error: "Can't get comment" })

    try {
        const limitQuery = limit ? Number.parseInt(limit) : 10
        const query = `SELECT users.user_id, users.name, users.role, users.profile_icon, comments.text, comments.time
                       FROM comments 
                       INNER JOIN users
                       ON (users.user_id=comments.user_id) AND (comments.resource_id=${resource_id})
                       ORDER BY time DESC
                       LIMIT ${limitQuery + 1}`
        const { rows: comments } = await db.query(query)
        const have_more = comments.length > limitQuery
        const commentData = have_more ? comments.slice(0, -1).reverse() : comments.reverse()
        res.json({ comments: commentData, have_more })
    } catch (e) {
        res.status(400).json({ error: e.name })
    }

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