const AllError = require("../ErrorHandling/AllError")
const multer = require('multer');
const sharp = require('sharp');


const Tour = require(`${__dirname}/../models/tourModels.js`)
const ApiFeatures = require(`${__dirname}/features.js`)
const AppError = require(`${__dirname}/../ErrorHandling/appError.js`)
const catchAsync = require(`${__dirname}/../ErrorHandling/catchAsync.js`)
const factoryFunc = require('./factoryFunc');
const {deleteOne, updateOne, createOne, getOne} = factoryFunc;
// class ApiFeatures{


//     constructor(query, queryString){
//         this.query = query;
//         this.queryString = queryString
//     }
    
//     filter(){
//         const queryObj = {...this.queryString}
//         const excludedFiles = ['sort', 'page', 'limit','fields']
//         excludedFiles.forEach((el)=> delete queryObj[el])
//         let queryString  = JSON.stringify(queryObj);
//         queryString =queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match)=> `$${match}`)
//         const newData = JSON.parse(queryString)
//         this.query = this.query.find(newData);
//         return this
//     }

//     fields(){
//         if (this.queryString.fields) {
//             const fields = this.queryString.fields.split(',').join(' ');
//             this.query = this.query.select(fields);
            
//           } else {
//             this.query = this.query.select('-__v'); // Exclude __v field by default
//           }
//           return this
//              }

//         sort(){
//             if(this.queryString.sort){
//                 const sortBy =this.queryString.sort.split(',').join(' ');
//                 this.query = this.query.sort(sortBy)
//             }else{
//                 this.query = this.query.sort('-createdAt')
//             }
//             return this
//         }

//         async pagination (){
         
//             const page = this.queryString.page * 1 || 1;
//             const limit = this.query.limit * 1|| 10;
//             const skip = (page - 1) * limit;

//             this.query = this.query.skip(skip).limit(limit);

//             if(this.queryString.page){
//                 const getDocumentNumber = await this.query.countDocuments();

//                 if(skip>= getDocumentNumber){ throw new Error("this page does not exist")}
//             }
//             return this
//         }
// }


const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

exports.resizeTourImages =catchAsync(async(req, res, next)=>{
  // console.log(req.files, 'imagefiles');
  if (!req.files.imageCover || !req.files.images) return next();
  //1) imageCover
  const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${imageCoverFilename}`);
  req.body.imageCover = imageCoverFilename

  //2) image
    
  req.body.images = await Promise.all(
    req.files.images.map(async (file, index) => {
      const tourImages = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${tourImages}`);
  
      return tourImages; // Return the filename instead of pushing
    })
  );
  
  console.log(req.body.imageCover, req.body.images, 'ARE YOU THERE')
  next()
});
//the code below are the middleware of some of the controllers
exports.checkBody =(req,res,next)=>{
if(!req.body.name || !req.body.price){
    return res.status(400).json({
        status:"bad request must include name and price"
    })
    // const appError = new AppError(err.message ='error', res);
    // appError.getAllTours({
    //     code:400,
    //     status: "bad request must include name and price",
    //     message: "must include name and price"
    // })
}
next()
}

exports.latestToursMiddleWare = (req, res, next)=>{
    req.query.limit= '5';
    req.query.sort = '-ratingsAverage,-price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    if(!req){
       res.status(404).json({
        status:"wrong request"
       })
    }
    next()
}

exports.getAllTours = getOne(Tour)

//the code below are the controllers (functions) of the tour routes
// exports.getAllTours = catchAsync(async(req, res)=>{
  
//     const getQueryObject = new ApiFeatures(Tour, req.query); 

//     let query ;
//     // console.log(getQueryObject, 'understand query object');          
//     // Chain the filter, sort, and fields methods
//      query = getQueryObject.filter().sort().fields().query;

//     // console.log(query, 'understand query returned'); 
//     // Call the asynchronous pagination method and wait for it
//     query = await getQueryObject.pagination().query;

//     const tours = await query

//     res.status(200).json({
//         status:"success",
//         results: tours.length,
//         data:{
//             tours
//         }
// });
//         // try{
          

//         // // Execute the query
            
//         // //    const queryObj = {...req.query}
       
//         // //    const excludedFiles = ['sort', 'page', 'limit','fields']
//         // //    excludedFiles.forEach((el)=> delete queryObj[el])
//         // //    let queryString  = JSON.stringify(queryObj);
//         // //    queryString =queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match)=> `$${match}`)
            
//         // //    const newData = JSON.parse(queryString)
//         // //    let query = Tour.find(newData);
//         // //    console.log(req.query,'queryobjct');

            
//         // //    if (req.query.fields) {
//         // //     const fields = req.query.fields.split(',').join(' ');
//         // //     query = query.select(fields);
//         // //   } else {
//         // //     query = query.select('-__v'); // Exclude __v field by default
//         // //   }
      

//         //     // if(req.query.sort){
//         //     //     const sortBy =req.query.sort.split(',').join(' ');
//         //     //     query = query.sort(sortBy)
//         //     // }else{
//         //     //     query = query.sort('-createdAt')
//         //     // }

//         //     // const page = req.query.page * 1 || 1;
//         //     // const limit = req.query.limit * 1|| 10;
//         //     // const skip = (page - 1) * limit;
            
            
           
//         //     // query = query.skip(skip).limit(limit);

//         //     // if(req.query.page){
//         //     //     const getDocumentNumber = await Tour.countDocuments();

//         //     //     if(skip>= getDocumentNumber){ throw new Error("this page does not exist")}
//         //     // }
            


         
//         // }catch(err){
//         //     // console.error(err); 
//         //     // res.status(404).json({
//         //     //     status: "failed",
//         //     //     message:err
//         //     // })
//         //     const appError = new AppError(err, res);
//         //     appError.getAllTours({
//         //         code:404,
//         //         status: "failed",
//         //         errorMessage: err
//         //     })
//         // }
// });



// exports.getTour = catchAsync(async(req, res)=> {
//     const {id} = req.params;
//     const response = await Tour.findById(id).populate('reviews')

//         // console.log(response)
//     if(!response){
//         const err = new AllError('no documents for with is ID', 404);
//         return next(err);
       
//     }
//    //  const response = await Tour.findOne({_id:req.params.id})
//     res.status(200).json({
//            status:"success",

//            tour :{
//                    response
//            }
//        })

//     // try{
        

//     // }catch(err){
//     //     res.status(404).json({
//     //                 status:"failed",
//     //                 message:err,
//     //             })
           
//     // }
// });


exports.getTour = getOne(Tour,'reviews');

// exports.createTour = catchAsync(async(req, res)=>{
//         const newTour = req.body
//         const createTour = new Tour(newTour);
//         const response = await createTour.save()
//         if(response){
//             res.status(201).json({
//                 status : 'success',
//                 data: {
//                     tours:response
//                 }
//             })}

//             //substituted using a try and catch block , to building a function that passes the async function as an
//             // as an arguement , the function (checkAsync) retuns a call back function the is called by the createTour
//             // function when the user navigates to that part
//     // try{
        
    
   
//     // }catch(err){
//     //     // res.status(400).json({
//     //     //     status:"failed",
//     //     //     message: err
//     //     // })

//     //     const appError = new AppError(err, res);
//     //         appError.createTour({
//     //             code:404,
//     //             status: "failed",
//     //             message: err
//     //         })
//     // }

// });

exports.getTourWithIn =catchAsync(async(req, res, next)=>{
  const {distance, latlong, unit } = req.params;
  const [lat, long] = latlong.split(',')

  if(!lat || !long){
    const message = `please provide the necessary latitude and longitude in the format lat,lang`;
    const errMessage = new AllError(message, 400);
    next(errMessage)
  }

// we now want to pass a filter object based on the queried start location
// startlocation field hold the geospaitail location where each tour start
// where  startLocation is the field then we pass the value we are search for
// we use a geospatail operator called geowithin
// finding documents within a certain geometry = geoWithin
// if you specify a redius of 50 miles , it measn your to return documents whos points prperty is within that 
// readius
// this time it is distance
// the centersphere operator take in an array the contians the corordeinates and radius
// (the coordinates of your query and the distance of your choice

// mongoose takes reduis i.e distance in radians , so we have to convert it below
const radius = unit === 'mi' ? distance/3963.2 : distance/6378.1;

  const tour = Tour.find({startLocation:{$geoWithin:{ $centerSphere:[
    [long, lat], radius
  ]}}});

  res.status(200).json({
    message:"success",
    data:tour
  })

})

exports.getDistance = catchAsync(async(req, res, next)=>{
  const {latlong, unit } = req.params;
  const [lat, long] = latlong.split(',')

  if(!lat || !long){
    const message = `please provide the necessary latitude and longitude in the format lat,lang`;
    const errMessage = new AllError(message, 400)
    next(errMessage)
  }

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001
    const distance = await Tour.aggregate([
        {
          // always need to be first
          $geoNear:{
              near:{
                type:'Point',
                coordinates:[long * 1, lat * 1]
              },
              distanceField: 'distance',
              distanceMultiplier: multiplier,
          }
        },
        {
          $project:{
            distance: 1,
            name:1
          }
        }
      ])



      res.status(200).json({
        message:"success",
        result : distance.length,
        data:distance
      })
});

exports.createTour = createOne(Tour)



// exports.updateTour = catchAsync(async(req, res)=>{

//     const {id} = req.params;
//         const tour = await Tour.findByIdAndUpdate(id, req.body,{
//             new: true,
//             runValidators:true
//         });

//         console.log(tour)
//         if(!tour){
//             const err = new AllError('no documents for with is ID', 404)
//             next(err);
//             return
//         };

//         res.status(200).json({
//             status:"success",
//             tours: tour
//         });
//     // try{
        

//     // }catch(err){
//     //     res.status(404).json({
//     //         status:"failed",
//     //         message: err
//     //     })
//     // }
// });


exports.updateTour = updateOne(Tour)
// exports.deleteTour = catchAsync(async(req, res,next)=>{
//     const {id} = req.params;
//     const tour = await Tour.findByIdAndDelete(id)
//     if(!tour){
//         const err = new AllError('no documents for with is ID', 404)
//         next(err);
//         return
//     }
//     res.status(200).json({
//         status:"successfully deleted",
//         tours: tour
//     })

//     // try{
       
//     // }catch(err){
//     //     res.status(404).json({
//     //         status:"failed",
//     //         message: err
//     //     })
//     // }
// });


exports.deleteTour = deleteOne(Tour)

// const toNumber= (props)=>{
//   return parseInt(props)
// }
exports.getStatOfTours = catchAsync(async(req , res)=>{

    const stat = await Tour.aggregate([
      // what match pipeline does is the find the field with value passed to it and return an arrat of of document
      // that match the even field , so for the example below
      // it returns the every documents that has the average rating that is gte 4.5
        // {
        //     $match :{ratingsAverage: {$gte:4.5}}
             
        // },
//group documents together basically using accumulators.aggregation framework to manipulate and analyze data in your database. 
// the group pipeline helps to analyze a collection based on the field you pass to the _id.
// it returns an array of documents based on the field passed, the individual documents also containing each
// specific properties you want to know about condition(field) to id
// 
        {
            $group:{
                _id:'$difficulty',
                numRatings: {$sum:{ $ifNull:['$ratingsQuantity', 0] } },
                numOfTours:{$sum:1},
                avgRating:{$avg:'$ratingsAverage'},
                avgPrice:{$avg:'$price'},
                minPrice:{$min:'$price'},
                maxPrice:{$max:'$price'}
             },
        },

// sort from highest to the lowest or lowest to highest based on the value passed to the property in question
        {
            $sort : {avgPrice: -1}
        },
        // {
        //     $match :{_id:{$ne: 'easy'}}
        // }
    ])

    res.status(200).json({
        status:"successfully",
        length:stat.length,
        tours: stat
    })
    // try{
        
    // }catch(err){
    //     res.status(404).json({
    //         status:"failed",
    //         message: err
    //     })
    // }
});


// {
  //     $match :{ratingsAverage: {$gte:4.5}}
       
  // },

exports.getMonthlyPlan = catchAsync(async (req, res) => {

    const year = req.params.year * 1; // 2021
  
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id:{$month:'$startDates'},
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      // this is the used to add another fields or property to the returned documents
      {
        $addFields: { month: '$_id'}
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      {
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
    // try {
     
    // } catch (err) {
    //   res.status(404).json({
    //     status: 'fail',
    //     message: err
    //   });
    // }
  });
  