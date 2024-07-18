const User = require('../models/user')

module.exports ={
 isBlocked : (req,res,next) =>{
    const isUnBlock = User.findOne({_id:req.session.userId,isBlock:false});
    if(isUnBlock){
        next();
    }else{
        req.flash("error","You have been Blocked by Admin !!");
        res.redirect('/login');
     }
  }
}