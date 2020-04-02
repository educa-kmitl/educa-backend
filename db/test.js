const db = require('../db')

async function getUsers(user_id) {
    // const  user =  await db.query("SELECT * FROM users WHERE user_id=$1",[user_id])
    
    // const rooms = await db.query('SELECT room_id FROM rooms WHERE rooms.teacher_id = $1',[user_id])
    
    // const room_ids = rooms.rows.map(room=>room.room_id)
    const room_ids = [1,2,3].toString()
    console.log(room_ids)
    const {rows} = await db.query(`select * from likes where room_id IN (${room_ids})`)
    console.log(rows)
}

getUsers(1)