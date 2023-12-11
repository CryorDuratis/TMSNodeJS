// require app modules
const { executeQuery } = require("../config/db")
const catchAsyncErrors = require("../errorhandling/catchAsyncErrors")

// post /task/create

// post /task/view
function stateConvert(number) {
  let stateString
  switch (number) {
    case 1:
      stateString = "To do list"
      return
    case 2:
      stateString = "Doing"
      return
    case 3:
      stateString = "Done"
      return
    case 4:
      stateString = "Closed"
      return
    default:
      stateString = "Open"
  }
  return stateString
}

// post /task/changestate
exports.changestate = catchAsyncErrors(async (req, res, next) => {
  var { current, promote } = req.body

  // promote ? currentstate++ : currentstate--

  // values = [currentstate, taskid]
  // querystr = "update state set task state = ? where taskid = ?"

  // return res.json({ state: stateConvert(newstate)})
})

// post /task/edit
