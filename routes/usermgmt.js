// All node modules are imported here
const express = require("express")

// All app modules are imported here
const { loginDisplay, loginForm, logout, profile, editform, admin, adminCreateForm, adminEditForm, adminGroupForm } = require("../controllers/usercontroller")
const { isAuthenticatedUser } = require("../middleware/auth")
const { Checkgroup } = require("../controllers/checkGroup")

// const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.js')

// Router is initialized here
const router = express.Router()

// Routes are defined here
router.route("/login").get(isAuthenticatedUser, loginDisplay) // check if user is logged in
router.route("/login").post(loginForm) // check login details, return success
router.route("/logout").get(isAuthenticatedUser, logout) // check if user is logged in, set user as logged out, return success
router.route("/profile").get(isAuthenticatedUser, profile) // check if user is logged in, retrieve user data
router.route("/profile/edit").post(isAuthenticatedUser, editform) // check if user is logged in, modify user details, retrieve user data
router.route("/admin").get(isAuthenticatedUser, admin) // check if user is logged in, retrieve user list
router.route("/admin/create").post(isAuthenticatedUser, adminCreateForm) // loggedin ? submitform -> valid -> updated : login
router.route("/admin/edit").post(isAuthenticatedUser, adminEditForm) // loggedin ? submitform -> valid -> updated : login
router.route("/admin/group").post(isAuthenticatedUser, adminGroupForm) // loggedin ? submitform -> valid -> updated : login
router.route("/checkgroup").post(Checkgroup) // loggedin ? submitform -> valid -> updated : login

// Router is exported
module.exports = router
