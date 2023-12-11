// require app modules
const { executeQuery } = require("../config/db")
const catchAsyncErrors = require("../errorhandling/catchAsyncErrors")

// post /task/create
exports.createTask = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token").end()
})
// post /task
exports.createApp = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token").end()
})

// post /task/promote
exports.changestate = catchAsyncErrors(async (req, res, next) => {
  var { current, promote } = req.body

  // promote ? currentstate++ : currentstate--

  // values = [currentstate, taskid]
  // querystr = "update state set task state = ? where taskid = ?"

  // return res.json({ state: stateConvert(newstate)})
})

// post /task/edit
exports.getTask = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token").end()
})
// post /task/edit
exports.createApp = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token").end()
})
// post /task/edit
exports.createApp = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token").end()
})
// post /task/edit
exports.createApp = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token").end()
})
// post /task/edit
exports.createApp = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token").end()
})
// post /task/edit
exports.createApp = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token").end()
})
