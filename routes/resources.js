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

router.patch("/resources", async (req, res) => {
    const { resource_id, topic, video_url, file_url } = req.body
    if (!resource_id) return res.status(400).json({ error: "Can't update resource" })

    const { rows } = await db.query("SELECT topic, video_url, file_url FROM resources WHERE resource_id=$1", [resource_id])
    if (rows.length == 0) return res.status(404).json({ error: "Resource not found" })

    const { topic: default_topic, video_url: default_video_url, file_url: default_file_url } = rows[0]
    const query = {
        name: "update resource",
        text: "UPDATE resources SET topic=$1, video_url=$2, file_url=$3 WHERE resource_id=$4",
        values: [topic ? topic : default_topic, video_url ? video_url : default_video_url, file_url ? file_url : default_file_url, resource_id]
    }

    const { rowCount } = await db.query(query)
    if (rowCount)
        res.json({ resource: { resource_id } })
    else
        res.status(400).json({ error: "Can't update this user" })

})

module.exports = router