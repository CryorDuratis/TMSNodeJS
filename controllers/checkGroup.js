// require app modules
const catchAsyncErrors = require("../errorhandling/catchAsyncErrors")
const { executeQuery } = require("../config/db")

const Checkgroup = catchAsyncErrors(async (userid, groupname) => {
  var querystr = `SELECT role FROM users WHERE username = ? AND role LIKE ?`
  const values = [userid, `%${groupname}%`]

  const result = await executeQuery(querystr, values)
  // return result
  console.log("checkgroup returns:", result.length > 0)
  return result.length > 0
})

exports.Checkgroup = catchAsyncErrors(async (req, res, next) => {
  const authorized = await Checkgroup(req.body.userid, req.body.groupname)
  return res.json({
    authorized,
  })
})
