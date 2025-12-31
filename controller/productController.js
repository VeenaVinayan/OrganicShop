const { json } = require('body-parser');
const Category = require('../models/category');
const Product = require('../models/product');
const Varient = require('../models/varient');
const sharp = require('sharp');
const fs =require('fs');
const path = require('path');
const { STATUS_CODE } = require('../constants/status_code');
const PRODUCT_PER_PAGE = 8;

module.exports = {
        adminProductView : async (req,res) => {
            try {
                const { search } = req.query
                let page = Number(req.query.page);
                if (isNaN(page) || page < 1) {
                    page = 1;
                }
                const [ productsCount ,products] = await  Promise.all ([
                          Product.countDocuments(),
                          Product.find().populate('category' )
                          .skip(( page - 1 ) * PRODUCT_PER_PAGE ).limit(PRODUCT_PER_PAGE )
                ]);
               
                 res.render('./admin/product',{
                    title:'Product View',
                    admin : req.session.admin,
                    products : products,
                    currentPage : page,
                    index: (page-1)*PRODUCT_PER_PAGE ,
                    hasNextPage : page * PRODUCT_PER_PAGE < productsCount,
                    hasPrevPage : page > 1,
                    nextPage : page + 1,
                    prevPage : page -1,
                    lastPage : Math.ceil( productsCount / PRODUCT_PER_PAGE ),
               })
      } catch ( error ) { 
            console.log(error);
       }
   },
    addProductView : async (req,res) => {
           const categories = await Category.find({catStatus:true});
           res.render('./admin/addProduct',{title:'Add Products',values:categories});
    },
    addProduct : async (req,res) => {
         try {
              console.log("Product Add !!");
              const {productName,description,categoryId,brand,variantArray,rating} =req.body;
              const {cropImage0,cropImage1,cropImage2} = req.body;
              if(productName ==='' || description ==="" || categoryId === "" || brand ===""|| variantArray ==="" ||rating ===""){
                  req.flash('error','Validation Error !');
                  return res.redirect('/addProducts');
              }
              for(let file of req.files){
                 if(file.mimetype !== 'image/jpg' &&
                   file.mimetype !== 'image/jpeg' &&
                   file.mimetype !== 'image/png' &&
                   file.mimetype !== 'image/gif'){
                   req.flash('error','Check Image Format ');
                   return res.redirect('/addProducts');
                }
            }
            const img=[];
            for(let file of req.files){
                  img.push(file.filename)
            }
           
            const varientValues = JSON.parse(variantArray);
            varientValues.forEach( value => {
                 console.log(`Price :: ${value.price} Quantity:: ${value.quantity} Size :: ${value.size} Discount :: ${value.discount}`);
            });
            let images;
            images=img;
            if(cropImage0){
                images = await cropImageDataExtract(cropImage0,img);
            } 
            if(cropImage1){
                images= await cropImageDataExtract(cropImage1,img);
            } 
            if(cropImage2){
                images= await cropImageDataExtract(cropImage2,img);
            } 
                
            const product = new Product({
                  productName : productName,
                  description : description,
                  category : categoryId,
                  brand : brand,
                  varient : varientValues,
                  image : images,
                  rating : rating
            });
            await product.save();
            res.redirect('/product');
      }catch(err){
            console.log( "Error ::",err);
      }
  },
  listProduct : async(req,res) =>{
      try {
        const {id} = req.query;
        console.log("Product inside change status false !");
       // await Product.findByIdAndUpdate(id,{status : false});
       const product = await Product.findById(id);
       product.status = !product.status;
       console.log("Product unlist ::"+product.status)
       await product.save();
      }catch(err){
          console.log(err);
      }  
   },
  unlistProduct : async(req,res) => {
       try{
            const {id}=req.query;
            console.log("Product inside change status true !");
            await Product.findByIdAndUpdate(id,{status:false});
       }catch(err){
            console.log(err);
       }
   },
   editProductView : async (req,res) =>{
      try{
          const {id }= req.params;
          const [product,category ]= await Promise.all([
                Product.findOne({_id:id}),
                Category.find({catStatus:true})
          ]);
        res.render('./admin/newEditProduct',{
            title:'Edit Product',
            product:product,
            category:category
        });
       }catch(err){
         console.log(err);
       }
},
// editProduct: async (req,res) => {
// try{  
//     const {productName,productId,description,categoryId,brand,variantArray,rating} = req.body;
//     const {price,size,quantity,discount } = req.body ;
//     if(productName ==='' || description ==="" || categoryId === "" || brand ===""|| variantArray ==="" ||rating ===""){
//       req.flash('error','Validation Error !');
//       return res.redirect('/addProducts');
//     }
//     const varient = price.map((_,index) =>({
//           quantity:quantity[index],
//           price:price[index],
//           size:size[index] ,
//           discount:discount[index]
//        })
//      );
//     const {cropImage1,cropImage0} = req.body;
//     let variant = JSON.parse(variantArray);
//     const existingProduct = await Product.findById(productId);
//     let  imagesSaved =existingProduct.image;
//     let images=[];
//      let img =[];
//     console.log("Images :: "+imagesSaved);
//     if(req.files){
//             for(let file of req.files){
//                 if(
//                     file.mimetype !== 'image/jpg' &&
//                     file.mimetype !== 'image/jpeg' &&
//                     file.mimetype !=='image/png'&&
//                     file.mimetype !=='image/gif') {
//                         req.flash('error','Check the format of Image')
//                         return res.redirect(`/editProduct/${existingProduct._id}`)
//                 }
//                  img.push(file.filename);
//                  console.log('Ok fine');
//             }
//   console.log('Images ::',img); 
//       if(img.length >0){
//          imagesSaved.push(...img);
//       } 
//  if (!variant || !Array.isArray(variant)) {
//      return res.status(400).json({ message: 'Invalid product variants' });
//   }
//   if(cropImage0){
//       images = await cropImageDataExtract(cropImage0,img);
//       console.log("Inside Crop Image 0 !"+images);
//   } 
//   if(cropImage1){
//       images= await cropImageDataExtract(cropImage1,img);
//       console.log("Inside Crop Image 1 !"+images);
//   }
//      imagesSaved.push(...images);
//     }
//         const result = await Product.updateOne({'_id':productId},{
//             $set:{
//                 productName:productName,
//                 description:description,
//                 category:categoryId,
//                 brand:brand,
//                 varient:varient,
//                 rating:rating,
//                 image:  imagesSaved,
//             }
//         });
//         res.redirect('/product');
//     }catch(error){
//         console.log("Error occured ::"+error);
//    }
// },
editProduct: async (req, res) => {
  try {
    const {
      productName,
      productId,
      description,
      categoryId,
      brand,
      variantArray,
      rating,
      cropImage0,
      cropImage1
    } = req.body;

    const { price, size, quantity, discount } = req.body;

    // Validation
    if (!productName || !description || !categoryId || !brand || !variantArray || !rating) {
      req.flash('error', 'Validation Error!');
      return res.redirect('/addProducts');
    }

    // Build variant objects
    const varient = price.map((_, index) => ({
      quantity: quantity[index],
      price: price[index],
      size: size[index],
      discount: discount[index]
    }));

    // Parse variantArray safely
    let variant = [];
    try {
      variant = JSON.parse(variantArray);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid product variants' });
    }

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      req.flash('error', 'Product not found!');
      return res.redirect('/product');
    }

    let imagesSaved = existingProduct.image || [];
    let uploadedImages = [];

    // Process uploaded files
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        if (!['image/jpg', 'image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
          req.flash('error', 'Invalid image format!');
          return res.redirect(`/editProduct/${productId}`);
        }
        uploadedImages.push(file.filename);
      }
    }

    // Process crop images
    let croppedImages = [];
    if (cropImage0) {
      croppedImages = await cropImageDataExtract(cropImage0, uploadedImages);
    }
    if (cropImage1) {
      // If both cropImage0 and cropImage1 exist, use cropImage1 (overwrite previous)
      croppedImages = await cropImageDataExtract(cropImage1, uploadedImages);
    }

    // Update imagesSaved
    if (croppedImages.length > 0) {
      // Replace original images with cropped images
      imagesSaved = croppedImages;
    } else if (uploadedImages.length > 0) {
      // If no crop but new images uploaded, append them
      imagesSaved.push(...uploadedImages);
    }
    // Otherwise keep existing images untouched

    // Update product
    await Product.updateOne(
      { _id: productId },
      {
        $set: {
          productName,
          description,
          category: categoryId,
          brand,
          varient,
          rating,
          image: imagesSaved
        }
      }
    );

    res.redirect('/product');
  } catch (error) {
    console.error('Error occurred ::', error);
    req.flash('error', 'Something went wrong!');
    res.redirect('/product');
  }
},

deleteProduct : async(req,res) =>{
    try{
        const {id} = req.query;
        await Product.updateOne({_id:id},{
            $set:{ status:false  }
        });
        res.status(STATUS_CODE.OK).json({success:true,message:"Successfully "})
    }catch(error){
        console.log(error);
    }
 },
  deleteImage: async (req, res) => {
  try {
    const { productId, image } = req.query;
    console.log('Image :',image);
    if (!productId || !image) {
      return res.status(400).json({ success: false, message: "Missing productId or image" });
    }
     const sanitizeImage = image.trim();
    const filePath = path.join(__dirname, "../public/images/productImages", image);
    console.log(filePath);
    fs.unlink(filePath, async (err) => {
      if(err) {
        console.log("File not found or error deleting:", err.message);
       }
      const deleteUpdates = await Product.updateOne(
        { _id: productId },
        { $pull: { image : sanitizeImage  } }
      );
     console.log("Delete Updates :",deleteUpdates);
      if (deleteUpdates.modifiedCount === 0) {
        console.log('Image not delete from the Array ');
        return res.status(400).json({
          success: false,
          message: "Image not found in product record",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Image deleted successfully",
      });
    });

  } catch (err) {
    console.log("Error in Delete Image !!", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
}

function splitArrayToObjects(array, chunkSize, keys) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }

    return chunks.map(chunk => {
        const obj = {};
        chunk.forEach((value, index) => {
            obj[keys[index]] = value;
        });
        return obj;
    });
}
 function cropImageDataExtract(cropImage, image) {
   return new Promise((resolve,reject) => { 
   try {
     const delimiter = '|';
     let parts = cropImage.split(delimiter);
 
     if (parts.length < 5) {
       throw new Error("Invalid cropImage format");
     }
     let index = parseInt(parts[0]);
     let x = parseInt(parts[1]);
     let y = parseInt(parts[2]);
     let width = parseInt(parts[3]);
     let height = parseInt(parts[4]);
 
     if (isNaN(index) || isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
       throw new Error("Invalid numbers in cropImage");
     }
 
     if (index < 0 || index >= image.length) {
       throw new Error("Index out of bounds");
     }
 
     const file = image[index];
     let inputPath = path.join(__dirname, `../public/images/productImages/${file}`);
     let outputPath = path.join(__dirname, `../public/images/productImages/cropped_${file}`);
     console.log(`Values :: ${parts} Input Path :: ${inputPath} Output Path :: ${outputPath}`);
 
     sharp(inputPath)
       .extract({ left: x, top: y, width: width, height: height })
       .toFile(outputPath, (err, info) => {
         if (err) {
           console.log("Error occurred at cropping Image:: " + err);
           reject(err);
         }else {
           image[index] = `cropped_${file}`;
           console.log("Cropped Image :: inside else part ", image[index]);
           resolve(image);
         }
       });
   }catch (err) {
     console.log("Error occurred in try-catch :::::" + err);
     reject(err);
   }
});
}
 



