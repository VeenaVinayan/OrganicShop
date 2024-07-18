
module.exports = {
       isAdmin : (req,res,next) => {
           if(!req.session.admin){
                req.session.admin= null;
                console.log('Admin Loggedout!!!')
                return res.redirect('/admin');
           }else {
             next();
           }
       },

       isUser : (req,res,next) => {
        //if(req.session.user=== 'guest')
         if(!req.session.user && !req.session.isBlockUser) {
            console.log("User Logout !!");
            req.session.user= null;
            req.flash('error',"Please SignIn to view Product Details....");
            return res.redirect('/');
         }else{
           next();
         }
       }
}