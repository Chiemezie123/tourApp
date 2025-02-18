const catchAsync = require(`${__dirname}/../ErrorHandling/catchAsync.js`);
const factoryFunc = require('./factoryFunc');
const AllError = require('../ErrorHandling/AllError');
const Tour = require(`${__dirname}/../models/tourModels.js`);
const Bookings = require(`${__dirname}/../models/bookingModel.js`);
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {deleteOne, updateOne, createOne, getOne} = factoryFunc;



exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // get currently booked tour
  const { tourId } = req.params;
  const tour = await Tour.findById(tourId);
  // 2) create  checkout session, information about the the session
  const successUrl = `${req.protocol || 'https'}://${
    req.get('host') || 'localhost:3000'
  }/`;
  const cancelUrl = `${req.protocol || 'https'}://${
    req.get('host') || 'localhost:3000'
  }/tour/${tour.slug || 'default-tour'}`;

  console.log('Success URL:', successUrl);
  console.log('Cancel URL:', cancelUrl);

const getBookingBelongingToTourId = await Bookings.find({tour:tourId});
const hasUserBookedTour = getBookingBelongingToTourId.find((element) => element.user._id.toString()  === req.user.id.toString());
if(hasUserBookedTour){
  const {user:{_id}}= hasUserBookedTour;
  if(_id) return next(new AllError('user has already booked this tour', 403))
}

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: tour.imageCover
              ? [`https://natours.dev/img/tours/${tour.imageCover}`]
              : [],
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    payment_method_types: ['card'],
    // the success url is the url the user would be redirected to if payment is successful
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    // the cancel url is the url the user would be redirected to if payment is unsuccessful
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    // information about the product
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});


exports.creatingBookingAndRedirectingUser = catchAsync(async(req, res, next)=>{
  const {tour, price, user} = req.query;

  if(!tour && !price && ! user) return next();

  const booking = await Bookings.create({tour, price, user})

  res.redirect(`${req.originalUrl.split('?')[0]}`);
})

exports.createBooking =createOne(Bookings);
exports.getBooking =getOne(Bookings);
exports.updateBooking = updateOne(Bookings);
exports.deleteBooking = deleteOne(Bookings)
