// require node modules
const jwt = require("jsonwebtoken")

// dotenv set up
require("dotenv").config({ path: "./config/config.env" })

// token to send back using cookie
const sendToken = (user, statusCode, res) => {
  // creates token based on user that logged in
  const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY
  })

  // sets cookie options
  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000), // expiry date = current date + duration in days
    httpOnly: true
  }

  // cookie secure for production environment
  if (process.env.NODE_ENV === "production") {
    options.secure = true
  }

  // send cookie back with token
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token
  })
}

module.exports = sendToken
