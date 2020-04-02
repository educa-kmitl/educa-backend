const users = require('./users')
const auth = require("./auth")

module.exports = app => {
  app.use('/api', users)
  app.use("/api", auth)
}