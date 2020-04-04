const auth = require("./auth")
const users = require('./users')
const rooms = require("./rooms")
const resources = require("./resources")
const comments = require("./comments")
const followers = require("./followers")
const dev = require("./dev")

module.exports = app => {
  app.use("/api", auth)
  app.use('/api', users)
  app.use("/api", rooms)
  app.use("/api", resources)
  app.use("/api", comments)
  app.use("/api", followers)
  app.use("/api/dev", dev)
}