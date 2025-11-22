
const bcrypt = require('bcrypt');
const User =require('../models/user');
const {sendOtp,sendResetPassword} = require('../controller/otpController');
const passport = require('passport');
const shortId = require('shortid')
const Wallet = require('../models/wallet');
const salt = 10;
const { AUTH, ADMIN } = require('../constants/route');
const { MESSAGES } = require('../constants/messages');
const { STATUS_CODE } = require('../constants/status_code');

 module.exports =  {
    userSignupView : (req,res) => {
        res.render(AUTH.REGISTER,{title:'SignUp'});
    },
    userSignupSubmit : async (req,res) => {
           console.log("Inside signup submit !!! ")
           const {name,email,phone,code,password } = req.body;
           const isEmailAvilable = await User.findOne({email:email});
           if(isEmailAvilable){
                req.flash('error' , " User Already Exist ! " );
                res.redirect(AUTH.SIGNUP);
            } else {
                const codeReferal=shortId.generate();   // create Refferal code for  the user ! 
                const otp = sendOtp(email);
                console.log(`Send otp : ${otp} Time :: ${Date.now()}`);
                const hashPassword = await bcrypt.hash(password,salt);
                const user = new User({
                     name : name,
                     email : email,
                     mobile : phone,
                     password : hashPassword,
                     token : {
                        otp : otp,
                        created : Date.now()
                     },
                     referralCode:codeReferal,
               });
              await user.save();
              req.session.email= req.body.email;
              if(code){
                  const isAvilable = await User.findOne({referralCode:code});
                  if(isAvilable){
                     console.log("Referal code is avilable "+isAvilable.referralCode);
                     req.session.code=code? code:null;
                 }
                  } 
              res.redirect(AUTH.OTP_VERIFICATION);
            }     
     },
    userOtpSubmit : async (req,res) => {
      try{
        console.log("INside  user otp submit !");
        const currTime = new Date();
        const {val1,val2,val3,val4,val5,val6} = req.query;
        if(!val1 || !val2 || !val3 || !val4 || !val5 || !val6){
           return res.status(STATUS_CODE.BAD_REQUEST).json({error:"Input data Properly !"});
        }
       const userOtp=val1+val2+val3+val4+val5+val6;
        const otpDB = await User.findOne({email:req.session.email,'token.otp':userOtp});
         if(!otpDB) {
             console.log("Invalid otp");
             return res.status(STATUS_CODE.BAD_REQUEST).json({error:"Invalid otp !"});
          }
        console.log(otpDB);
        if(otpDB) {
            console.log("DB Time ::: " + otpDB.token.created);
            const timeDifference = (new Date(currTime) - (otpDB.token.created))/1000/60 ;
            if(timeDifference <= 1) {
                await User.updateOne({email:otpDB.email}, {$set:
                  {isVerified: true}
                });
                     // checking if the user have a Referal code      
                if(req.session.code){
                  const wallet = new Wallet({
                        user : otpDB._id,
                        'referalCode.code' : req.session.code,
                        'referalCode.redeemStatus':false,
                    });
                    await wallet.save();
                 }else{
                   const wallet = new Wallet({
                    user :otpDB._id,
                 });
                 await wallet.save();
                 }
                 req.session.email=null;
                 req.session.code = null;
                 return res.status(200).json({success:"Successfully Verified !!"});
                }else {
                  console.log("Time out !"); 
                  return res.status(STATUS_CODE.REQUEST_TIMEOUT).json({error:MESSAGES.TIME_OUT});
                }
          }  
        }catch(err){
          console.log("error Occured :: "+err);
        }  
   },
  // otp verification page
  userOtpView :   (req,res) =>{
      res.render(AUTH.OTP,{title:'OTP'});
   },

    //resend otp
   resendOtpView :async (req,res) => {
      try {
          const otp =  sendOtp(req.session.email);
          console.log(`Resend values :: ${otp} UpdateTime :: ${Date.now()}`);
          await User.updateOne({email:req.session.email},
           { $set: {  'token.otp': otp,'token.created' : Date.now()}    });
           res.redirect(AUTH.OTP_VERIFICATION);
      }catch(err){
         consoel.log("Error occured ::"+err);
      }
  },

   // Login View 
   loginView : (req,res) => {
          res.render(AUTH.LOGIN_USER,{title:'Login'});
    },
  // Login submit 
   loginSubmit : async (req,res) =>{
         console.log('Login submit !');
         const{email,password} = req.body;
         const user = await User.findOne({email:email});
         if(!user){
             req.flash('error',"Not a Registered User !")
             res.redirect(AUTH.LOGIN);
         }else{
            const isPasswordmatch = await bcrypt.compare(password,user.password);
            if(user && user.isAdmin){
               if(isPasswordmatch){
                   req.session.admin = user.email;
                   res.redirect(ADMIN.HOME);
               }else{
                   req.flash('error', " Invalid credentials ! ") ;
                   console.log('Invalid! passWord');
                   res.redirect(AUTH.LOGIN);
                }
             }else if(user && user.isVerified && isPasswordmatch && !user.isBlock ){
                 req.session.user = user.email;
                 req.session.userId = user._id;
                  res.redirect('/');
            }else if(user && !user.isVerified){
               req.flash('error' , "User doesn't Verified ! ");
               req.session.email=email;
               res.redirect(AUTH.RESEND_OTP);
            }else if(user && user.isBlock){
                 req.flash('error',"You have been Blocked by Admin !!");
                 res.redirect(AUTH.LOGIN);
            }else{
              req.flash('error',"Invalid Credentials !")
              res.redirect(AUTH.LOGIN);
          }
       }  
    },
    // Logout
   logout : (req,res) => {
       try{
           req.session.admin = null;
           res.redirect('/admin');
       }catch(err){
           console.log(err);
        }
    },
     forgetPassword: async (req,res)=>{
         res.render('./auth/forgotPassword');
      },
     passwordReset: async(req,res) =>{
        const { email } = req.body;
        const user = await User.findOne({ email:email });
        if (!user) {
           return res.status(STATUS_CODE.BAD_REQUEST).send('User not found');
        }
       const otp = sendResetPassword(email,user._id);
       await User.updateOne({email:email},
                            {$set: { 'token.otp':otp,
                                    'token.created': Date.now()}});
        req.session.email=email;                            
       res.status(STATUS_CODE.OK).send('Password reset email successfully sent');
     },
   
     loadResetPage :(req,res)=>{
         const {userID} = req.params;
         res.render(AUTH.PASSWORD_RESET,{userId:userID})
     },
     saveResetPassword: async(req,res) =>{
        const { password,confirmPassword,userID } = req.body;
        const user = await User.findById(userID)
        if (user) {     
              try {
                    if (password !== confirmPassword) {
                         return res.status(STATUS_CODE.BAD_REQUEST).send('Passwords do not match');
                    }      
                    const newPassword = await bcrypt.hash(password, 10);
                    await User.findOneAndUpdate(
                                 { _id: userID },
                                 { password: newPassword },
                                 { new: true}
                               );
                    req.flash('success',"Successfully changed Password !!");           
                    res.redirect(AUTH.LOGIN);
                } catch (err) {
                               console.error(err);
                               res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).send('Failed to update password');
                  }
              }else{
                  res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).send('Failed to find user');
              }
       },
    otpView: async (req,res) =>{
        res.render(AUTH.OTP_FORGOT);
    },
    validateOtp: async (req,res) =>{
         const { otp } = req.params;
         const isValid = await User.findOne({email:req.session.email,'token.otp':otp});
         if(isValid){
          const currentTime = new Date();
          const timeDifference = (new Date(currentTime) - isValid.token.created)/1000/60 ;
       
            if(timeDifference <= 1){
               return res.status(STATUS_CODE.OK).json({success:MESSAGES.OTP_VERIFIED,userID:isValid._id});
            }else{
               return res.status(STATUS_CODE.REQUEST_TIMEOUT).json({error:MESSAGES.TIME_OUT});
            }
        }else{
          return res.status().json({error:MESSAGES.INVALID_OTP});
        }
    }   
  }   
   

   

  