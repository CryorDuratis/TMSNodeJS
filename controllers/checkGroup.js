// require app modules
const catchAsyncErrors = require("../errorhandling/catchAsyncErrors")
const { executeQuery } = require("../config/db")

// Checkgroup function
const Checkgroup = catchAsyncErrors(async (userid, groupname) => {
  var querystr = `SELECT role FROM users WHERE username = ? AND role LIKE ?`
  const values = [userid, `%${groupname}%`]

  const result = await executeQuery(querystr, values)
  // return result
  console.log("checkgroup returns:", result.length > 0)
  return result.length > 0
})

// Isolated API call
const CheckgroupCall = catchAsyncErrors(async (req, res, next) => {
  console.log("groupname is ", req.body.groupname)
  const authorized = await Checkgroup(req.user, req.body.groupname)

  if (!authorized) {
    return res.json({
      unauth: "role",
      user: req.user,
    })
  } else {
    return res.json({
      user: req.user,
    })
  }
})

// Authorization check
const isAuthorized = catchAsyncErrors(async (req, res, next) => {
  const authorized = await Checkgroup(req.user, req.body.groupname)

  if (!authorized) {
    return res.json({
      unauth: "role",
    })
  } else {
    next()
  }
})

module.exports = { Checkgroup, CheckgroupCall, isAuthorized }
