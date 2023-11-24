// require node modules
const jwt = require("jsonwebtoken")

// require app modules
const dotenv = require("dotenv")
dotenv.config({ path: "./config/config.env" })

//catch async
//errorhandler

exports.isAuthenticatedUser = async (req, res, next) => {
  let token
  // splits username and token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "not authenticated, log in first"
    })
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  // passes down loggedin user username
  req.user = decoded.username

  next()
}
