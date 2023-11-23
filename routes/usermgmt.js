// All node modules are imported here
const express = require("express")

// All app modules are imported here
const { loginDisplay, loginForm, logout, admin } = require("../controllers/authcontroller")

// const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.js')

// Router is initialized here
const router = express.Router()

// Routes are defined here
router.route("/login").get(loginDisplay) // loggedin ? redirect home : login
router.route("/login").post(loginForm) // valid ? redirected url : home
router.route("/logout").get(logout) // loggedin=false, login
router.route("/admin").get(admin) // loggedin ? admin : redirect login

// Router is exported
module.exports = router
