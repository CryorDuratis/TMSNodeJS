// require app modules
const { executeQuery } = require("../config/db")

// URL received is /
exports.home = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: `home works, user is ${role ? "admin" : "not admin"}`
  })
}
