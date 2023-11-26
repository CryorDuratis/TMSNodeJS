// require app modules
const { executeQuery } = require("../config/db")

exports.checkGroup = async (username, group) => {
    // select * from users where username = 'username' and groups like 'group'
    // if result.length > 0, return true
    // else return false
     // check user role to determine if admin button appears
     var querystr = `SELECT role FROM users WHERE username = ? AND role LIKE ?`
     const values = [username, group]
   
     try {
       const result = await executeQuery(querystr, values)
         // return result
         console.log("checkgroup returns:",result.length>0)
         return result.length>0
       
     } catch (error) {
       console.error("Error executing query:", error.message)
     }
}