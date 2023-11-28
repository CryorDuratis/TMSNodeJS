// require node modules
const bcrypt = require("bcryptjs")

// require app modules
const { executeQuery } = require("../functions/db")
const sendToken = require("../functions/JWToken")
const Checkgroup = require("../functions/checkGroup")

// URL get /login
exports.loginDisplay = Promise.resolve(async (req, res, next) => {
  res.json({
    success: true,
    message: "login works",
  })
}).catch(next)

// URL post /login
exports.loginForm = Promise.resolve(async (req, res, next) => {
  const { username, password } = req.body

  // if empty login submission - should be handled client side
  if (!req.body.username || !req.body.password) {
    return res.json({
      valid: false,
      message: "Please enter Login Details",
    })
  }

  // sql query for matching user
  var querystr = `SELECT * FROM users WHERE username = ?`
  const values = [username]

  const result = await executeQuery(querystr, values)

  // if no matching user found
  if (result.length < 1) {
    return res.json({
      valid: false,
      message: "Invalid Login Details, please try again",
    })
  }

  const user = result[0]

  // compares the passwords asynchronously
  console.log(password)
  console.log(user.password)
  const isMatched = await bcrypt.compare(password, user.password)
  console.log(isMatched)

  // checks if disabled
  const isActive = user.isactive

  if (!isActive || !isMatched) {
    return res.json({
      valid: false,
      message: "Invalid Login Details, please try again",
    })
  }

  sendToken(user, res)
}).catch(next)

// URL get /logout, token will be emptied, then react side will check for token and redirect to login
exports.logout = Promise.resolve(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now()),
    httpOnly: true,
  })

  res.json({
    success: true,
    message: "Logged out successfully",
  })
}).catch(next)

// URL get /
exports.home = Promise.resolve(async (req, res, next) => {
  // check group to display admin button
  const userMgmtGroups = "admin"
  const userMgmt = Checkgroup(req.user, userMgmtGroups)

  res.status(200).json({
    success: true,
    userMgmt,
  })
}).catch(next)

// URL get /profile
exports.profile = Promise.resolve(async (req, res, next) => {
  // check group to display admin button
  const userMgmtGroups = "admin"
  const userMgmt = Checkgroup(req.user, userMgmtGroups)

  // on click, show edit profile component, get username and email to display
  var querystr = `SELECT email FROM users WHERE username = ?`
  const values = [req.user]

  const userData = await executeQuery(querystr, values)
  // return result
  res.status(200).json({
    success: true,
    userData,
    userMgmt,
  })
}).catch(next)

// URL post /profile/edit
exports.editform = Promise.resolve(async (req, res, next) => {
  if (req.body.password) {
    // hash password
    const salt = await bcrypt.genSalt(10)
    req.body.password = await bcrypt.hash(req.body.password, salt)
    console.log("hashed password is: ", req.body.password)
  }
  const fields = Object.keys(req.body)
  const values = Object.values(req.body)
  const setClause = fields.map((field) => `\`${field}\` = ?`).join(", ") // col1 = ?, col2 = ?...
  var querystr = `UPDATE users SET ${setClause} WHERE username = ?`
  values.push(req.user) // ensures that username is bounded by ''

  console.log(querystr)
  const userData = await executeQuery(querystr, values) // replace all the ? with the form values
  // return result
  res.status(200).json({
    success: true,
    userData,
  })
}).catch(next)
