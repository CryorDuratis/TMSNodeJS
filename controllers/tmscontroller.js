// require app modules
const { executeQuery } = require("../config/db")

// URL received is /
exports.home = async (req, res, next) => {
  // check user role to determine if admin button appears
  var querystr = `SELECT role FROM users WHERE username = ?`
  const values = [req.user]

  try {
    const result = await executeQuery(querystr, values)
      // return result
      res.status(200).json({
        success: true,
        message: `home works, user is ${result[0].role === 'admin' ? result[0].role : 'not admin'}`
      })
    
  } catch (error) {
    console.error("Error executing query:", error.message)
  }
}
