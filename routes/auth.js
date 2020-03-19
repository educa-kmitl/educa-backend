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


router.post("/login", (req, res) => {
    const { email, password } = req.body

    // Check if email exists
    const user = client.findUser(email)
    if (!user) return res.status(400).send("Email is not found")

    // Verify password
    const validPass = (password == user.password)
    if (!validPass) return res.status(400).send("Invalid password")

    res.json(user)

})


router.get("/users", (req, res) => {
    const users = client.usersList()
    res.send(users)
})


router.post("/create", (req, res) => {
    const roomData = req.body

    const room = client.addRoom(roomData)


    res.json(room)
})

router.get("/rooms", (req, res) => {
    const rooms = client.roomLists()
    res.send(rooms)
})




module.exports = router
