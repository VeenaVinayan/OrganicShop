const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async (email,title,body) =>{
    try{
        let transporter = nodemailer.createTransport({ 
        service: `gmail`,
        auth: {
             user : process.env.MAIL_USER,
             pass : process.env.MAIL_PASS,
        },
    });
// Send emial to users

let info = await transporter.sendMail({
    to : email,
    from : process.env.MAIL_USER,
    subject : title,
    html:body,
});
  return info;
}catch(error){
    console.log("Error occured in SEND MAIL ::"+error.message);
}
};

module.exports = mailSender;