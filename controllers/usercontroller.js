// require node modules
const bcrypt = require("bcryptjs")

// require app modules
const { executeQuery } = require("../config/db")
const sendToken = require("../util/JWToken")
const { checkGroup } = require("../util/checkGroup")

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
      // return result
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
      // return result
      res.status(200).json({
        success: true,
        message: "profile edited successfully"
      })
    
  } catch (error) {
    console.error("Error executing query:", error.message)
  }
}

// URL received is /admin
exports.admin = async (req, res, next) => {
  // check if authorized
  const authorized = await checkGroup(req.user, '%admin%')
  if (!authorized) {
    return res.status(400).json({
      success: false,
      message: `unauthorized access`
    })
  }
    // get all user info
    var querystr = `SELECT * FROM users`
    const values = []
  
    try {
      const result = await executeQuery(querystr, values)
        // return result
        res.status(200).json({
          success: true,
          message: `admin works, ${result.length} user(s) found`
        })
      
    } catch (error) {
      console.error("Error executing query:", error.message)
    }
}

// admin form submitted
exports.adminForm = async (req,res,next)=> {
  // check if authorized
  const authorized = await checkGroup(req.user, '%admin%')
  if (!authorized) {
    return res.status(400).json({
      success: false,
      message: `unauthorized access`
    })
  }
    // check form type
    if (req.body.formtype === "edit") {
      var fields = Object.keys(req.body);
      var values = Object.values(req.body);
  
      const setClause = fields.slice(0,-2).map(field => `\`${field}\` = ?`).join(', '); // slice to exclude the field "currUsername"
      values = values.map(value => (value === 'active' ? 1 : value === 'disabled' ? 0 : value)); // converts elements "active" to 1
  
      var querystr = `UPDATE users SET ${setClause} WHERE username = ?`
      values.push(req.body.currUsername) // in case username is modified, currUsername will be used to locate the user
      try {
        const result = await executeQuery(querystr,values) // replace all the ? with the form values
          // return result
          res.status(200).json({
            success: true,
            message: "user edited successfully"
          })
        
      } catch (error) {
        console.error("Error executing query:", error.message)
      }
    } else if (req.body.formtype === "create") {
      // check if username is duplicate
      var querystr = `SELECT username FROM users WHERE username = '${req.body.username}'`
      try {
        const result = await executeQuery(querystr,values) // replace all the ? with the form values
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
  
      const requiredFields = ['username', 'password'];
      
      var fields = Object.keys(req.body)
      var values = Object.values(req.body)
      
      // Validate that required fields are present
      if (requiredFields.some(field => !values[fields.indexOf(field)])) {
        return res.status(400).json({ error: 'Username and password are required fields' });
      }
      
      const placeholders = fields.slice(0,-1).map(field => `\`${field}\` = ?`).join(', ');
      querystr = `INSERT INTO users SET ${placeholders}`;
      try {
        const result = await executeQuery(querystr,values) // replace all the ? with the form values
          // return result
          res.status(200).json({
            success: true,
            message: "user created successfully"
          })
        
      } catch (error) {
        console.error("Error executing query:", error.message)
      }
    } else {
      res.status(400).json({
        success: false,
        message: "how did you get here"
      })
    }
}