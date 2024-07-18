const createOtp = require('otp-generator');
const sendMail = require('../utils/mailSender');

module.exports = { 
         sendOtp(email) { 
        const  otp = createOtp.generate(6, {
                        upperCaseAlphabets:false,
                        lowerCaseAlphabets:false,
                        specialChars:false,
                    });
                    console.log(`Otp is ${otp}`);    
                    console.log(`email : ${email}`);       
        try {
         sendMail(email,
                     "OTP Verification",
                    `<h3>Please conform your OTP !</h3>
                     <bold> This your otp : ${otp}</bold>`);
           return otp;
        } catch(err){
             console.log(err);
        }
    },
    // OTP  for forgot password!
    sendResetPassword(email,userID){
        try{
            const otp = createOtp.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            sendMail(email,
                 "Password Rest OTP",
                 ` <h3> Reset Password with OTP Timer !! </h3>
                   <p> Your otp ::  ${otp}</p>`);
            return otp;       
        }catch(err){
             console.log("Error occured :"+err);
        }
    }
}