const User = require('../models/user')

module.exports ={
 isBlocked : async (req,res,next) =>{
    if (req.session.user) {
        const userId = req.session.userId; // Assuming req.session.user contains the user's ID
        const user = await User.findById(userId);
  
        if (user.isBlock) {
          // console.log("!user.isActive", user.isActive);
          req.session.user = null;
          req.flash('error',"You have been blocked !!");
          res.redirect("/"); // User is not blocked, proceed to the next,else login page / u can show LOgin instead of LOgout
        }
      }
 } 
} 
