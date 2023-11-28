// require node modules
const mysql = require("mysql2")
const dotenv = require("dotenv")

// dotenv set up
dotenv.config({ path: "./config/config.env" }) // path is from root directory, not this parent folder

// create pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})
const promisePool = pool.promise()

const executeQuery = Promise.resolve(async (querystr, values) => {
  const [rows, fields] = await promisePool.query(querystr, values)
  return rows
}).catch((error) => {
  console.error("Error executing query:", error.message)
  return res.json({
    error: error.name,
  })
})

module.exports = { executeQuery }
