// require app modules
const { executeQuery } = require("../config/db")
const { checkGroup } = require("../util/checkGroup")

// URL received is /
exports.home = async (req, res, next) => {
  const role = await checkGroup(req.user, 'admin')
  res.status(200).json({
    success: true,
    message: `home works, user is ${role ? 'admin' : 'not admin'}`
  })
}
