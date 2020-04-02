const db = require('../db')

async function getUsers(user_id) {
    const { rows } =  await db.query("SELECT * FROM users WHERE user_id=$1",[user_id])
    console.log(rows[0])
}

getUsers(1)