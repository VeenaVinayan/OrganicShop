const multer = require('multer');
const path = require('path');
// Initialize a storage engine for multer
const storage = multer.diskStorage({
     destination : (req,file,callBack) =>{
     callBack(null,path.join(__dirname,'../public/images/productImages'));
    },
    filename :(req,file,callBack) => {
        const uniqueName = Date.now()+ ' '+file.originalname;
        callBack(null,uniqueName);
    }
});

module.exports = multer({storage :storage });