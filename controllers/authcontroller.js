// require node modules
const bcrypt = require("bcryptjs")

// require app modules
const { executeQuery } = require("../config/db")
const sendToken = require("../util/JWToken")

// URL received is /login
exports.loginDisplay = async (req, res, next) => {
  // if jwttoken is on browser, react will redirect
  // displays
  res.status(200).json({
    success: true,
    message: "login works"
  })
}

// login form submitted
exports.loginForm = async (req, res, next) => {
  const { username, password } = req.body
  console.log(username)
  console.log(password)
  // sql query for matching user
  var querystr = `SELECT username, \`password\` FROM users WHERE username = '${username}'`

  try {
    const result = await executeQuery(querystr)
    // if right, send token and user info, react displays home
    if (result[0]) {
      // const cryptedpw = await bcrypt.hash(password)
      if (password === result[0].password) {
        sendToken(username, 200, res)
      }
    } else {
      // else, react displays same page
      res.status(401).json({
        success: false,
        message: "invalid login info"
      })
    }
  } catch (error) {
    console.error("Error executing query:", error.message)
  }
}

// URL received is /logout, token will be emptied, then react side will check for token and redirect to login
exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now()),
    httpOnly: true
  })

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  })
}
