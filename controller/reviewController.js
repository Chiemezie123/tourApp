const AllError = require("../ErrorHandling/AllError");
const catchAsync = require(`${__dirname}/../ErrorHandling/catchAsync.js`);
const Review = require(`${__dirname}/../models/reviewModel.js`)
const factoryFunc = require('./factoryFunc');
const {deleteOne, updateOne, createOne, getOne} = factoryFunc;

// exports.getAllReviews = catchAsync(async(req, res,next)=>{
//     let filter = {};
//     if(req.params.tourId) filter = {tour: req.params.tourId};

//     const reviews = await Review.find(filter);

//     res.status(200).json({
//         message: "success",
//         length:reviews.length,
//         reviews: reviews
//     })
// });

exports.getAllReviews = getOne(Review);
// exports.getReview =catchAsync(async(req, res, next)=>{
//     const {id} = req.params;
//     const response = await Review.findById(id);

//     res.status(200).json({
//         message: "success",
//         review: response
//     })
// });
exports.getReview = getOne(Review);

// exports.updateReviews = catchAsync(async(req, res, next)=>{
//     const {id} = req.params;
//     const updatedReview = await Review.findByIdAndUpdate(id, req.body,{
//         new: true,
//         runValidators:true
//     });

//     // console.log(tour)

//     if(!updatedReview){
//         const err = new AllError('no review with this id is in your database', 404)
//         next(err);
//         return
//     };

//     res.status(200).json({
//         status:"success",
//         review: updatedReview
//     });

    
// });
exports.updateReviews =  updateOne(Review)
// exports.deleteReviews = catchAsync(async(req, res, next)=>{
//     const {id} = req.params;
//     const tour = await Review.findByIdAndDelete(id)
//     if(!tour){
//         const err = new AllError('no documents for with is ID exist in our database', 404)
//         next(err);
//         return
//     }
//     res.status(200).json({
//         status:"successfully deleted",
//         tours: tour
//     })
// });

exports.deleteReviews = deleteOne(Review)

exports.setUpUserAndTourId = (req, res,next)=>{
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id
    next()
}


exports.createReviews = createOne(Review);


// exports.createReviews = catchAsync(async(req, res, next )=>{
//         const newReview =req.body;
//     let createReview = new Review(newReview);
//     createReview = await createReview.save()
       

//         res.status(200).json({
//             message: "success",
//             reviews: createReview
//         })
// })