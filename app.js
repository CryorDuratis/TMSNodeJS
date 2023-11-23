// All node modules are imported here
const express = require("express")
const dotenv = require("dotenv")
const session = require("express-session")

// All app modules are imported here
const usermgmt = require("./routes/usermgmt")
const taskmgmt = require("./routes/taskmgmt")

// Express is initiated here
const app = express()

// Uncaught exception error shuts down server here

// Constants declared here
dotenv.config({ path: "./config/config.env" })
const port = process.env.PORT
const environment = process.env.NODE_ENV
const bodyParser = express.json()

// Middleware and Routes used here
app.use(bodyParser)
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "super-secret"
  })
)
app.use(usermgmt)
app.use(taskmgmt)

// Route not found catch
app.all("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `404 error, ${req.originalUrl} route not found`
  })
})

// Server started on port
const server = app.listen(port, () => {
  console.log(`Server started on port ${port} in ${environment} mode`)
})
