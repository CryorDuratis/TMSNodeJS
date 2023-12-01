// require node modules
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")

// dotenv set up
dotenv.config({ path: "./config/config.env" })

// token to send back using cookie
const sendToken = (user, res) => {
  // creates token based on user that logged in
  const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  })

  // sets cookie options
  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000), // expiry date = current date + duration in days
    httpOnly: true,
    sameSite: false,
  }

  // cookie secure for production environment
  if (process.env.NODE_ENV === "production") {
    options.secure = true
  }

  // send body with token, use cookie.set in frontend to store
  res.cookie("token", token, options).json({
    success: true,
    username: user.username,
    usergroups: user.role.split(","),
  })
}

module.exports = sendToken
