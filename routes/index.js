const users = require('./users')
const auth = require("./auth")
const data = require("./data")
const dev = require("./dev")

module.exports = app => {
  app.use('/api', users)
  app.use("/api", auth)
  app.use("/api", data)
  app.use("/api/dev", dev)
}