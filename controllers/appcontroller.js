// require app modules
const { executeQuery } = require("../config/db")
const catchAsyncErrors = require("../errorhandling/catchAsyncErrors")

// post /app/create
exports.createApp = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token").end()
})
// post /app/edit
exports.editApp = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token").end()
})
// post /app
exports.getApp = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token").end()
})
// post /app/getAll
exports.allApps = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token").end()
})
