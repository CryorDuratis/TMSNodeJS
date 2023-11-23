// All node modules are imported here
const express = require("express")

// All app modules are imported here
const { login, logout } = require("authcontroller")

const { isAuthenticatedUser, authorizeRoles } = require()

// Router is initialized here
const router = express.Router()

// Routes are defined here
router.route("./")

// Router is exported
module.exports = router
