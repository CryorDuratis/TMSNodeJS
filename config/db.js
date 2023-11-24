// require node modules
const mysql = require("mysql2")
const dotenv = require("dotenv")

// dotenv set up
dotenv.config({ path: "./config/config.env" }) // path is from root directory, not this parent folder

// create connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
})

// catch sql connection errors
connection.connect(err => {
  if (err) {
    console.error("Error connecting to MySQL: " + err.stack)
    return
  }
  console.log("Connected to MySQL as id " + connection.threadId)
})

module.exports = connection
