module.exports = func => (req, res, next) => Promise.resolve(func(req, res, next)).catch(next)

res.json({
  success: false,
  message: "login"
})
