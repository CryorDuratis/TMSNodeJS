// require node modules
const bcrypt = require("bcryptjs")

exports.hashPass = async (password)=> {
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedpassword = await bcrypt.hash(password, salt) 
        return hashedpassword
    } catch (error) {
        console.error('Error hashing password:', error.message);
        throw error; // You might want to handle the error or propagate it further
    }
}