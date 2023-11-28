// require app modules
const { executeQuery } = require("./db")

const Checkgroup = Promise.resolve(async (userid, groupname) => {
  var querystr = `SELECT role FROM users WHERE username = ? AND role LIKE ?`
  const values = [userid, `%${groupname}%`]

  const result = await executeQuery(querystr, values)
  // return result
  console.log("checkgroup returns:", result.length > 0)
  return result.length > 0
}).catch((error) => {
  console.log(error)
  throw error
})

module.exports = Checkgroup
