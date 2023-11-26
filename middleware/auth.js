// require node modules
const jwt = require("jsonwebtoken")

// require app modules
const dotenv = require("dotenv")
dotenv.config({ path: "./config/config.env" })

//catch async
//errorhandler

// check loggedin
exports.isAuthenticatedUser = async (req, res, next) => {
  let token
  // splits username and token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }
  // if token doesnt exist
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "not authenticated, log in first"
    })
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      } else {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    // passes down loggedin user username
    req.user = payload.username
    console.log("current username:",req.user)
  
    next()
  })
}
