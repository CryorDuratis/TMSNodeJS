// All node modules are imported here
const express = require("express")

// All app modules are imported here
const { loginDisplay,loginForm, logout, edit, editform } = require("../controllers/usercontroller")
const { isAuthenticatedUser } = require("../middleware/auth")

// const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.js')

// Router is initialized here
const router = express.Router()

// Routes are defined here
router.route("/login").get(isAuthenticatedUser,loginDisplay) // loggedin(token) ? redirect home : login
router.route("/login").post(loginForm) // valid(res token) ? redirected url || home : res error -> login
router.route("/logout").get(isAuthenticatedUser,logout) // loggedin? logout : login
router.route("/edit").get(isAuthenticatedUser,edit) // loggedin? display edit : login
router.route("/edit").post(isAuthenticatedUser,editform) // loggedin? submit form -> valid(password rule) -> updated : login

// Router is exported
module.exports = router
