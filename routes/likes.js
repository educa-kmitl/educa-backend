const Router = require('express-promise-router')
const db = require('../db')

const router = new Router()

router.get("/likes", async (req, res) => {
    const { room_id } = req.headers
    if (!room_id) return res.status(400).json({ error: "Can't get likes data" })

    const { rows } = await db.query("SELECT user_id FROM likes WHERE room_id=$1", [room_id])
    res.json({ likes: rows })
})

router.post("/likes", async (req, res) => {
    const { room_id, user_id } = req.body

    if (!(room_id && user_id)) return res.status(400).json({ error: "Can't add like" })

    try {

        const { rowCount } = await db.query("INSERT INTO likes (room_id, user_id) VALUES ($1, $2)", [room_id, user_id])

        if (rowCount) {
            res.json({ success: "You liked this room" })
        } else {
            res.status(400).json({ error: "Can't like this room" })
        }
    } catch (e) {
        res.status(400).json({ error: e.detail })
    }
})


module.exports = router