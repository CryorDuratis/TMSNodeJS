exports.home = async (req, res, next) => {
  if (req.session.isLoggedIn === true) {
    // proceed
    return res.status(200).json({
      success: true,
      message: "home works"
    })
  }
  // redirect to login page
  res.redirect("/login")
}

exports.admin = async (req, res, next) => {
  if (req.session.isLoggedIn === true) {
    // proceed
    return res.status(200).json({
      success: true,
      message: "admin works"
    })
  }
  // redirect to login page
  res.redirect("/login?redirect_url=/admin")
}
