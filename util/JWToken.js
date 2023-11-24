// require node modules
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")

// dotenv set up
dotenv.config({ path: "./config/config.env" })

// token to send back using cookie
const sendToken = (username, statusCode, res) => {
  // creates token based on user that logged in
  const token = jwt.sign(username, process.env.JWT_SECRET, {
    expiresIn: 3000
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
