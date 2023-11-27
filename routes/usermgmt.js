// All node modules are imported here
const express = require("express")

// All app modules are imported here
const { loginDisplay, loginForm, logout, edit, editform, admin, adminCreateForm, adminEditForm, adminGroupForm } = require("../controllers/usercontroller")
const { isAuthenticatedUser } = require("../middleware/auth")

// const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.js')

// Router is initialized here
const router = express.Router()

// Routes are defined here
router.route("/login").get(isAuthenticatedUser, loginDisplay) // loggedin(token) ? redirect home : login
router.route("/login").post(loginForm) // valid(res token) ? redirected url || home : res error -> login
router.route("/logout").get(isAuthenticatedUser, logout) // loggedin? logout : login
router.route("/profile").get(isAuthenticatedUser, edit) // loggedin? display edit : login
router.route("/profile/edit").post(isAuthenticatedUser, editform) // loggedin? submit form -> valid(password rule) -> updated : login
router.route("/admin").get(isAuthenticatedUser, admin) // loggedin ? admin : redirect login
router.route("/admin/create").post(isAuthenticatedUser, adminCreateForm) // loggedin ? submitform -> valid -> updated : login
router.route("/admin/edit").post(isAuthenticatedUser, adminEditForm) // loggedin ? submitform -> valid -> updated : login
router.route("/admin/group").post(isAuthenticatedUser, adminGroupForm) // loggedin ? submitform -> valid -> updated : login

// Router is exported
module.exports = router
