// require app modules
const { executeQuery } = require("../config/db")

// URL received is /
exports.home = async (req, res, next) => {
  // show edit profile component, get username and email to display
  var querystr = `SELECT role FROM users WHERE username = ?`
  const values = [req.user]

  try {
    const result = await executeQuery(querystr, values)
      // else, react displays same page
      res.status(200).json({
        success: true,
        message: `home works, user is ${result[0].role === 'admin' ? result[0].role : 'not admin'}`
      })
    
  } catch (error) {
    console.error("Error executing query:", error.message)
  }
}

// URL received is /admin
exports.admin = async (req, res, next) => {
  
    // proceed
    return res.status(200).json({
      success: true,
      message: "admin works"
    })
  
}
