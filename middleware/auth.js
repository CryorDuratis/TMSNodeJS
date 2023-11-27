// require node modules
const jwt = require("jsonwebtoken")

// require app modules
const { executeQuery } = require("../config/db")
const dotenv = require("dotenv")
dotenv.config({ path: "./config/config.env" })

//catch async
//errorhandler
const ErrorHandler = require("../util/errorHandler")

// check loggedin
exports.isAuthenticatedUser = async (req, res, next) => {
  let token
  // splits username and token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }
  // if token doesnt exist
  if (!token) {
    return next(new ErrorHandler("Please log in to access this page", 401))
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    console.log(payload)
    // passes down loggedin user username
    req.user = payload.username
    console.log("current username:", req.user)

    // sql query for user info
    var querystr = `SELECT * FROM users WHERE username = ?`
    const values = [req.user]

    try {
      const result = await executeQuery(querystr, values)

      // if no matching user found
      if (result.length < 1) {
        return next(new ErrorHandler("User account has been modified, please log in again", 401))
      }

      const user = result[0]

      // checks if disabled
      const isActive = user.isactive

      if (!isActive) {
        return next(new ErrorHandler("You are not authorized to view this page", 403))
      }

      next()
    } catch (error) {
      console.error("Error executing query:", error.message)
      return next(new ErrorHandler("Internal Server Error", 500))
    }
  } catch (error) {
    if (err.name === "TokenExpiredError") {
      return next(new ErrorHandler("Your session has expired, please log in again", 401))
    } else {
      return next(new ErrorHandler("Error verifying user, please log in again", 401))
    }
  }
}
