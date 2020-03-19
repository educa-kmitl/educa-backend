const router = require("express").Router()

const Database = require("../database/database-mock")
const client = new Database()

router.post("/register", (req, res) => {
    const { error, success } = client.addUser(req.body)
    if (error) {
        res.status(400).send({ error })
    }
    else {
        res.send({ success })
    }
})

router.get("/users", (req, res) => {
    const users = client.usersList()
    res.send(users)
})

module.exports = router
