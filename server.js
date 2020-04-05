const express = require("express")
const cors = require("cors")

const PORT = process.env.PORT || 5000

const app = express()
app.use(cors())
app.use(express.json())

const mountRoutes = require('./routes')
mountRoutes(app)

app.listen(PORT, () => {
    console.log(`Server starts on port ${PORT}`)
})
