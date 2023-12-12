// require app modules
const { executeQuery } = require("../config/db")
const catchAsyncErrors = require("../errorhandling/catchAsyncErrors")

// post /app/create
exports.createApp = catchAsyncErrors(async (req, res, next) => {
  const { acronym, rnumber } = req.body
})
// post /app/edit
exports.editApp = catchAsyncErrors(async (req, res, next) => {})
// post /app
exports.getApp = catchAsyncErrors(async (req, res, next) => {
  const { appacro } = req.body

  var querystr = `SELECT * FROM application WHERE App_Acronym = ?`
  const values = [appacro]

  const result = await executeQuery(querystr, values)
  // return result
  res.json({
    appdata: result[0]
  })
})

// post /app/getAll
exports.allApps = catchAsyncErrors(async (req, res, next) => {
  // get all app info
  var querystr = "SELECT `App_Acronym`,`App_startDate`,`App_endDate` FROM application ORDER BY `App_Acronym`"
  var values = []

  const appsData = await executeQuery(querystr, values)

  // return result
  res.json({
    appsData
  })
})
