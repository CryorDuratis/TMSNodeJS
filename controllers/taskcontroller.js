// require app modules
const { executeQuery } = require("../config/db")
const catchAsyncErrors = require("../errorhandling/catchAsyncErrors")
const { Checkgroup } = require("./checkGroup")
const sendEmail = require("./sendEmail")

// post /task/create
exports.createTask = catchAsyncErrors(async (req, res, next) => {
  try {
    const { Task_name, Task_description = null, Task_app_Acronym } = req.body.formData

    // get app permit
    var querystr = `SELECT App_permit_Create FROM application WHERE App_Acronym = ?`
    var values = [Task_app_Acronym]
    var result = await executeQuery(querystr, values)

    // check if user role matches app permits
    const auth = await Checkgroup(req.user, result[0])
    if (!auth) {
      return res.json({
        unauth: "role"
      })
    }

    // check that task name is not null
    if (!Task_name) {
      return res.json({
        success: false,
        message: "required"
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
        message: "conflict"
      })

    // get task id
    querystr = `SELECT App_Rnumber FROM application WHERE App_Acronym = ?`
    values = [Task_app_Acronym]
    result = await executeQuery(querystr, values)
    const Task_id = Task_app_Acronym + "_" + result[0].App_Rnumber

    // get current timestamp
    const timestamp = new Date()

    const stamp = `[${timestamp.toISOString()}] ${req.user} (Open): `
    const createMsg = `Task created.`

    // concat
    const newNote = stamp + createMsg

    // create date
    const currentdate = timestamp.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })

    // insert
    querystr = "INSERT INTO task (`Task_name`,`Task_description`,`Task_id`,`Task_app_Acronym`,`Task_creator`,`Task_owner`,`Task_state`,`Task_createDate`,`Task_notes`) VALUES (?,?,?,?,?,?,'Open',?,?)"
    values = [Task_name, Task_description, Task_id, Task_app_Acronym, req.user, req.user, currentdate, newNote]
    result = await executeQuery(querystr, values)

    // increment app rnumber
    querystr = "UPDATE application SET App_Rnumber = App_Rnumber + 1 WHERE App_Acronym = ?"
    values = [Task_app_Acronym]
    result = await executeQuery(querystr, values)

    // return result
    return res.json({
      success: true,
      taskid: Task_id
    })
  } catch (e) {
    console.log(e)
    return res.json({
      error: "Maximum number of tasks reached for this app."
    })
  }
})
// post /task
exports.getTask = catchAsyncErrors(async (req, res, next) => {
  // get all task info
  var querystr = "SELECT * FROM task WHERE `Task_id` = ?"
  var values = [req.body.Task_id]

  const result = await executeQuery(querystr, values)

  // if no tasks
  if (result.length < 1) {
    return res.json({
      error: true
    })
  }

  // convert notes to local time
  const datetimeRegex = /\[(.*?)\]/g
  // Find all matches in the long text
  const matches = [...result[0].Task_notes.matchAll(datetimeRegex)]
  // Convert each match to local time
  const options = {
    timeZone: "Asia/Singapore",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }
  const convertedMatches = matches.map(match => {
    const utcDatetime = new Date(match[1])
    const localDatetime = utcDatetime.toLocaleString("en-GB", options) // Adjust options as needed
    return localDatetime
  })
  // Replace the original datetime strings with the converted ones
  const taskDatanotes = result[0].Task_notes.replace(datetimeRegex, () => `[${convertedMatches.shift()}]`)

  // return result
  res.json({
    taskData: result[0],
    taskDatanotes
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
    tasksData
  })
})

// post /task/promote
exports.promoteTask = catchAsyncErrors(async (req, res, next) => {
  // promotes, adds promote note, add custom note if any
  const { Task_note = "", Task_id, Task_state, Task_app_Acronym, selectedplan } = req.body
  var Task_plan = selectedplan ? selectedplan : null

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
        unauth: "role"
      })
    default:
      return res.json({
        error: "Internal Server Error"
      })
  }

  // get app permit
  var querystr = `SELECT ${appPermit} FROM application WHERE App_Acronym = ?`
  var values = [Task_app_Acronym]
  var result = await executeQuery(querystr, values)

  // check if user role matches app permits
  const auth = await Checkgroup(req.user, result[0])
  if (!auth) {
    return res.json({
      unauth: "role"
    })
  }

  // get current timestamp
  const timestamp = new Date().toISOString()

  const stamp = `[${timestamp}] ${req.user} (${Task_state}): `
  const newMsg = `${Task_note}\n\n`

  // get old task info, maybe dunnid query
  querystr = "SELECT * FROM task WHERE Task_id = ?"
  values = [req.body.Task_id]
  result = await executeQuery(querystr, values)
  const oldNote = result[0].Task_notes
  const oldPlan = result[0].Task_plan

  // promote msg
  const promotemsg = `Task promoted from "${Task_state}" to "${newState}". `

  // optional plan change
  var planNote = ""
  if (oldPlan !== Task_plan) {
    console.log("plan changed")
    if (Task_state !== "Open" && Task_state !== "Done") {
      return res.json({
        unauth: "role"
      })
    }

    // plan note
    planNote = oldPlan ? (Task_plan ? `Task plan changed from ${oldPlan} to ${Task_plan}. ` : `Task plan removed. `) : `Added new Task plan: ${Task_plan}. `
  }

  // concat
  const newNote = stamp + planNote + promotemsg + newMsg + oldNote

  // update database
  querystr = `UPDATE task SET Task_plan = ?, Task_notes = ?, Task_state =?, Task_owner = ? WHERE Task_id = ?`
  values = [Task_plan, newNote, newState, req.user, Task_id]

  // send email
  if (newState === "Done") {
    const applink = `http://localhost:3000/apps/${Task_app_Acronym}`

    const text = `Dear User,\n\n

    The task ${result[0].Task_name} has been promoted to the "Done" state.\n\n
    
    Task Details:\n
    Task Name: ${result[0].Task_name}\n
    Assigned To: ${result[0].Task_owner}\n\n

    Please view the task at ${applink}\n
    Thank you for your attention.\n\n
    
    Best Regards,\n
    Your TMS Team `

    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Task Promotion Notification</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          background-color: #f4f4f4;
          padding: 20px;
        }
    
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
    
        h2 {
          color: #333333;
        }
    
        p {
          color: #666666;
        }
    
        .task-details {
          margin-top: 20px;
        }
    
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #3498db;
          color: #ffffff;
          text-decoration: none;
          border-radius: 3px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Task Promotion Notification</h2>
        <p>Dear User,</p>
        <p>The task "<strong>${result[0].Task_name}</strong>" has been promoted to the "Done" state.</p>
    
        <div class="task-details">
          <strong>Task Details:</strong>
          <ul>
            <li><strong>Task Name:</strong> ${result[0].Task_name}</li>
            <li><strong>Assigned To:</strong> ${result[0].Task_owner}</li>
          </ul>
        </div>
    
        <p>Thank you for your attention.</p>
        <p>Best Regards,<br>Your TMS Team</p>
    
        <div class="button-container">
          <a href="${applink}" class="button">View Task</a>
        </div>
      </div>
    </body>
    </html>`

    console.log("Send an email")
    if (true) {
      sendEmail({
        to: "user@tms.com",
        subject: "A task is done and needs your attention!",
        text,
        html
      })
        .then(() => {
          console.log("Send email completed")
        })
        .catch(error => {
          console.log("error: ", error)
        })
    }
  }

  result = await executeQuery(querystr, values)
  // return result
  return res.json({
    success: true
  })
})
// post /task/demote
exports.demoteTask = catchAsyncErrors(async (req, res, next) => {
  // promotes, adds promote note, add custom note if any
  const { Task_note = "", Task_id, Task_state, Task_app_Acronym, selectedplan } = req.body
  var Task_plan = selectedplan ? selectedplan : null

  // permission switch case
  let newState
  let appPermit
  switch (Task_state) {
    case "Open":
      return res.json({
        unauth: "role"
      })
    case "Todolist":
      return res.json({
        unauth: "role"
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
        unauth: "role"
      })
    default:
      return res.json({
        error: "Internal Server Error"
      })
  }

  // get app permit
  var querystr = `SELECT ${appPermit} FROM application WHERE App_Acronym = ?`
  var values = [Task_app_Acronym]
  var result = await executeQuery(querystr, values)

  // check if user role matches app permits
  const auth = await Checkgroup(req.user, result[0])
  if (!auth) {
    return res.json({
      unauth: "role"
    })
  }

  // get current timestamp
  const timestamp = new Date().toISOString()

  const stamp = `[${timestamp}] ${req.user} (${Task_state}): `
  const newMsg = `${Task_note}\n\n`

  // get old task info, maybe dunnid query
  querystr = "SELECT * FROM task WHERE Task_id = ?"
  values = [req.body.Task_id]
  result = await executeQuery(querystr, values)
  const oldNote = result[0].Task_notes
  const oldPlan = result[0].Task_plan

  // demote msg
  const demotemsg = `Task demoted from "${Task_state}" to "${newState}". `

  // optional plan change
  var planNote = ""
  if (oldPlan !== Task_plan) {
    console.log("plan changed")
    if (Task_state !== "Done") {
      return res.json({
        unauth: "role"
      })
    }

    // plan note
    planNote = oldPlan ? (Task_plan ? `Task plan changed from ${oldPlan} to ${Task_plan}. ` : `Task plan removed. `) : `Added new Task plan: ${Task_plan}. `
  }

  // concat
  const newNote = stamp + planNote + demotemsg + newMsg + oldNote

  // update database
  querystr = `UPDATE task SET Task_plan = ?, Task_notes = ?, Task_state =?, Task_owner = ? WHERE Task_id = ?`
  values = [Task_plan, newNote, newState, req.user, Task_id]

  result = await executeQuery(querystr, values)
  // return result
  return res.json({
    success: true
  })
})
// post /task/edit
exports.editTask = catchAsyncErrors(async (req, res, next) => {
  // promotes, adds promote note, add custom note if any
  const { Task_note = "", Task_id, Task_state, Task_app_Acronym, selectedplan } = req.body
  var Task_plan = selectedplan ? selectedplan : null

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
        unauth: "role"
      })
    default:
      return res.json({
        error: "Internal Server Error"
      })
  }

  // get app permit
  var querystr = `SELECT ${appPermit} FROM application WHERE App_Acronym = ?`
  var values = [Task_app_Acronym]
  var result = await executeQuery(querystr, values)

  // check if user role matches app permits
  const auth = await Checkgroup(req.user, result[0])
  if (!auth) {
    return res.json({
      unauth: "role"
    })
  }

  // get current timestamp
  const timestamp = new Date().toISOString()

  const stamp = `[${timestamp}] ${req.user} (${Task_state}): `
  const newMsg = `${Task_note} \n\n`

  // get old task info
  querystr = "SELECT * FROM task WHERE Task_id = ?"
  values = [req.body.Task_id]
  result = await executeQuery(querystr, values)
  const oldNote = result[0].Task_notes
  const oldPlan = result[0].Task_plan

  // if no change detected
  if (Task_note === "" && oldPlan === Task_plan) {
    console.log("no note or plan change detected")
    return res.json({
      success: false
    })
  }

  // optional plan change
  var planNote = ""
  if (oldPlan !== Task_plan) {
    console.log("plan changed")
    if (Task_state !== "Open" && Task_state !== "Done") {
      return res.json({
        unauth: "role"
      })
    }

    // plan note
    planNote = oldPlan ? (Task_plan ? `Task plan changed from ${oldPlan} to ${Task_plan}. ` : `Task plan removed. `) : `Added new Task plan: ${Task_plan}. `
  }

  console.log("note change detected")
  // concat
  const newNote = stamp + planNote + newMsg + oldNote

  // update database
  querystr = `UPDATE task SET Task_plan = ?, Task_notes = ?, Task_owner = ? WHERE Task_id = ?`
  values = [Task_plan, newNote, req.user, Task_id]
  console.log("query is ", querystr)

  result = await executeQuery(querystr, values)
  // return result
  return res.json({
    success: true
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
//   const timestamp = new Date().toISOString()

//   const stamp = `[${timestamp}] ${req.user} (${Task_state}): `
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
