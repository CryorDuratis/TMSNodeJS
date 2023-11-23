// All node modules are imported here
const express = require("express")
const dotenv = require("dotenv")

// All app modules are imported here

// Express is initiated here
app = express()

// Uncaught exception error shuts down server here

// Constants declared here
dotenv.config({ path: "./config/config.env" })
const port = process.env.PORT
const environment = process.env.NODE_ENV

// Middleware and Routes used here
express.json() // Bodyparser from express

// Server started on port
const server = app.listen(port, () => {
  console.log(`Server started on port ${port} in ${environment} mode`)
})
