// All node modules are imported here
const express = require("express")

// All app modules are imported here
const { home, admin } = require("../controllers/tmscontroller")
const { isAuthenticatedUser } = require("../middleware/auth")

// const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.js')

// Router is initialized here
const router = express.Router()

// Routes are defined here
router.route("/").get(isAuthenticatedUser, home) // loggedin ? home : redirect login
router.route("/admin").get(isAuthenticatedUser, admin) // loggedin ? admin : redirect login

// Router is exported
module.exports = router
