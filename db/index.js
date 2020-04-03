const { Pool } = require('pg')
require("dotenv").config()

const isProduction = process.env.NODE_ENV === 'production'

const pool = new Pool(
    isProduction ? { connectionString: process.env.DATABASE_URL } : {
        user: process.env.USER,
        host: process.env.HOST,
        database: process.env.DATABASE,
        password: process.env.PASSWORD,
        port: process.env.PORT
    }
)

module.exports = {
    query: (text, params) => pool.query(text, params),
}