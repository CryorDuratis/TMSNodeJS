// require node modules
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")

// dotenv set up
dotenv.config({ path: "./config/config.env" })

// token to send back using cookie
const sendToken = (user, res) => {
  // creates token based on user that logged in
  const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY
  })

  // send body with token, use cookie.set in frontend to store
  res.json({
    success: true,
    token,
    username: user.username,
    usergroups: user.role.split(",")
  })
}

module.exports = sendToken
