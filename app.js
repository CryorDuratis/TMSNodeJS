// All node modules are imported here
const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const cookieParser = require("cookie-parser")

// All controller API are imported here
const { isAuthenticatedUser } = require("./authentication/auth")
const { loginForm, logout, profile, createUser, editUser, allUsers, allGroups, createGroup, editSelf } = require("./controllers/usercontroller")
const { Checkgroup, isAuthorized } = require("./controllers/checkGroup")

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
app.use(cors({ origin: "http://localhost:3000" }))
app.use(bodyParser)
app.use(cookieParser())

// Error-handling middleware (defined after other routes and middleware)
app.use((err, req, res, next) => {
  console.error(err.message)
  if (err && err.name === "TokenExpiredError") {
    return res.json({
      error: "routenotfound"
    })
  } else {
    console.log(err)
    return res.json({
      error: "Internal Server Error"
    })
  }
})

// Router is initialized here
const router = express.Router()

// Authentication and Authorization routes
router.route("/login").post(loginForm) // post username password, send cookie-token success username
router.route("/logout").post(logout) // post, send cookie-token
router.route("/checkgroup").post(isAuthenticatedUser, Checkgroup) // post username usergroup, send usergroup(boolean)

// All users
router.route("/user").post(isAuthenticatedUser, profile) // post username, send email
router.route("/user/editself").post(isAuthenticatedUser, editSelf) // post userdata, send

// User mgmt
router.route("/user/getall").post(isAuthenticatedUser, isAuthorized, allUsers) // post, send *users
router.route("/user/create").post(isAuthenticatedUser, isAuthorized, createUser) // post user *data, send
router.route("/user/edit").post(isAuthenticatedUser, isAuthorized, editUser) // post userdata, send

// Groups
router.route("/group/getall").post(isAuthenticatedUser, isAuthorized, allGroups) // post, send *groups
router.route("/group/create").post(isAuthenticatedUser, isAuthorized, createGroup) // post group, send

// Apps
router.route("/app").post(isAuthenticatedUser, isAuthorized, getApp) // edit button for PL only, view details button for anyone
router.route("/app/getall").post(isAuthenticatedUser, isAuthorized, allApps) // when app page is loaded by anyone
router.route("/app/create").post(isAuthenticatedUser, isAuthorized, createApp) // submit button for PL only
router.route("/app/edit").post(isAuthenticatedUser, isAuthorized, editApp) // submit button for PL only

// Plans
router.route("/plan").post(isAuthenticatedUser, isAuthorized, getPlan) // display plan dates when selected by task
router.route("/plan/getall").post(isAuthenticatedUser, isAuthorized, allPlans) // when plan page is loaded by PM
router.route("/plan/create").post(isAuthenticatedUser, isAuthorized, createPlan) // button for PM only
router.route("/plan/edit").post(isAuthenticatedUser, isAuthorized, editPlan) // button for PM only

// Tasks
router.route("/Task/getall").post(isAuthenticatedUser, isAuthorized, allTasks) // display kanban board for all users
router.route("/Task/getall").post(isAuthenticatedUser, isAuthorized, getTask) // display task information to everyone

// use router
app.use(router)

// Route not found catch
app.all("*", (req, res) => {
  res.json({
    error: "routenotfound"
  })
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
