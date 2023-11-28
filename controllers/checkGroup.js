// require app modules
const { executeQuery } = require("../config/db")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")

const Checkgroup = catchAsyncErrors(async (userid, groupname) => {
  var querystr = `SELECT role FROM users WHERE username = ? AND role LIKE ?`
  const values = [userid, groupname]

  const result = await executeQuery(querystr, values)
  // return result
  console.log("checkgroup returns:", result.length > 0)
  return result.length > 0
})

exports.Checkgroup = catchAsyncErrors(async (req, res) => {
  result = await Checkgroup(req.user.username, req.body.group)
  return res.json({
    success: result
  })
})
