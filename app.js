// All node modules are imported here
const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const cookieParser = require("cookie-parser")

// All controller API are imported here
const { isAuthenticatedUser } = require("./functions/auth")
const { loginDisplay, loginForm, logout, home, profile, editform } = require("./controllers/usercontroller")
const { userMgmt, userMgmtCreateForm, userMgmtEditForm, userMgmtGroupForm } = require("./controllers/usermgmtcontroller")
// const { } = require("../controllers/tmscontroller")

// Express is initiated here
const app = express()

// Uncaught exception error shuts down server here
process.on("uncaughtException", (err) => {
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

router.route("/").get(isAuthenticatedUser, home) // loggedin ? home : redirect login
router.route("/login").get(isAuthenticatedUser, loginDisplay) // check if user is logged in
router.route("/login").post(loginForm) // check login details, return success
router.route("/logout").get(isAuthenticatedUser, logout) // check if user is logged in, set user as logged out, return success
router.route("/profile").get(isAuthenticatedUser, profile) // check if user is logged in, retrieve user data
router.route("/profile/edit").post(isAuthenticatedUser, editform) // check if user is logged in, modify user details, retrieve user data
router.route("/usermgmt").get(isAuthenticatedUser, userMgmt) // check if user is logged in, retrieve user list
router.route("/usermgmt/create").post(isAuthenticatedUser, userMgmtCreateForm) // loggedin ? submitform -> valid -> updated : login
router.route("/usermgmt/edit").post(isAuthenticatedUser, userMgmtEditForm) // loggedin ? submitform -> valid -> updated : login
router.route("/usermgmt/group").post(isAuthenticatedUser, userMgmtGroupForm) // loggedin ? submitform -> valid -> updated : login

// use router
app.use(router)

// Route not found catch
app.all("*", (req, res) => {
  res.json({
    success: false,
    message: `404 error, ${req.originalUrl} route not found`,
  })
})

// Error-handling middleware (defined after other routes and middleware)
app.use((err, req, res, next) => {
  console.error(err.message)
  if (err.name === "TokenExpiredError") {
    return res.json({
      authenticated: false,
      error: "Your session has expired, please log in again",
    })
  } else {
    console.log(err)
    return res.json({
      error: "Internal Server Error",
    })
  }
})

// Server started on port
const server = app.listen(port, () => {
  console.log(`Server started on port ${port} in ${environment} mode`)
})

// Unhandled promise rejection error
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`)
  console.log("Shutting down the server due to unhandled promise rejection.")
  server.close(() => {
    process.exit(1)
  })
})
