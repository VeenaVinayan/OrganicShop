const express= require('express');
const dotenv = require('dotenv').config();
const path = require('path');
const session =require('express-session');
const router = require('./routes/adminRoute');
const authRouter = require('./routes/authRoute');
const shopRoute =require('./routes/shopRoute');
const dbConnect = require('./config/dbConnect');
const isError = require('./middlewares/isError');
const flash =require('connect-flash');
const nocache = require('nocache');
const bodyParser =require('body-parser')
const app=express();

app.use(session({
    secret : 'secret_key',
    resave:false,
    saveUninitialized:true,
}));
app.use(flash());
app.use((req,res,next) =>{
     res.locals.message = req.flash();
     next();
});
app.use(nocache());
//netstat -ano | findstr :7010

app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.use('/shop',express.static(path.join(__dirname,'public','shop')));
app.use(router);
app.use(authRouter);
app.use(shopRoute);

app.set('view engine','ejs');
dbConnect();
//404 error

app.get('*',(req, res)=>{
    res.status(404).render('404.ejs');
  });
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));

