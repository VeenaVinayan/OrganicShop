const express = require('express');
const auth = require('../controller/authController');
const router= express.Router();
const google = require('../helper/google');
const { loginSchema,passwordSchema } = require('../schemaValidation/schema');
const { loginValidate,resetPasswordValidate } = require('../middlewares/validation');

router.get('/signup',auth.userSignupView);
router.post('/userSignupSubmit',auth.userSignupSubmit);
router.get('/otpVerification',auth.userOtpView)
router.post('/userOtpSubmit',auth.userOtpSubmit);
router.get('/resendOtp',auth.resendOtpView);
router.get('/login',auth.loginView);
router.get('/admin',auth.loginView);
router.post('/loginSubmit',loginValidate(loginSchema), auth.loginSubmit);
router.get('/logout',auth.logout);
//google------------------------------------
router.get('/auth/google',google.googleauth);
router.get('/auth/google/callback',google.goog);
//forget password
router.get('/forgetPassword',auth.forgetPassword);
router.post('/passwordResetRequest',auth.passwordReset);
router.get('/otpVerificationForgotPwd',auth.otpView);
router.post('/validateOtp/:otp',auth.validateOtp);
//reset Password
router.get('/resetPassword/:userID',auth.loadResetPage);
router.post('/saveResetPassword',auth.saveResetPassword);

module.exports = router;