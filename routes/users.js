const Router = require('express-promise-router')
const db = require('../db')

const router = new Router()

router.get('/users', async (req, res) => {
    const { user_id } = req.body
    if (!user_id) return res.status(404).json({ error: 'User not found' })

    const { rows } = await db.query('SELECT name, profile_icon, role FROM users WHERE user_id = $1', [user_id])

    if (rows.length == 0) return res.status(404).json({ error: 'User not found' })

    res.json(rows[0])
})

router.get('/all-teachers', async (req, res) => {
    const { rows } = await db.query('SELECT user_id, name, profile_icon FROM users WHERE role=true')
    res.json(rows)
})

module.exports = router