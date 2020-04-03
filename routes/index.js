const users = require('./users')
const auth = require("./auth")
const dev = require("./dev")

module.exports = app => {
  app.use('/api', users)
  app.use("/api", auth)
  app.use("/api", dev)
}