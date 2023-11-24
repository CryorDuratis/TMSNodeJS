// All node modules are imported here
const express = require("express")

// All app modules are imported here
const { loginForm, logout } = require("../controllers/authcontroller")
const { isAuthenticatedUser } = require("../middleware/auth")

// const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.js')

// Router is initialized here
const router = express.Router()

// Routes are defined here
router.route("/login").get(isAuthenticatedUser) // loggedin -> res token ? redirect home : login
router.route("/login").post(loginForm) // valid -> res username ? redirected url || home : res error -> login
router.route("/logout").get(logout) // loggedin=false, login

// Router is exported
module.exports = router
