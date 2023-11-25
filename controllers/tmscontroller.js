exports.home = async (req, res, next) => {
  
    // proceed
    return res.status(200).json({
      success: true,
      message: "home works"
    })
  
}

exports.admin = async (req, res, next) => {
  
    // proceed
    return res.status(200).json({
      success: true,
      message: "admin works"
    })
  
}
