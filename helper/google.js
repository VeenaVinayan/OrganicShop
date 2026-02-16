const passport=require('passport')
const User = require('../models/user');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const shortid = require('shortid')
const Wallet = require('../models/wallet');


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
  passReqToCallback: true
},

async function(request, accessToken, refreshToken, profile, done) {
  try {
    let user = await User.findOne({ email: profile.email });
    if (!user) {
       const referralCode = shortid.generate();
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.email,
        password: 'your_password_here',
        mobile: profile.mobile,
        isVerified: true, 
        referralCode: referralCode, 
      });
      await user.save();   
      const wallet = new Wallet({
        user :user._id,
      });
      wallet.save(); 
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));


passport.serializeUser(function(user,done){
  done(null,user);
})

passport.deserializeUser(function(user,done){
  done(null,user);
})


const googleauth = passport.authenticate('google', { scope: ["email", "profile"] });


const goog = (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
         req.session.user = user.email; 
        req.session.userId =user._id;
        return res.redirect('/');
      });
  })(req, res, next);
};

module.exports={
  googleauth,
  goog
}