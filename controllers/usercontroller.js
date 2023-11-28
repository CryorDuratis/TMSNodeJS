// require node modules
const bcrypt = require("bcryptjs")

// require app modules
const { executeQuery } = require("../config/db")
const sendToken = require("../util/JWToken")
const ErrorHandler = require("../util/errorHandler")

// URL get /login
exports.loginDisplay = Promise.resolve(async (req, res, next) => {
  res.json({
    success: true,
    message: "login works"
  })
}).catch(next)

// URL post /login
exports.loginForm = Promise.resolve(async (req, res, next) => {
  const { username, password } = req.body

  // if empty login submission
  if (!req.body.username || !req.body.password) {
    return res.json({
      success: false,
      error: "required",
      message: "Please enter Login Details"
    })
  }

  // sql query for matching user
  var querystr = `SELECT * FROM users WHERE username = ?`
  const values = [username]

  const result = await executeQuery(querystr, values)

  // if no matching user found
  if (result.length < 1) {
    return next(new ErrorHandler("Invalid Login Details, please try again", 401))
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
    return next(new ErrorHandler("Invalid Login Details, please try again", 401))
  }

  sendToken(username, 200, res)
}).catch(next)

// URL get /logout, token will be emptied, then react side will check for token and redirect to login
exports.logout = Promise.resolve(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now()),
    httpOnly: true
  })

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  })
}).catch(next)

// URL get /profile
exports.profile = Promise.resolve(async (req, res, next) => {
  // on click, show edit profile component, get username and email to display
  var querystr = `SELECT email FROM users WHERE username = ?`
  const values = [req.user]

  const result = await executeQuery(querystr, values)
  // return result
  res.status(200).json({
    success: true,
    message: "username and email displayed to for edit screen"
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
  const setClause = fields.map(field => `\`${field}\` = ?`).join(", ") // col1 = ?, col2 = ?...
  var querystr = `UPDATE users SET ${setClause} WHERE username = ?`
  values.push(req.user) // ensures that username is bounded by ''

  console.log(querystr)
  const result = await executeQuery(querystr, values) // replace all the ? with the form values
  // return result
  res.status(200).json({
    success: true,
    message: "profile edited successfully"
  })
}).catch(next)

// URL get /admin
exports.admin = Promise.resolve(async (req, res, next) => {
  // get all user info
  var querystr = `SELECT * FROM users`
  var values = []

  const result = await executeQuery(querystr, values)
  // get all group info
  querystr = `SELECT * FROM grouplist`

  const result2 = await executeQuery(querystr, values)
  // return result
  res.status(200).json({
    success: true,
    message: `admin works, ${result.length} user(s) found, ${result2.length} group(s) found`,
    data: result
  })
}).catch(next)

// URL post /admin/edit
exports.adminEditForm = Promise.resolve(async (req, res, next) => {
  if (req.body.password) {
    // hash password
    const salt = await bcrypt.genSalt(10)
    req.body.password = await bcrypt.hash(req.body.password, salt)
    console.log("hashed password is: ", req.body.password)
  }

  var fields = Object.keys(req.body)
  var values = Object.values(req.body)

  // slice to exclude the field "currUsername"
  const setClause = fields
    .slice(0, -1)
    .map(field => `\`${field}\` = ?`)
    .join(", ")

  // converts form body to db appropriate values
  values = values.slice(0, -1).map(value => (value === "role" ? value.join(",") : value === "active" ? 1 : value === "disabled" ? 0 : value))

  var querystr = `UPDATE users SET ${setClause} WHERE username = ?`
  values.push(req.body.currUsername) // in case username is modified, currUsername will be used to locate the user
  console.log("values are: ", values)

  const result = await executeQuery(querystr, values) // replace all the ? with the form values
  // return result
  res.status(200).json({
    success: true,
    message: "user edited successfully"
  })
}).catch(next)

// URL post /admin/create
exports.adminCreateForm = Promise.resolve(async (req, res, next) => {
  // Validate that required fields are present
  if (!req.body.password || !req.body.username) {
    return next(new ErrorHandler("Please enter all required fields", 400))
  }

  // hash password
  const salt = await bcrypt.genSalt(10)
  req.body.password = await bcrypt.hash(req.body.password, salt)
  console.log("hashed password is: ", req.body.password)

  // check if username is duplicate
  var querystr = `SELECT username FROM users WHERE username = '${req.body.username}'`

  const result = await executeQuery(querystr, values) // replace all the ? with the form values
  // return result
  if (result.length > 0) return next(new ErrorHandler("This username already exists! Please choose a different username", 409))

  // create new user
  const requiredFields = ["username", "password"]

  var fields = Object.keys(req.body)
  var values = Object.values(req.body)

  // converts form body to db appropriate values
  if (req.body.role) {
    req.body.role = req.body.role.join(",")
  }

  const placeholders = fields.map(field => `\`${field}\` = ?`).join(", ")
  querystr = `INSERT INTO users SET ${placeholders}`

  result = await executeQuery(querystr, values) // replace all the ? with the form values
  // return result
  res.status(200).json({
    success: true,
    message: "user created successfully"
  })
}).catch(next)

// URL post /admin/group
exports.adminGroupForm = Promise.resolve(async (req, res, next) => {
  // Validate that required fields are present
  if (!req.body.role) {
    return next(new ErrorHandler("Please enter all required fields", 400))
  }
  // check if group is duplicate
  var querystr = `SELECT * FROM grouplist WHERE groupname = '${req.body.role}'`

  const result = await executeQuery(querystr, values) // replace all the ? with the form values
  // return result
  if (result.length > 0) return next(new ErrorHandler("This group already exists! Please try a different group name", 409))

  // create new group
  var values = [req.body.role]
  querystr = `INSERT INTO grouplist VALUES (?)`

  result = await executeQuery(querystr, values) // replace all the ? with the form values
  // return result
  res.status(200).json({
    success: true,
    message: "group created successfully"
  })
}).catch(next)
