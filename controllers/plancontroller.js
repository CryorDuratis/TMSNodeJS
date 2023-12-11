// require app modules
const { executeQuery } = require("../config/db")
const catchAsyncErrors = require("../errorhandling/catchAsyncErrors")

// post /app/create
exports.createPlan = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token").end()
})
// post /app/edit
exports.editPlan = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token").end()
})
// post /app
exports.getPlan = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token").end()
})
// post /app/getAll
exports.allPlans = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token").end()
})
