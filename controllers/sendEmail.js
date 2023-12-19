const nodemailer = require('nodemailer')

const sendEmail = async options => {
    const transporter = nodemailer.createTransport({
        host :
        port :
        auth : {
            user :
            pass :
        }
    })
}