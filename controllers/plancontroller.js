// require app modules
const { executeQuery } = require("../config/db")
const catchAsyncErrors = require("../errorhandling/catchAsyncErrors")

// post /plan/create
exports.createPlan = catchAsyncErrors(async (req, res, next) => {
  const { Plan_app_Acronym, Plan_MVP_name, Plan_startDate = null, Plan_endDate = null } = req.body

  // required field
  if (!Plan_MVP_name) {
    return res.json({
      success: false,
      message: "required"
    })
  }

  // check if plan name is duplicate
  var querystr = `SELECT * FROM plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym = ?`
  var values = [Plan_MVP_name, Plan_app_Acronym]

  var result = await executeQuery(querystr, values)
  // return result
  if (result.length > 0)
    return res.json({
      success: false,
      message: "conflict"
    })

  // insert
  querystr = `INSERT INTO plan VALUES (?,?,?,?)`
  values = [Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym]
  console.log("values inserted are ", values)
  result = await executeQuery(querystr, values)
  // return result
  return res.json({
    success: true
  })
})
// post /plan/edit
exports.editPlan = catchAsyncErrors(async (req, res, next) => {
  const { groupname, token, Plan_app_Acronym, Plan_MVP_name, ...rest } = req.body

  const fields = Object.keys(rest)
  const values = Object.values(rest)
  var setClause = fields.map(field => `\`${field}\` = ?`).join(", ")

  var querystr = `UPDATE plan SET ${setClause} WHERE Plan_MVP_name = ? AND Plan_app_Acronym = ?`
  console.log("values: ", values)
  // values.push()

  const planData = await executeQuery(querystr, values)
  // return result
  return res.json({
    success: true
  })
})
// post /plan
exports.getPlan = catchAsyncErrors(async (req, res, next) => {
  const { Plan_app_Acronym, Plan_MVP_name } = req.body
  console.log("values: ", Plan_MVP_name, Plan_app_Acronym)

  var querystr = `SELECT * FROM plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym = ?`
  const values = [Plan_MVP_name, Plan_app_Acronym]

  const result = await executeQuery(querystr, values)
  // return result
  res.json({
    planData: result[0]
  })
})
// post /plan/getAll
exports.allPlans = catchAsyncErrors(async (req, res, next) => {
  // get all plan info
  var querystr = "SELECT * FROM plan ORDER BY `plan_endDate` DESC"
  var values = []

  const plansData = await executeQuery(querystr, values)

  // return result
  res.json({
    plansData
  })
})
