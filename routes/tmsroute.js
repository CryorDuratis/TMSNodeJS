// All node modules are imported here
const express = require("express")

// All app modules are imported here
const { home } = require("tmscontroller")

// const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.js')

// Router is initialized here
const router = express.Router()

// Routes are defined here
router.route("/").get(home) // loggedin ? home : redirect login

// Router is exported
module.exports = router
