// All node modules are imported here
const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const cookieParser = require("cookie-parser")

// All controller API are imported here
const { isAuthenticatedUser } = require("./controllers/auth")
const { loginForm, logout, profile, createUser, editUser, allUsers, allGroups, createGroup, editSelf } = require("./controllers/usercontroller")
const { Checkgroup } = require("./controllers/checkGroup")

// Express is initiated here
const app = express()

// Uncaught exception error shuts down server here
process.on("uncaughtException", err => {
  console.log(`Error: ${err.stack}`)
  console.log("Shutting down the server due to uncaught exception.")
  process.exit(1)
})

// Constants declared here
dotenv.config({ path: "./config/config.env" })
const port = process.env.PORT
const environment = process.env.NODE_ENV
const bodyParser = express.json()

// Middleware used here
app.use(cors())
app.use(bodyParser)
app.use(cookieParser())

// Router is initialized here
const router = express.Router()

// Authentication and Authorization routes
router.route("/login/check").post(isAuthenticatedUser) // post, send loggedin username usergroups
router.route("/login").post(loginForm) // post username password, send cookie-token loggedin username
router.route("/logout").post(logout) // post, send cookie-token loggedin

// Check permit
router.route("/checkgroup").post(Checkgroup) // post username usergroup, send usergroup(boolean)

// Data queries
router.route("/user").post(profile) // post username, send email
router.route("/user/create").post(createUser) // post user *data, send
router.route("/user/edit").post(editUser) // post userdata, send
router.route("/user/editself").post(editSelf) // post userdata, send
router.route("/user/getall").post(allUsers) // post, send *users
router.route("/group/getall").post(allGroups) // post, send *groups
router.route("/group/create").post(createGroup) // post group, send

// use router
app.use(router)

// Route not found catch
app.all("*", (req, res) => {
  res.json({
    error: "routenotfound",
    message: `404 error, ${req.originalUrl} route not found`
  })
})

// Error-handling middleware (defined after other routes and middleware)
app.use((err, req, res, next) => {
  console.error(err.message)
  if (err.name === "TokenExpiredError") {
    return res.json({
      loggedin: false,
      message: "Your session has expired, please log in again"
    })
  } else {
    console.log(err)
    return res.json({
      error: "Internal Server Error"
    })
  }
})

// Server started on port
const server = app.listen(port, () => {
  console.log(`Server started on port ${port} in ${environment} mode`)
})

// Unhandled promise rejection error
process.on("unhandledRejection", err => {
  console.log(`Error: ${err.message}`)
  console.log("Shutting down the server due to unhandled promise rejection.")
  server.close(() => {
    process.exit(1)
  })
})
