const router = require("express").Router()


router.get("/test", (req, res) => {
    res.send("TEST success")
})


module.exports = { router }