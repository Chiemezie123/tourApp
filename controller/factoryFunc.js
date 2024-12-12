const catchAsync = require(`${__dirname}/../ErrorHandling/catchAsync.js`);
const AllError = require('../ErrorHandling/AllError');
const ApiFeatures = require(`${__dirname}/features.js`)

exports.deleteOne = (model)=>
    catchAsync(async(req, res,next)=>{
        let {id} = req.params
    const doc = await model.findByIdAndDelete(id)
    if(!doc){
        const err = new AllError('no documents for with is ID', 404)
        next(err);
        return
    }
    res.status(200).json({
        status:"successfully deleted",
    })

})

exports.updateOne = (model)=>
    catchAsync(async(req, res,next)=>{
        console.log(req.body.imageCover, req.body.images, 'SEE YOU')
        const {id} = req.params;
        const doc = await model.findByIdAndUpdate(id, req.body,{
            new: true,
            runValidators:true
        });

        // console.log(tour)
        if(!doc){
            const err = new AllError('no documents for with is ID', 404)
            next(err);
            return
        };

        res.status(200).json({
            status:"success",
            doc
        });

})


exports.createOne = (model)=>
    catchAsync(async(req, res,next)=>{
        const newDoc = req.body
        const createDoc = new model(newDoc);
        const response = await createDoc.save()
        if(response){
            res.status(201).json({
                status : 'success',
                data: {
                    data:response
                }
                })}

            })

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
// });})

exports.getOne = (model,populateOption )=>
    catchAsync(async(req, res, next)=> {
        let filler ={};
        let query;
        const {id,tourId} = req.params;
        //  const {} = req.params;
        if(id){
            if(populateOption)  query = model.findById(id).populate(populateOption);
        } else if(tourId){
            filler = {tour : tourId};
            query = model.find(filler)
        }else{
            const getQueryObject = new ApiFeatures(model, req.query);  
            query = getQueryObject.filter().sort().fields().query;  
            query = await getQueryObject.pagination().query;
        }

    const response = await query

        // console.log(response)
    if(!response){
        const err = new AllError('no documents for with is ID', 404);
        return next(err);
       
    }
   //  const response = await Tour.findOne({_id:req.params.id})
    res.status(200).json({
           status:"success",
           results: response.length,
           data:{
                   response
           }
       })
    })