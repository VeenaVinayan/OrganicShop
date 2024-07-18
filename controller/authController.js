
const bcrypt = require('bcrypt');
const User =require('../models/user');
const {sendOtp,sendResetPassword} = require('../controller/otpController');
const passport = require('passport');
const shortId = require('shortid')
const Wallet = require('../models/wallet');

const salt = 10;

module.exports =  {
    userSignupView : (req,res) => {
        res.render('./auth/register',{title:'SignUp'});
    },
    userSignupSubmit : async (req,res) => {
           console.log("Inside signup submit !!! ")
           const {name,email,phone,code,password } = req.body;
           const isEmailAvilable = await User.findOne({email:email});
           if(isEmailAvilable){
                req.flash('error' , " User Already Exist ! " );
                res.redirect("/signup");
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
              res.redirect('/otpVerification');
            }     
     },
    userOtpSubmit : async (req,res) => {
      try{
        console.log("INside  user otp submit !");
        const currTime = new Date();
        const {val1,val2,val3,val4,val5,val6} = req.query;
        if(!val1 || !val2 || !val3 || !val4 || !val5 || !val6){
           return res.status(400).json({error:"Input data Properly !"});
        }
       const userOtp=val1+val2+val3+val4+val5+val6;
        const otpDB = await User.findOne({email:req.session.email,'token.otp':userOtp});
         if(!otpDB) {
             console.log("Invalid otp");
             return res.status(400).json({error:"Invalid otp !"});
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
                  return res.status(408).json({error:"Time Out !"});
                }
          }  
        }catch(err){
          console.log("error Occured :: "+err);
        }  
   },
  // otp verification page
  userOtpView :   (req,res) =>{
      res.render('./auth/otp',{title:'OTP'});
   },

    //resend otp
   resendOtpView :async (req,res) => {
      try {
          const otp =  sendOtp(req.session.email);
          console.log(`Resend values :: ${otp} UpdateTime :: ${Date.now()}`);
          await User.updateOne({email:req.session.email},
           { $set: {  'token.otp': otp,'token.created' : Date.now()}    });
           res.redirect('/otpVerification');
      }catch(err){
         consoel.log("Error occured ::"+err);
      }
  },

   // Login View 
   loginView : (req,res) => {
          res.render('./auth/loginUser',{title:'Login'});
    },
  // Login submit 
   loginSubmit : async (req,res) =>{
         console.log('Login submit !');
         const{email,password} = req.body;
         const user = await User.findOne({email:email});
         if(!user){
             req.flash('error',"Not a Registered User !")
             res.redirect('/login');
         }else{
            const isPasswordmatch = await bcrypt.compare(password,user.password);
            if(user && user.isAdmin){
               if(isPasswordmatch){
                   req.session.admin = user.email;
                   res.redirect('/adminHome');
               }else{
                   req.flash('error', " Invalid credentials ! ") ;
                   console.log('Invalid! passWord');
                   res.redirect('/login');
                }
             }else if(user && user.isVerified && isPasswordmatch && !user.isBlock ){
                 req.session.user = user.email;
                 req.session.userId = user._id;
                  res.redirect('/');
            }else if(user && !user.isVerified){
               req.flash('error' , "User doesn't Verified ! ");
               req.session.email=email;
               res.redirect('/resendOtp');
            }else if(user && user.isBlock){
                 req.flash('error',"You have been Blocked by Admin !!");
                 res.redirect('/login');
            }else{
              req.flash('error',"Invalid Credentials !")
              res.redirect('/login');
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
           return res.status(400).send('User not found');
        }
       const otp = sendResetPassword(email,user._id);
       await User.updateOne({email:email},
                            {$set: { 'token.otp':otp,
                                    'token.created': Date.now()}});
        req.session.email=email;                            
       res.status(200).send('Password reset email successfully sent');
     },
     //LOADING RESET PAGE-------------------------------------------------------------
     loadResetPage :(req,res)=>{
         const {userID} = req.params;
         res.render("./auth/passwordReset",{userId:userID})
     },
     saveResetPassword: async(req,res) =>{
        const { password,confirmPassword,userID } = req.body;
        const user = await User.findById(userID)
        if (user) {     
              try {
                    if (password !== confirmPassword) {
                         return res.status(400).send('Passwords do not match');
                    }      
                    // Hash the new password
                    const newPassword = await bcrypt.hash(password, 10);
                    await User.findOneAndUpdate(
                                 { _id: userID },
                                 { password: newPassword },
                                 { new: true}
                               );
                    req.flash('success',"Successfully changed Password !!");           
                    res.redirect('/login');
                } catch (err) {
                               console.error(err);
                               res.status(500).send('Failed to update password');
                  }
              }else{
                  res.status(500).send('Failed to find user');
              }
       },
    otpView: async (req,res) =>{
        res.render('./auth/otpForgot');
    },
    validateOtp: async (req,res) =>{
         const { otp } = req.params;
         const isValid = await User.findOne({email:req.session.email,'token.otp':otp});
         if(isValid){
          const currentTime = new Date();
          const timeDifference = (new Date(currentTime) - isValid.token.created)/1000/60 ;
       
            if(timeDifference <= 1){
               return res.status(200).json({success:'SUccessfully Verified OTP !',userID:isValid._id});
            }else{
              console.log("Time out!!");
               return res.status(408).json({error:"Time OUT !!"});
            }
        }else{
          return res.status(400).json({error:"INvalid OTP !"});
        }
    }   
  }   
   

   

  