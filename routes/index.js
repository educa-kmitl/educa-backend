const auth = require("./auth")
const users = require('./users')
const rooms = require("./rooms")
const resources = require("./resources")
const dev = require("./dev")

module.exports = app => {
  app.use("/api", auth)
  app.use('/api', users)
  app.use("/api", rooms)
  app.use("/api", resources)
  app.use("/api/dev", dev)
}