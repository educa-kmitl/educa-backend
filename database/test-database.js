const Database = require("./database-mock")


const client = new Database()

client.addUser({ "email": "hotmail", "name": "james" })
client.addUser({ "email": "gmail", "name": "jack" })
client.addUser({ "email": "outloook", "name": "john" })

console.log(client.usersList())