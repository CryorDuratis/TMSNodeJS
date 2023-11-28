// require app modules
const { executeQuery } = require("../config/db")

// URL get app/:appacro/tasks/:taskid
exports.taskinfo = Promise.resolve(async (req, res, next) => {
  // check if the user has permissions
  // check which group has permissions
  // given current task state and app acro, return user groups with permissions
  // check if user is in groups
  // given username, return if user groups include groups with permissions: Checkgroup(userid, groupname)
  // res.json permissions: view || edit
  // get task info
}).catch((error) => {
  console.error("Async error:", error.message)
  return res.json({
    error: error.name,
  })
})
