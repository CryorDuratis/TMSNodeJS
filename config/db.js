// require node modules
const mysql = require("mysql2")
const dotenv = require("dotenv")

// errorhandler
const ErrorHandler = require("../util/errorHandler")

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
    new ErrorHandler("You are not authorized to view this page, please check with your team if you think this is a mistake", 403)
    throw error // Re-throw the error to propagate it
  }
  // pool.end()
}

module.exports = { executeQuery }
