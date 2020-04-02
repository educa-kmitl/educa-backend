const Router = require('express-promise-router')
const db = require('../db')

const router = new Router()

router.get('/users', async (req, res) => {
    const { user_id } = req.body
    if (!user_id) return res.status(404).json({ error: "User not found" })

    const { rows } = await db.query('SELECT * FROM users WHERE user_id = $1', [user_id])

    const user = Object.keys(rows[0]).reduce((accumulator, currentKey) => {
        if (currentKey != "password")
            accumulator[currentKey] = rows[0][currentKey]
        return accumulator
    }, {})
    res.json(user)
})

module.exports = router