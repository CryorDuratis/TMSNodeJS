// URL received is /login
exports.loginDisplay = async (req, res, next) => {
  if (req.session.isLoggedIn === true) {
    // redirects to home page
    return res.redirect("/")
  }
  // continues to login page
  res.status(200).json({
    success: true,
    message: "login works"
  })
}

// login form submitted
exports.loginForm = async (req, res, next) => {
  const { username, password } = req.body

  // sql query if username and password correct

  if (username === "bob" && password === "1234") {
    req.session.isLoggedIn = true
    res.redirect(req.query.redirect_url ? req.query.redirect_url : "/")
  } else {
    // if wrong, stay on same page and display error
    res.status(401).json({
      success: false,
      message: "invalid login info"
    })
  }
}

// URL received is /logout
exports.logout = async (req, res, next) => {
  req.session.isLoggedIn = false
  // redirect to home page
  res.redirect("/")
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
