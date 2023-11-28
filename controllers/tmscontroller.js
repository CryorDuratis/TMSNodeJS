// require app modules
const catchAsyncErrors = require("../functions/catchAsyncErrors")
const { executeQuery } = require("../functions/db")

// URL get app/:appacro/tasks/:taskid
exports.taskinfo = catchAsyncErrors(async (req, res, next) => {
  // check if the user has permissions
  // check which group has permissions
  // given current task state and app acro, return user groups with permissions
  // check if user is in groups
  // given username, return if user groups include groups with permissions: Checkgroup(userid, groupname)
  // res.json permissions: view || edit
  // get task info
})
