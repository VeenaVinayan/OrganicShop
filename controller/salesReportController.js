const Order = require('../models/order');
const User = require('../models/user');
const moment = require('moment');
const Product = require('../models/product');
const Coupon = require('../models/coupon');
const PDFDocument = require('pdfkit');
const { getSuccessPage } = require('./orderController');
let orderReport;
module.exports ={
    adminHome : async(req,res) =>{
    
        try {
            //Data for pie chart
            const payment = await Order.aggregate([
                {$match: {status:'Delivered'}},
                {$group:{_id:'$paymentMode',
                        total:{$sum: 1}} 
                },
                {$project:{_id:0,
                            paymentMode:'$_id',
                            total:1}
                },
            ]);
            const paymentData = JSON.stringify(payment);  
            //data for Bar chart
            const monthlyOrder = await Order.aggregate([
                { $match: { status: 'Delivered' ,
                            deliveredDate: {
                            $gte: new Date('2024-01-01T00:00:00.000Z'),
                            $lt: new Date('2025-12-31T00:00:00.000Z')
                         }
                      }  },
                {  $group: {
                        _id: {
                            month: { $month: "$deliveredDate" }
                        },
                        total: { $sum: 1 }
                    }
                },
                { $sort: { "_id.month": 1 } },
                { $project: {
                        _id: 0,
                        month: "$_id.month",
                        total: 1
                    }
                }  ]);
        //Find Years
            const yearlyData = await Order.aggregate([
                    {$match: {status:'Delivered',
                     deliveredDate: {
                        $gte: new Date('2023-01-01T00:00:00.000Z'),
                        $lt: new Date('2025-12-31T00:00:00.000Z')
                     }}
                   },
                    {$group: {
                          _id: {year:{$year:"$deliveredDate"} },
                          total:{$sum:1}  
                    }},
                    {$sort: { "_id.year" : 1}},
                    {$project: {
                          _id : 0,
                          year:"$_id.year",
                          total:1
                    }}

            ]);
            yearlyData.map( item => {
                console.log(" Values :: Year :"+ item.year+" Total :"+item.total);
            })
            // Best Selling Product 
            const bestSellingProduct = await Order.aggregate([
                    {$unwind: '$items'},
                    {$group:{
                            _id : '$items.product',
                            totalQuantity:{$sum:'$items.quantity'}
                    }}, 
                    {$sort: {totalQuantity:-1}},
                    {$limit:5},
                    {$lookup: {
                        from: 'products', 
                        localField: '_id',
                        foreignField: '_id',
                        as: 'productDetails'
                    }},
                    {$addFields: 
                        { productDetails: { $arrayElemAt: ['$productDetails', 0] } } },
                    {$project: {
                            _id: 0,
                            productId: '$_id',
                            totalQuantity: 1,
                            productDetails: 1
                        }
                    }
            ]);
        //Best Selling Category    
        const bestSellingCategory = await Order.aggregate([
        { $unwind: '$items' },
           {
              $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
                {
                    $group: {
                        _id: '$productDetails.category',
                        totalQuantity: { $sum: '$items.quantity' }
                    }
                },
                { $sort: { totalQuantity: -1 } },
                { $limit: 5 }, 
                {
                    $lookup: {
                        from: 'categories', 
                        localField: '_id',
                        foreignField: '_id',
                        as: 'categoryDetails'
                    }
                },
                {
                    $addFields: {
                        categoryDetails: { $arrayElemAt: ['$categoryDetails', 0] }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        categoryId: '$_id',
                        totalQuantity: 1,
                        categoryName: '$categoryDetails.catName'
                    }
                }
            ]);
            const bestSellingBrand = await Order.aggregate([
                { $unwind: '$items' },
                   {
                      $lookup: {
                            from: 'products',
                            localField: 'items.product',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    },
                    { $unwind: '$productDetails' },
                        {
                            $group: {
                                _id: '$productDetails.brand',
                                totalQuantity: { $sum: '$items.quantity' }
                            }
                        },
                        { $sort: { totalQuantity: -1 } },
                        { $limit: 5 }, 
                        {
                            $addFields: {
                                categoryDetails: { $arrayElemAt: ['$categoryDetails', 0] }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                brand: '$_id',
                                totalQuantity: 1,
                            }
                        }
                    ]);
            
            const monthlyOrders = JSON.stringify(monthlyOrder);
            const yearlyOrder = JSON.stringify(yearlyData) ;
            res.render('./admin/index',{
              product: bestSellingProduct,
              category: bestSellingCategory, 
              brand:bestSellingBrand,  
              payment:paymentData,  
              monthlyOrder:monthlyOrders,
              yearlyOrder,
           });
        }catch(err){
           console.log("Error occured : "+err);
        }
      },
    viewSalesReport : async(req,res) =>{
    try{  
         const totalOrder = await Order.aggregate([
            { $group: {
              '_id':null,
              orderTotal: {$sum:'$amount'},
              totalDiscount :{$sum:'$totalDiscount'},
              orderCount:{$sum: 1},
         }
        }]);
        const sum = totalOrder[0].orderTotal;
        const discount=totalOrder[0].totalDiscount;
        const count=totalOrder[0].orderCount;
        res.render('./admin/salesReport',{
            title:'Report',
            sumOrder: sum,
            discount,
            count,
          });
      }catch(err){
         console.log("Error occured :: "+err);
      }  
    },
    getReport : async (req,res) =>{
       try { 
           const { type ,from,to} = req.params;
           let today = moment();
           console.log("Values ::"+type,from,to);
           const FORMAT='YYYY-MM-DD';
           let startDate,endDate;
           if(type === 'Daily'){
               startDate = today.clone().startOf('day');
               endDate = today.clone().endOf('day');
           }else if(type === 'Weekly'){
               startDate= today.clone().subtract(7,'days').startOf('day');
               endDate = today.clone().endOf('day');
           }else if(type === 'Monthly'){
               startDate = today.clone().subtract(1,'month').startOf('day');
               endDate = today.clone().endOf('day');
           }else if(type === 'Yearly'){
               startDate = today.clone().subtract(1,'year').startOf('day');
               endDate = today.clone().endOf('day');
           }else if(type === 'Custom'){
               startDate = moment(from,FORMAT).startOf('day');
               endDate = moment(to,FORMAT).startOf('day');
           }else{
               startDate = moment(from,FORMAT).startOf('day');
               endDate = moment(to,FORMAT).startOf('day');
           }
           const orders = await Order.find({status:'Delivered',deliveredDate:{$gte:startDate.toDate(),$lte:endDate.toDate()}})
           .populate('user','name').populate('coupon','coupon')
           .sort({date:-1});   
           orderReport = orders;
           
    //Set report values properly
            res.status(200).json({succes:true,orders:orders});
         } catch(err){
              console.log(err);
         }
     },
//  generatePdf : async(req,res) =>{
//     const PDFDocument = require('pdfkit');

// try {
//     const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });

//     // Set headers to indicate content type
//     res.setHeader('Content-disposition', 'attachment; filename=order.pdf');
//     res.setHeader('Content-type', 'application/pdf');

//     // Pipe the document to the response
//     doc.pipe(res);

//     // Add title
//     doc.fontSize(18).text('Order Summary', { align: 'center' });

//     // Table Headers
//     const tableTop = 100;
//     const itemWidth = 100;
//     const nameWidth = 135;
//     const amountWidth = 50;
//     const discountWidth = 50;
//     const couponWidth = 100;
//     const paymentModeWidth = 70;
//     const dateWidth = 80;
//     const rowHeight = 25;
//     const margin = 50;  // Add a margin to avoid cutting off the content

//     // Calculate the available height for rows
//     const pageHeight = doc.page.height - margin * 2;
//     const availableHeight = pageHeight - tableTop;
//     const maxRowsPerPage = Math.floor(availableHeight / rowHeight);

//     // Draw table headers
//     const drawHeaders = (y) => {
//         doc.fontSize(14).font('Helvetica-Bold')
//             .text('Order ID', margin, y)
//             .text('Name', margin + 100, y)
//             .text('Amount', margin + 200, y)
//             .text('Offer', margin + 300, y)
//             .text('Coupon', margin + 370, y)
//             .text('Payment Mode', margin + 450, y)
//             .text('Delivered Date', margin + 570, y);
//     };

//     // Draw initial headers
//     drawHeaders(tableTop);

//     // Function to draw table rows
//     const drawRow = (y, item) => {
//         doc.fontSize(12)
//             .text(item._id.toString().substring(6, 16), margin, y, { width: itemWidth })
//             .text(item.user.name, margin + 100, y, { width: nameWidth })
//             .text(item.amount, margin + 200, y, { width: amountWidth })
//             .text(item.totalDiscount, margin + 300, y, { width: discountWidth })
//             .text(item.coupon ? item.coupon.coupon : 'No Coupon', margin + 370, y, { width: couponWidth })
//             .text(item.paymentMode, margin + 470, y, { width: paymentModeWidth })
//             .text(moment(item.deliveredDate).format('YYYY-MM-DD'), margin + 550, y, { width: dateWidth });
//     };

//     let y = tableTop + rowHeight;
//     let rowCount = 0;

//     orderReport.forEach(item => {
//         if (rowCount >= maxRowsPerPage) {
//             doc.addPage({ size: 'A4', layout: 'landscape' });
//             drawHeaders(tableTop); // Draw headers on the new page
//             y = tableTop + rowHeight; // Reset y position to the top of the new page
//             rowCount = 0; // Reset row count for the new page
//         }
//         drawRow(y, item);
//         y += rowHeight;
//         rowCount++;
//     });

//     // Finalize the PDF and end the stream
//     doc.end();

// } catch (error) {
//     console.error("Error generating PDF:", error);
//     res.status(500).send('Error generating PDF');
// }
// },

generatePdf: async (req, res) => {
  const PDFDocument = require("pdfkit");
  const moment = require("moment");

  try {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 40
    });

    res.setHeader("Content-Disposition", "attachment; filename=order-report.pdf");
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    /* ================= HEADER ================= */

    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("Daily Order Report", { align: "center" });

    doc
      .moveDown(0.5)
      .fontSize(11)
      .font("Helvetica")
      .text(`Generated on: ${moment().format("DD MMM YYYY, hh:mm A")}`, {
        align: "center",
        color: "gray"
      });

    doc.moveDown(1.5);

    /* ================= SUMMARY ================= */

    const totalOrders = orderReport.length;
    const totalRevenue = orderReport.reduce((sum, o) => sum + o.amount, 0);
    const totalDiscount = orderReport.reduce((sum, o) => sum + o.totalDiscount, 0);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Summary");

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Total Orders : ${totalOrders}`)
      .text(`Total Revenue : ₹${totalRevenue}`)
      .text(`Total Discount : ₹${totalDiscount}`);

    doc.moveDown(1.5);

    /* ================= TABLE ================= */

    const tableTop = doc.y;
    const rowHeight = 22;
    const startX = 40;

    const columnPositions = {
      orderId: startX,
      name: startX + 90,
      amount: startX + 240,
      discount: startX + 320,
      coupon: startX + 410,
      payment: startX + 520,
      date: startX + 640
    };

    const drawTableHeader = () => {
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("Order ID", columnPositions.orderId, tableTop)
        .text("Customer", columnPositions.name, tableTop)
        .text("Amount", columnPositions.amount, tableTop)
        .text("Discount", columnPositions.discount, tableTop)
        .text("Coupon", columnPositions.coupon, tableTop)
        .text("Payment", columnPositions.payment, tableTop)
        .text("Date", columnPositions.date, tableTop);

      doc
        .moveTo(startX, tableTop + 18)
        .lineTo(doc.page.width - startX, tableTop + 18)
        .stroke();
    };

    drawTableHeader();

    let y = tableTop + rowHeight;

    orderReport.forEach((item, index) => {
      if (y > doc.page.height - 50) {
        doc.addPage();
        drawTableHeader();
        y = tableTop + rowHeight;
      }

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(item._id.toString().slice(-6), columnPositions.orderId, y)
        .text(item.user.name, columnPositions.name, y)
        .text(`₹${item.amount}`, columnPositions.amount, y)
        .text(`₹${item.totalDiscount}`, columnPositions.discount, y)
        .text(item.coupon ? item.coupon.coupon : "—", columnPositions.coupon, y)
        .text(item.paymentMode, columnPositions.payment, y)
        .text(moment(item.deliveredDate).format("DD-MM-YYYY"), columnPositions.date, y);

      y += rowHeight;
    });

    /* ================= FOOTER ================= */

    const pageCount = doc.bufferedPageRange().count;

    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(9)
        .fillColor("gray")
        .text(
          `Page ${i + 1} of ${pageCount}`,
          0,
          doc.page.height - 30,
          { align: "center" }
        );
    }

    doc.end();

  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
}

}




