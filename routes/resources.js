const Router = require('express-promise-router')
const bcrypt = require("bcryptjs")
const db = require('../db')

const router = new Router()

router.get("/resources", async (req, res) => {
    const { room_id } = req.headers
    if (!room_id) return res.status(400).json({ error: "Can't get resource" })

    const { rows } = await db.query("SELECT resource_id, topic, video_url, file_url FROM resources WHERE room_id=$1", [room_id])
    res.json({ resources: rows })
})

module.exports = router