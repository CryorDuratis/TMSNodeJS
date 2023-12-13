// require app modules
const { executeQuery } = require("../config/db")
const catchAsyncErrors = require("../errorhandling/catchAsyncErrors")

// post /app/create
exports.createApp = catchAsyncErrors(async (req, res, next) => {
  const { App_Acronym, App_Rnumber, App_startDate = null, App_endDate = null, App_Description = null, App_permit_Open = null, App_permit_toDoList = null, App_permit_Doing = null, App_permit_Done = null } = req.body.formData

  // required fields
  if (!App_Acronym || !App_Rnumber) {
    return res.json({
      success: false,
      message: "required",
    })
  }

  // check if appacro is duplicate
  var querystr = `SELECT App_Acronym FROM application WHERE App_Acronym = ?`
  var values = [App_Acronym]

  var result = await executeQuery(querystr, values)
  // return result
  if (result.length > 0)
    return res.json({
      success: false,
      message: "conflict",
    })

  // insert
  querystr = `INSERT INTO application VALUES (?,?,?,?,?,?,?,?,?,'Project Lead')`
  values = [App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done]
  console.log("values inserted are ", values)
  result = await executeQuery(querystr, values)
  // return result
  return res.json({
    success: true,
  })
})
// post /app/edit
exports.editApp = catchAsyncErrors(async (req, res, next) => {
  const { groupname, token, appacro, ...rest } = req.body

  const fields = Object.keys(rest)
  const values = Object.values(rest)
  const setClause = fields.map((field) => `\`${field}\` = ?`).join(", ") // col1 = ?, col2 = ?...

  var querystr = `UPDATE application SET ${setClause} WHERE App_Acronym = ?`
  values.push(appacro)

  console.log("querystr: ", querystr)
  console.log("values: ", values)
  const appData = await executeQuery(querystr, values) // replace all the ? with the form values
  // return result
  return res.json({
    success: true,
  })
})
// post /app
exports.getApp = catchAsyncErrors(async (req, res, next) => {
  const { App_Acronym } = req.body

  var querystr = `SELECT * FROM application WHERE App_Acronym = ?`
  const values = [App_Acronym]
  console.log("values: ", values)

  const result = await executeQuery(querystr, values)
  // return result
  res.json({
    appData: result[0],
  })
})

// post /app/getAll
exports.allApps = catchAsyncErrors(async (req, res, next) => {
  // get all app info
  var querystr = "SELECT `App_Acronym`,`App_startDate`,`App_endDate` FROM application ORDER BY `App_endDate` DESC"
  var values = []

  const appsData = await executeQuery(querystr, values)

  // return result
  res.json({
    appsData,
  })
})
