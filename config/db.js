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
  queueLimit: 0
})
const promisePool = pool.promise()

async function executeQuery(querystr, values) {
  try {
    const [rows, fields] = await promisePool.query(querystr, values)
    return rows
  } catch (error) {
    console.error("Error executing query:", error.message)
    throw error // Re-throw the error to propagate it
  } finally {
    // Don't forget to release the connection back to the pool
    // pool.end()
  }
}

module.exports = { executeQuery }
