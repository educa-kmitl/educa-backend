const auth = require("./auth")
const users = require('./users')
const rooms = require("./rooms")
const dev = require("./dev")

module.exports = app => {
  app.use("/api", auth)
  app.use('/api', users)
  app.use("/api", rooms)
  app.use("/api/dev", dev)
}