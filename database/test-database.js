const Database = require("./database-mock")


const client = new Database()

const {response,error} = client.addUser({ "email": "hotmail", "name": "james" })
client.addUser({ "email": "gmail", "name": "jack" })
client.addUser({ "email": "outloook", "name": "john" })


console.log(response)
console.log(error)
console.log(client.usersList())