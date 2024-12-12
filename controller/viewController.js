const catchAsync = require(`${__dirname}/../ErrorHandling/catchAsync.js`);
const Tour = require(`${__dirname}/../models/tourModels.js`);
const bookings = require(`${__dirname}/../models/bookingModel.js`);
const ApiFeatures = require(`${__dirname}/features.js`);
const AllError = require(`${__dirname}/../ErrorHandling/AllError.js`);
// exports.toLandingPage =(req, res) => {
//     // where render method renders the template in the base file
//     res.status(200).render('base',{
//       tour:'The Forest Hikers',
//       user:'tony'
//     });
//   }

exports.toOverview = catchAsync(async (req, res) => {
  const getQueryObject = new ApiFeatures(Tour, req.query);
  query = getQueryObject.filter().sort().fields().query;
  query = await getQueryObject.pagination().query;

  const data = await query;

  res.status(200).render('overview', {
    title:"overview page",
    data,
  });
});



exports.toTour = catchAsync(async (req, res, next) => {
  let query;
  const { slug } = req.params;
  query = Tour.findOne({ slug: slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  const tour = await query;

  if(!tour){
    const message = new AllError('this tour in not found in the database',404)
    return next(message)
  };

  res.status(200).render('tour', {
    title: `${tour.name} tour `,
    tour,
  });
});


exports.login = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'login page',
  });
});


exports.userAccount = catchAsync(async(req, res, next)=>{
  res.status(200).render('userAccount', {
    title: 'account page',
  });
})


exports.getUserBookings = catchAsync(async(req, res, next)=>{
  // 1find all the booking
  const booking = await bookings.find({user: req.user.id});
  const tourId = booking.map((el)=> el.tour);
  // will select all the tours that have and id in the the tourIDs array
  const  tour = await Tour.find({_id:{ $in:tourId}})
res.status(200).render('overview',{
  title:'my tours',
  data:tour
})
})