// require node modules
const jwt = require("jsonwebtoken")

// require app modules
const { executeQuery } = require("../functions/db")
const dotenv = require("dotenv")
const catchAsyncErrors = require("../functions/catchAsyncErrors")
dotenv.config({ path: "./config/config.env" })

// post /login
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  // if token doesnt exist
  if (!req.cookies.token) {
    return res.json({
      loggedin: false,
      message: "Please log in"
    })
  }
  // gets token from httponly request cookie header
  const token = req.cookies.token

  // gets loggedin user username
  const payload = jwt.verify(token, process.env.JWT_SECRET)
  console.log("current username:", payload.username)

  // sql query for user info
  var querystr = `SELECT * FROM users WHERE username = ? and isactive = 1`
  const values = [payload.username]

  const result = await executeQuery(querystr, values)

  // if no matching user found
  if (result.length < 1) {
    return res.json({
      loggedin: false,
      message: "Invalid token"
    })
  }

  const user = result[0]
  const usergroups = user.role.split(",")

  return res.json({
    loggedin: true,
    username: user.username,
    usergroups
  })
})
