const Joi = require('joi');

module.exports ={

  schemaAddress : 
  Joi.object({
        firstName: Joi.string().required().min(3).max(10),
        lastName : Joi.string().required().min(3).max(15),
        mobile : Joi.string().pattern(new RegExp('^[7-9]\d{9}$')).required(),
        house : Joi.string().required().alphanum(),
        landMark:Joi.string().alphanum(),
        street: Joi.string().max(15),
        place: Joi.string().alphanum().max(15),
        city: Joi.string().required().max(10),
        pincode :Joi.number().min(6).max(6).required(),
        state:Joi.string().min(3).required().max(15),
        country: Joi.string().alphanum().required(),
        type: Joi.string().required(),
        user: Joi.string().alphanum().required(),    
    }),

  loginSchema:    Joi.object({
        email : Joi.string().email().required(),
        password : Joi.string().pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*()_+=-]{5,15}$')).required() 
        .messages({
            'string.pattern.base': 'Password must be 8-30 characters long and include letters, numbers, and special characters.',
        }),
  }),
    //password reset Password schema
  passwordSchema : Joi.object({
       password  : Joi.string().pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*()_+=-]{5,15}$')).required() 
       .messages({
           'string.pattern.base': 'Password must be 8-30 characters long and include letters, numbers, and special characters.',
       }),
       confirmPassword : Joi.string().valid(Joi.ref('password')).required()
       .messages({
               'any.only': 'Confirm password does not match password',
               'any.required': 'Confirm password is a required field'
       })
  }),
  // product Schema
  productSchema : Joi.object({
     productName : Joi.string().min(3).max(20).required(),
     description : Joi.string().min(10).max(50),
     category  :  Joi.string().hex().length(24),
     brand : Joi.string().required(), 
     varient : Joi.array().items(
         Joi.object({
            quantity : Joi.number().required(),
            price : Joi.number().required(),
            size : Joi.string().required(),
            discount: Joi.number(),
         })
     ),
    status:Joi.boolean().required(),
    rating : Joi.number() 
 })  
}
