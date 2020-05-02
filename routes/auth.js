const Router = require('express-promise-router')
const bcrypt = require("bcryptjs")
const db = require('../db')

const router = new Router()

router.post("/register", async (req, res) => {
    const { email, name, password, role, profile_icon } = req.body

    if (email && name && password && profile_icon && ((typeof role === "boolean"))) {

        const checkUser = await db.query("SELECT * FROM users WHERE email=$1", [email])
        if (checkUser.rows.length > 0) return res.status(400).json({ error: "Email already exists" })

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const query = {
            name: 'insert-user',
            text: 'INSERT INTO users (email, name, password, profile_icon, role) VALUES ($1, $2, $3, $4, $5)',
            values: [email.toLowerCase(), name, hashedPassword, profile_icon, role],
        }
        await db.query(query)

        const { rows: users } = await db.query("SELECT user_id FROM users WHERE email=$1", [email])
        return res.json({ user: { user_id: users[0].user_id } })
    } else {
        return res.status(400).json({ error: "Can't create user" })
    }
})


router.post("/login", async (req, res) => {
    const { email, password } = req.body
    const { rows: users } = await db.query("SELECT * FROM users WHERE LOWER(email)=$1", [email.toLowerCase()])

    if (!(email && password)) return res.status(400).json({ error: "Can't login" })

    if (users.length == 0) {
        return res.status(400).json({ error: "Email not found" })
    } else {
        const validPass = await bcrypt.compare(password, users[0].password)

        if (!validPass) {
            return res.status(400).json({ error: "Invalid password" })
        } else {
            return res.json({ user: { ...users[0], password: null } })
        }
    }
})

module.exports = router