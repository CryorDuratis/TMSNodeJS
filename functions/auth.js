// require node modules
const jwt = require("jsonwebtoken")

// require app modules
const { executeQuery } = require("./db")
const dotenv = require("dotenv")
const catchAsyncErrors = require("./catchAsyncErrors")
dotenv.config({ path: "./config/config.env" })

// check loggedin
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  let token
  // splits username and token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }
  // if token doesnt exist
  if (!token) {
    return res.json({
      authenticated: false,
    })
  }

  // passes down loggedin user username
  const payload = jwt.verify(token, process.env.JWT_SECRET)
  console.log(payload)
  req.user = payload.username
  console.log("current username:", req.user)

  // sql query for user info
  var querystr = `SELECT * FROM users WHERE username = ?`
  const values = [req.user]

  const result = await executeQuery(querystr, values)

  // if no matching user found
  if (result.length < 1) {
    return res.json({
      authenticated: false,
      message: "User account has been modified, please log in again",
    })
  }

  const user = result[0]

  // checks if disabled
  const isActive = user.isactive

  if (!isActive) {
    return res.json({
      authenticated: false,
      message: "You are not authorized to view this page",
    })
  }

  next()
})
