// require node modules
const bcrypt = require("bcryptjs")

// require app modules
const { executeQuery } = require("../config/db")
const sendToken = require("../authentication/JWToken")
const catchAsyncErrors = require("../errorhandling/catchAsyncErrors")

// post /login
exports.loginForm = catchAsyncErrors(async (req, res, next) => {
  const { username, password } = req.body

  // if empty login submission - should be handled client side
  if (!username || !password) {
    return res.json({
      success: false,
      message: "required",
    })
  }

  // sql query for matching user that is active
  var querystr = `SELECT * FROM users WHERE username = ? AND isactive = 1`
  const values = [username]

  const result = await executeQuery(querystr, values)

  // if no matching user found
  if (result.length < 1) {
    return res.json({
      success: false,
      message: "invalid",
    })
  }

  const user = result[0]

  // compares the passwords asynchronously
  console.log(password)
  console.log(user.password)
  const isMatched = await bcrypt.compare(password, user.password)
  console.log(isMatched)

  if (!isMatched) {
    return res.json({
      success: false,
      message: "invalid",
    })
  }

  sendToken(user, res)
})

// post /logout, token will be emptied, then react side will redirect to login
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token").end()
})

// post /user
exports.profile = catchAsyncErrors(async (req, res, next) => {
  const username = req.user

  var querystr = `SELECT email FROM users WHERE username = ?`
  const values = [username]

  const result = await executeQuery(querystr, values)
  // return result
  res.json({
    email: result[0].email,
  })
})

// post /user/edit
exports.editUser = catchAsyncErrors(async (req, res, next) => {
  if (req.body.password !== undefined) {
    // validate password
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\/-])[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\\/-]{8,10}$/

    if (!passwordRegex.test(req.body.password)) {
      return res.json({
        success: false,
        message: "password",
      })
    }

    // hash password
    const salt = await bcrypt.genSalt(10)
    req.body.password = await bcrypt.hash(req.body.password, salt)
    console.log("hashed password is: ", req.body.password)
  }

  const { groupname, token, ...rest } = req.body

  const fields = Object.keys(rest)
  const values = Object.values(rest)
  const setClause = fields.map((field) => `\`${field}\` = ?`).join(", ") // col1 = ?, col2 = ?...

  var querystr = `UPDATE users SET ${setClause} WHERE username = ?`
  values.push(req.body.username) // ensures that username is bounded by ''

  console.log("querystr: ", querystr)
  console.log("values: ", values)
  const userData = await executeQuery(querystr, values) // replace all the ? with the form values
  // return result
  return res.json({
    success: true,
  })
})

// URL post /user/editself
exports.editSelf = catchAsyncErrors(async (req, res, next) => {
  if (req.body.password !== undefined) {
    // validate password
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\/-])[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\\/-]{8,10}$/

    if (!passwordRegex.test(req.body.password)) {
      return res.json({
        success: false,
        message: "password",
      })
    }

    // hash password
    const salt = await bcrypt.genSalt(10)
    req.body.password = await bcrypt.hash(req.body.password, salt)
    console.log("hashed password is: ", req.body.password)
  }

  const { groupname, token, ...rest } = req.body

  const fields = Object.keys(rest)
  const values = Object.values(rest)

  const setClause = fields.map((field) => `\`${field}\` = ?`).join(", ") // col1 = ?, col2 = ?...

  var querystr = `UPDATE users SET ${setClause} WHERE username = ?`
  values.push(req.user) // ensures that username is bounded by ''

  console.log(querystr)
  const userData = await executeQuery(querystr, values) // replace all the ? with the form values
  // return result
  return res.json({
    success: true,
  })
})

// URL post /user/getall
exports.allUsers = catchAsyncErrors(async (req, res, next) => {
  // get all user info
  var querystr = "SELECT `username`,`email`,`role`,`isactive` FROM users ORDER BY `username`"
  var values = []

  const usersData = await executeQuery(querystr, values)

  // return result
  res.json({
    usersData,
  })
})

// URL post /user/create
exports.createUser = catchAsyncErrors(async (req, res, next) => {
  const { username, password, email = null, role = null } = req.body
  // Validate that required fields are present
  if (!username || !password) {
    return res.json({
      success: false,
      message: "required",
    })
  }

  // check if username is duplicate
  var querystr = `SELECT username FROM users WHERE username = ?`
  var values = [username]

  var result = await executeQuery(querystr, values)
  // return result
  if (result.length > 0)
    return res.json({
      success: false,
      message: "conflict",
    })

  // validate password
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\/-])[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\\/-]{8,10}$/

  if (!passwordRegex.test(req.body.password)) {
    return res.json({
      success: false,
      message: "password",
    })
  }

  // hash password
  const salt = await bcrypt.genSalt(10)
  req.body.password = await bcrypt.hash(req.body.password, salt)
  console.log("hashed password is: ", req.body.password)

  // insert
  querystr = `INSERT INTO users VALUES (?,?,?,?,1)`
  values = [username, password, email, role]

  result = await executeQuery(querystr, values)
  // return result
  return res.json({
    success: true,
  })
})

// URL post /group/getall
exports.allGroups = catchAsyncErrors(async (req, res, next) => {
  // get all group info
  var querystr = `SELECT groupname FROM grouplist`
  var values = []

  const groupsData = await executeQuery(querystr, values)

  // return result
  return res.json({
    groupsData,
  })
})

// URL post /group/create
exports.createGroup = catchAsyncErrors(async (req, res, next) => {
  const { group } = req.body
  // Validate that required fields are present
  if (!group) {
    return res.json({
      success: false,
      message: "required",
    })
  }
  // check if group is duplicate
  var querystr = `SELECT * FROM grouplist WHERE groupname = ?`
  const values = [group]

  const result = await executeQuery(querystr, values)
  // return result
  if (result.length > 0)
    return res.json({
      success: false,
      message: "conflict",
    })

  // create new group
  querystr = `INSERT INTO grouplist VALUES (?)`

  result = await executeQuery(querystr, values)
  // return result
  res.end()
})
