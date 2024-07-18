const Joi = require('joi');

module.exports = {
     loginValidate : (schema) =>{
        return(req,res,next) =>{
            const {error} = schema.validate(req.body);
            const valid = error == null;
            if(valid){
                next();
            }else{
                  console.log("Error occured :: "+error);
                  req.flash('error',{error});
                  res.redirect('/login');
            }
        }
     },
     resetPasswordValidate : (schema) =>{
         return (req,res,next) =>{
            const {error} = schema.validate(req.body);
            const valid = error == null;
            if(valid){
                next();
            }else{
                console.log("Error occured :: "+error);
                req.flash('error',{error});
                res.redirect('/login');
            }
         }
     },
     newProductValidate : (schema) =>{
        return (req,res,next) =>{
            console.log(req.body.description);
            const {error} = schema.validate(req.body);
            const valid = error == null;
            if(valid){
                next();
            }else{
                console.log("Error occured  in Server side Validation ! "+error);
                req.flash('error',error);
                res.redirect('/product');
            }
         }
     }
}