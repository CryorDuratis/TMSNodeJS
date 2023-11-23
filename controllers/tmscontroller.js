const express = require("express")
const session = require("express-session")
const bodyParser = express.json()
const app = express()
app.use(bodyParser)
app.use(session({ secret: "super-secret" }))

exports.home = async (req, res, next) => {
  if (req.session.isLoggedIn === true) {
    // proceed
    return res.status(200).json({
      success: true,
      message: "home works"
    })
  }
  // redirect to login page
  res.redirect("/login")
}
