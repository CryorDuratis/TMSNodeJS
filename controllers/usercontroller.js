// require node modules
const bcrypt = require("bcryptjs")

// require app modules
const { executeQuery } = require("../config/db")
const sendToken = require("../util/JWToken")
const { checkGroup } = require("../util/checkGroup")
const { hashPass } = require("../util/hashPass")

// URL get /login
exports.loginDisplay = async (req, res, next) => {
  // if jwttoken is on browser, react will redirect
  // displays
  res.status(200).json({
    success: true,
    message: "login works"
  })
}

// URL post /login
exports.loginForm = async (req, res, next) => {
  const { username, password } = req.body
  console.log(username)
  console.log(password)
  // sql query for matching user
  var querystr = `SELECT username, \`password\` FROM users WHERE username = ?`
  const values = [username]

  try {
    const result = await executeQuery(querystr, values)
    // if right, send token and user info, react displays home
    if (result[0]) {
      console.log("user login password: ", result[0].password)
      // compares the passwords asynchronously
      const isMatched = bcrypt.compare(password, result[0].password, err => {
        if (err) {
          console.error("Error comparing password:", err)
          return
        }
      })
      if (isMatched) {
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

// URL get /logout, token will be emptied, then react side will check for token and redirect to login
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

// URL get /profile
exports.profile = async (req, res, next) => {
  // on click, show edit profile component, get username and email to display
  var querystr = `SELECT email FROM users WHERE username = ?`
  const values = [req.user]

  try {
    const result = await executeQuery(querystr, values)
    // return result
    res.status(200).json({
      success: true,
      message: "username and email displayed to for edit screen"
    })
  } catch (error) {
    console.error("Error executing query:", error.message)
  }
}

// URL post /profile/edit
exports.editform = async (req, res, next) => {
  if (req.body.password) {
    // hash password
    req.body.password = await hashPass(req.body.password)
    console.log("hashed password is: ", req.body.password)
  }
  const fields = Object.keys(req.body)
  const values = Object.values(req.body)
  const setClause = fields.map(field => `\`${field}\` = ?`).join(", ") // col1 = ?, col2 = ?...
  var querystr = `UPDATE users SET ${setClause} WHERE username = ?`
  values.push(req.user) // ensures that username is bounded by ''

  try {
    console.log(querystr)
    const result = await executeQuery(querystr, values) // replace all the ? with the form values
    // return result
    res.status(200).json({
      success: true,
      message: "profile edited successfully"
    })
  } catch (error) {
    console.error("Error executing query:", error.message)
  }
}

// URL get /admin
exports.admin = async (req, res, next) => {
  // check if authorized
  const authorized = await checkGroup(req.user, "%admin%")
  if (!authorized) {
    return res.status(400).json({
      success: false,
      message: `unauthorized access`
    })
  }
  // get all user info
  var querystr = `SELECT * FROM users`
  var values = []

  try {
    const result = await executeQuery(querystr, values)
    // get all group info
    querystr = `SELECT * FROM grouplist`

    try {
      const result2 = await executeQuery(querystr, values)
      // return result
      res.status(200).json({
        success: true,
        message: `admin works, ${result.length} user(s) found, ${result2.length} group(s) found`,
        data: result
      })
    } catch (error) {
      console.error("Error executing query:", error.message)
    }
  } catch (error) {
    console.error("Error executing query:", error.message)
  }
}

// URL post /admin/edit
exports.adminEditForm = async (req, res, next) => {
  // check if authorized
  const authorized = await checkGroup(req.user, "%admin%")
  if (!authorized) {
    return res.status(400).json({
      success: false,
      message: `unauthorized access`
    })
  }
  if (req.body.password) {
    // hash password
    req.body.password = await hashPass(req.body.password)
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
  values = values.slice(0, -2).map(value => (value === "role" ? value.join(",") : value === "active" ? 1 : value === "disabled" ? 0 : value))

  var querystr = `UPDATE users SET ${setClause} WHERE username = ?`
  values.push(req.body.currUsername) // in case username is modified, currUsername will be used to locate the user
  console.log("values are: ", values)
  try {
    const result = await executeQuery(querystr, values) // replace all the ? with the form values
    // return result
    res.status(200).json({
      success: true,
      message: "user edited successfully"
    })
  } catch (error) {
    console.error("Error executing query:", error.message)
  }
}

// URL post /admin/create
exports.adminCreateForm = async (req, res, next) => {
  // check if authorized
  const authorized = await checkGroup(req.user, "%admin%")
  if (!authorized) {
    return res.status(400).json({
      success: false,
      message: `unauthorized access`
    })
  }

  // Validate that required fields are present
  if (!req.body.password || !req.body.username) {
    return res.status(400).json({ error: "Username and password are required fields" })
  }

  // hash password
  req.body.password = await hashPass(req.body.password)
  console.log("hashed password is: ", req.body.password)

  // check if username is duplicate
  var querystr = `SELECT username FROM users WHERE username = '${req.body.username}'`
  try {
    const result = await executeQuery(querystr, values) // replace all the ? with the form values
    // return result
    if (result.length > 0)
      res.status(400).json({
        success: false,
        message: "user already exists"
      })
  } catch (error) {
    console.error("Error executing query:", error.message)
  }
  // create new user

  const requiredFields = ["username", "password"]

  var fields = Object.keys(req.body)
  var values = Object.values(req.body)

  // converts form body to db appropriate values
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      console.error("Error generating salt:", err)
      return
    }

    values = values.map(value =>
      value === "password"
        ? bcrypt.hash(password, salt, err => {
            if (err) {
              console.error("Error hashing password:", err)
              return
            }
          })
        : value === "role"
        ? value.join(",")
        : value
    )
  })

  const placeholders = fields.map(field => `\`${field}\` = ?`).join(", ")
  querystr = `INSERT INTO users SET ${placeholders}`
  try {
    const result = await executeQuery(querystr, values) // replace all the ? with the form values
    // return result
    res.status(200).json({
      success: true,
      message: "user created successfully"
    })
  } catch (error) {
    console.error("Error executing query:", error.message)
  }
}

// URL post /admin/group
exports.adminGroupForm = async (req, res, next) => {
  // check if authorized
  const authorized = await checkGroup(req.user, "%admin%")
  if (!authorized) {
    return res.status(400).json({
      success: false,
      message: `unauthorized access`
    })
  }
  // Validate that required fields are present
  if (!req.body.role) {
    return res.status(400).json({ error: "Groupname is a required field" })
  }
  // check if group is duplicate
  var querystr = `SELECT * FROM grouplist WHERE groupname = '${req.body.role}'`
  try {
    const result = await executeQuery(querystr, values) // replace all the ? with the form values
    // return result
    if (result.length > 0)
      res.status(400).json({
        success: false,
        message: "group already exists"
      })
  } catch (error) {
    console.error("Error executing query:", error.message)
  }
  // create new group
  var values = [req.body.role]
  querystr = `INSERT INTO grouplist VALUES (?)`
  try {
    const result = await executeQuery(querystr, values) // replace all the ? with the form values
    // return result
    res.status(200).json({
      success: true,
      message: "group created successfully"
    })
  } catch (error) {
    console.error("Error executing query:", error.message)
  }
}
