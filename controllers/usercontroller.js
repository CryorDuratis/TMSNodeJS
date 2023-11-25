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
  var querystr = `SELECT username, \`password\` FROM users WHERE username = ?`
  const values = [username]

  try {
    const result = await executeQuery(querystr,values)
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

// URL received is /profile/edit
exports.edit = async (req,res,next)=> {
  // on click, show edit profile component, get username and email to display
  var querystr = `SELECT email FROM users WHERE username = ?`
  const values = [req.user]

  try {
    const result = await executeQuery(querystr, values)
      // else, react displays same page
      res.status(200).json({
        success: true,
        message: "username and email displayed to for edit screen"
      })
    
  } catch (error) {
    console.error("Error executing query:", error.message)
  }
}

// edit form submitted
exports.editform = async (req,res,next)=> {
  const fields = Object.keys(req.body);
  const values = Object.values(req.body);
  const setClause = fields.map(field => `\`${field}\` = ?`).join(', '); // col1 = ?, col2 = ?...
  var querystr = `UPDATE users SET ${setClause} WHERE username = ?`
  values.push(req.user) // ensures that username is bounded by ''

  try {
    console.log(querystr)
    const result = await executeQuery(querystr,values) // replace all the ? with the form values
      // else, react displays same page
      res.status(200).json({
        success: true,
        message: "profile edited successfully"
      })
    
  } catch (error) {
    console.error("Error executing query:", error.message)
  }
}