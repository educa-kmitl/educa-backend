const Router = require('express-promise-router')
const db = require('../db')

const router = new Router()

router.get("/likes", async (req, res) => {
    const { room_id } = req.headers
    if (!room_id) return res.status(400).json({ error: "Can't get likes data" })

    const { rows } = await db.query("SELECT user_id FROM likes WHERE room_id=$1", [room_id])
    res.json({ likes: rows })
})

module.exports = router