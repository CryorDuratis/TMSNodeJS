// require app modules
const { executeQuery } = require("../config/db")
const catchAsyncErrors = require("../errorhandling/catchAsyncErrors")
const { Checkgroup } = require("./checkGroup")

// post /task/create
exports.createTask = catchAsyncErrors(async (req, res, next) => {
  const { Task_name, Task_description = null, Task_id, Task_app_Acronym } = req.body.formData

  // get app permit
  var querystr = `SELECT App_permit_Create FROM application WHERE App_Acronym = ?`
  var values = [Task_app_Acronym]
  var result = await executeQuery(querystr, values)

  // check if user role matches app permits
  if (!Checkgroup(req.user, result[0])) {
    return res.json({
      unauth: "role",
    })
  }

  // check that task name is not null
  if (!Task_name) {
    return res.json({
      success: false,
      message: "required",
    })
  }

  // check if task name is duplicate
  querystr = `SELECT * FROM task WHERE Task_name = ? AND Task_app_Acronym = ?`
  values = [Task_name, Task_app_Acronym]

  result = await executeQuery(querystr, values)
  // return result
  if (result.length > 0)
    return res.json({
      success: false,
      message: "conflict",
    })

  // insert
  querystr = "INSERT INTO task (`Task_name`,`Task_description`,`Task_id`,`Task_app_Acronym`,`Task_creator`,`Task_owner`,`Task_state`,`Task_createDate`) VALUES (?,?,?,?,?,?,'Open',CURDATE())"
  values = [Task_name, Task_description, Task_id, Task_app_Acronym, req.user, req.user]
  result = await executeQuery(querystr, values)

  // increment app rnumber
  querystr = "UPDATE application SET App_Rnumber = App_Rnumber + 1 WHERE App_Acronym = ?"
  values = [Task_app_Acronym]
  result = await executeQuery(querystr, values)

  // return result
  return res.json({
    success: true,
  })
})
// post /task
exports.getTask = catchAsyncErrors(async (req, res, next) => {
  // get all task info
  var querystr = "SELECT * FROM task WHERE `Task_id` = ?"
  var values = [req.body.Task_id]

  const result = await executeQuery(querystr, values)
  // return result
  res.json({
    taskData: result[0],
  })
})
// post /task/getall
exports.allTasks = catchAsyncErrors(async (req, res, next) => {
  // get all task info
  var querystr = "SELECT * FROM task WHERE `Task_app_Acronym` = ? ORDER BY `Task_plan` DESC"
  var values = [req.body.appid]

  const tasksData = await executeQuery(querystr, values)

  // return result
  res.json({
    tasksData,
  })
})

// post /task/note
// exports.noteTask = catchAsyncErrors(async (req, res, next) => {
//   // only a custom note msg will be logged
//   const { Task_note, Task_id, Task_state, Task_app_Acronym } = req.body

//   // permission switch case
//   let appPermit
//   switch(Task_state) {
//     case "Open": appPermit = "App_permit_Open"
//     break
//     case "Todolist": appPermit = "App_permit_toDoList"
//     break
//     case "Doing": appPermit = "App_permit_Doing"
//     break
//     case "Done": appPermit = "App_permit_Done"
//     break
//     case "Closed": return res.json({
//       unauth: "role"
//     })
//     default: return res.json({
//       error: "Internal Server Error"
//     })
//   }

//   // get app permit
//   var querystr = `SELECT ${appPermit} FROM application WHERE App_Acronym = ?`
//   var values = [Task_app_Acronym]
//   var result = await executeQuery(querystr,values)

//   // check if user role matches app permits
//   if (!Checkgroup(req.user, result[0])) {
//     return res.json({
//       unauth: "role"
//     })
//   }

//   // get current timestamp
//   const timestamp = new Date().toISOString();
//   const date = timestamp.split("T")[0]
//   const year = date.split("-")[0]
//   const month = date.split("-")[1]
//   const day = date.split("-")[2]
//   const time = timestamp.split("T")[1]
//   const noteTimestamp = `${day}/${month}/${year} ${time}`

//   const stamp = `[${noteTimestamp}] ${req.user} (${Task_state}): `
//   const newMsg = `${Task_note}\n`

//   // get old note
//   var querystr = "SELECT Task_note FROM task WHERE Task_id = ?"
//   var values = [req.body.Task_id]
//   const oldNote = await executeQuery(querystr, values)

//   // concat
//   const newNote = stamp + newMsg + oldNote

//   // update database
//   querystr = "UPDATE task SET Task_note = ? WHERE Task_id = ?"
//   values = [newNote, Task_id]

//   const result = await executeQuery(querystr, values)
//   // return result
//   return res.json({
//     success: true,
//     tasknote: newNote
//   })
// })
// post /task/promote
exports.promoteTask = catchAsyncErrors(async (req, res, next) => {
  // promotes, adds promote note, add custom note if any
  const { Task_note = "", Task_id, Task_state, Task_app_Acronym } = req.body

  // permission switch case
  let newState
  let appPermit
  switch (Task_state) {
    case "Open":
      newState = "Todolist"
      appPermit = "App_permit_Open"
      break
    case "Todolist":
      newState = "Doing"
      appPermit = "App_permit_toDoList"
      break
    case "Doing":
      newState = "Done"
      appPermit = "App_permit_Doing"
      break
    case "Done":
      newState = "Closed"
      appPermit = "App_permit_Done"
      break
    case "Closed":
      return res.json({
        unauth: "role",
      })
    default:
      return res.json({
        error: "Internal Server Error",
      })
  }

  // get app permit
  var querystr = `SELECT ${appPermit} FROM application WHERE App_Acronym = ?`
  var values = [Task_app_Acronym]
  var result = await executeQuery(querystr, values)

  // check if user role matches app permits
  if (!Checkgroup(req.user, result[0])) {
    return res.json({
      unauth: "role",
    })
  }

  // get current timestamp
  const timestamp = new Date().toISOString()
  const date = timestamp.split("T")[0]
  const year = date.split("-")[0]
  const month = date.split("-")[1]
  const day = date.split("-")[2]
  const time = timestamp.split("T")[1]
  const noteTimestamp = `${day}/${month}/${year} ${time}`

  const stamp = `[${noteTimestamp}] ${req.user} (${Task_state}): `
  const newMsg = `${Task_note}\n`

  // get old task info, maybe dunnid query
  querystr = "SELECT * FROM task WHERE Task_id = ?"
  values = [req.body.Task_id]
  result = await executeQuery(querystr, values)
  const oldNote = result[0].Task_note
  const oldPlan = result[0].Task_plan

  // promote msg
  const promotemsg = `Task promoted from "${Task_state}" to "${newState}". `

  // optional plan change
  var planNote = ""
  if (req.body.Task_plan) {
    // plan note
    planNote = oldPlan ? `Task plan changed from ${oldPlan} to ${req.body.Task_plan}. ` : `Added new Task plan: ${req.body.Task_plan}. `
    values = [req.body.Task_plan]
  } else {
    values = []
  }

  // concat
  const newNote = stamp + planNote + promotemsg + newMsg + oldNote

  // update database
  querystr = `UPDATE task SET ${req.body.Task_plan && "Task_plan = ?,"} Task_note = ?,Task_state = ? WHERE Task_id = ?`
  values.push(newNote, newState, Task_id)

  result = await executeQuery(querystr, values)
  // return result
  return res.json({
    success: true,
    tasknote: newNote,
  })
})
// post /task/demote
exports.demoteTask = catchAsyncErrors(async (req, res, next) => {
  // promotes, adds promote note, add custom note if any
  const { Task_note = "", Task_id, Task_state, Task_app_Acronym } = req.body

  // permission switch case
  let newState
  let appPermit
  switch (Task_state) {
    case "Open":
      return res.json({
        unauth: "role",
      })
    case "Todolist":
      return res.json({
        unauth: "role",
      })
    case "Doing":
      newState = "Todolist"
      appPermit = "App_permit_Doing"
      break
    case "Done":
      newState = "Doing"
      appPermit = "App_permit_Done"
      break
    case "Closed":
      return res.json({
        unauth: "role",
      })
    default:
      return res.json({
        error: "Internal Server Error",
      })
  }

  // get app permit
  var querystr = `SELECT ${appPermit} FROM application WHERE App_Acronym = ?`
  var values = [Task_app_Acronym]
  var result = await executeQuery(querystr, values)

  // check if user role matches app permits
  if (!Checkgroup(req.user, result[0])) {
    return res.json({
      unauth: "role",
    })
  }

  // get current timestamp
  const timestamp = new Date().toISOString()
  const date = timestamp.split("T")[0]
  const year = date.split("-")[0]
  const month = date.split("-")[1]
  const day = date.split("-")[2]
  const time = timestamp.split("T")[1]
  const noteTimestamp = `${day}/${month}/${year} ${time}`

  const stamp = `[${noteTimestamp}] ${req.user} (${Task_state}): `
  const newMsg = `${Task_note}\n`

  // get old task info
  querystr = "SELECT * FROM task WHERE Task_id = ?"
  values = [req.body.Task_id]
  result = await executeQuery(querystr, values)
  const oldNote = result[0].Task_note
  const oldPlan = result[0].Task_plan

  // promote msg
  const demotemsg = `Task demoted from "${Task_state}" to "${newState}". `

  // optional plan change
  var planNote = ""
  if (req.body.Task_plan) {
    // plan note
    planNote = oldPlan ? `Task plan changed from ${oldPlan} to ${req.body.Task_plan}. ` : `Added new Task plan: ${req.body.Task_plan}. `
    values = [req.body.Task_plan]
  } else {
    values = []
  }

  // concat
  const newNote = stamp + planNote + demotemsg + newMsg + oldNote

  // update database
  querystr = `UPDATE task SET ${req.body.Task_plan && "Task_plan = ?,"} Task_note = ?,Task_state = ? WHERE Task_id = ?`
  values.push(newNote, newState, Task_id)

  result = await executeQuery(querystr, values)
  // return result
  return res.json({
    success: true,
    tasknote: newNote,
  })
})
// post /task/edit
exports.editTask = catchAsyncErrors(async (req, res, next) => {
  // promotes, adds promote note, add custom note if any
  const { Task_note = "", Task_id, Task_state, Task_app_Acronym } = req.body

  // permission switch case
  let appPermit
  switch (Task_state) {
    case "Open":
      appPermit = "App_permit_Open"
      break
    case "Todolist":
      appPermit = "App_permit_toDoList"
      break
    case "Doing":
      appPermit = "App_permit_Doing"
      break
    case "Done":
      appPermit = "App_permit_Done"
      break
    case "Closed":
      return res.json({
        unauth: "role",
      })
    default:
      return res.json({
        error: "Internal Server Error",
      })
  }

  // get app permit
  var querystr = `SELECT ${appPermit} FROM application WHERE App_Acronym = ?`
  var values = [Task_app_Acronym]
  var result = await executeQuery(querystr, values)

  // check if user role matches app permits
  if (!Checkgroup(req.user, result[0])) {
    return res.json({
      unauth: "role",
    })
  }

  // get current timestamp
  const timestamp = new Date().toISOString()
  const date = timestamp.split("T")[0]
  const year = date.split("-")[0]
  const month = date.split("-")[1]
  const day = date.split("-")[2]
  const time = timestamp.split("T")[1]
  const noteTimestamp = `${day}/${month}/${year} ${time}`

  const stamp = `[${noteTimestamp}] ${req.user} (${Task_state}): `
  const newMsg = `${Task_note}\n`

  // get old task info
  querystr = "SELECT * FROM task WHERE Task_id = ?"
  values = [req.body.Task_id]
  result = await executeQuery(querystr, values)
  const oldNote = result[0].Task_note
  const oldPlan = result[0].Task_plan

  // optional plan change
  var planNote = ""
  if (req.body.Task_plan) {
    if (Task_state !== "Open" && Task_state !== "Done") {
      return res.json({
        unauth: "role",
      })
    }
    // plan note
    planNote = oldPlan ? `Task plan changed from ${oldPlan} to ${req.body.Task_plan}. ` : `Added new Task plan: ${req.body.Task_plan}. `
    values = [req.body.Task_plan]
  } else {
    values = []
  }

  // concat
  const newNote = stamp + planNote + newMsg + oldNote

  // update database
  querystr = `UPDATE task SET ${req.body.Task_plan && "Task_plan = ?,"} Task_note = ? WHERE Task_id = ?`
  values.push(newNote, Task_id)

  result = await executeQuery(querystr, values)
  // return result
  return res.json({
    success: true,
    tasknote: newNote,
  })
})
