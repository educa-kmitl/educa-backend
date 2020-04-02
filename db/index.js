const { Pool } = require('pg')
require("dotenv").config()

const isProduction = process.env.NODE_ENV === 'production'



const pool = new Pool({
    // user: process.env.USER,
    // host: process.env.HOST,
    // database: process.env.DATABASE,
    // password: process.env.PASSWORD,
    // port: process.env.PORT,
    connectionString: isProduction ? process.env.DATABASE_URL : process.env.PG_URI
})


module.exports = {
    query: (text, params) => pool.query(text, params),
}