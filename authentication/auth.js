// require node modules
const jwt = require("jsonwebtoken")

// require app modules
const { executeQuery } = require("../config/db")
const dotenv = require("dotenv")
const catchAsyncErrors = require("../errorhandling/catchAsyncErrors")
dotenv.config({ path: "./config/config.env" })

// post /login
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  // if token doesnt exist
  if (!req.body.token) {
    return res.json({
      unauth: true,
    })
  }
  // gets token from httponly request cookie header
  const token = req.body.token

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
      unauth: true,
    })
  }

  const user = result[0]
  req.user = user.username

  next()
})
