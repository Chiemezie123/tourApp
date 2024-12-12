const express = require('express');
const morgan = require('morgan');
const app = express();
const rateLimit = require('express-rate-limit');
const tourRouter = require(`${__dirname}/routes/tourRoutes`);
const userRouter = require(`${__dirname}/routes/userRoutes`);
const viewRouter = require(`${__dirname}/routes/viewRoutes`);
const reviewRouter = require(`${__dirname}/routes/reviewRoutes`);
const bookingRouter = require(`${__dirname}/routes/bookingRoutes`);
const AllError = require(`${__dirname}/ErrorHandling/AllError.js`);
const getGlobalError = require(`${__dirname}/globalError`);
const { globalError } = getGlobalError;
const helmet = require('helmet');
const mongosantize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

const cookieParser = require('cookie-parser');
const limiter = rateLimit({
  // number of request we would make from an ip using max
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour, this is the time window this request would take to go,
  message: 'too many request, please chill',
});

// using the pug inbuilt template engine to build the template for natours
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// serving static files
app.use(express.static(path.join(__dirname, 'public')));
// data sanitation against noSql query injection
app.use(mongosantize());
// parse the cookie coming from the browser
app.use(cookieParser());
// data sanitation against xss
app.use(xss());
// Apply the rate limiting middleware to all requests.
app.use(limiter);
// set security http headers
app.use(helmet());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-eval'", // Allow eval (if needed for other purposes)
        "https://js.stripe.com" // Allow Stripe.js
      ],
      connectSrc: [
        "'self'",
        "https://api.mapbox.com",
        "https://events.mapbox.com",
        "https://api.stripe.com", // Allow Stripe API
      ],
      workerSrc: ["'self'", "blob:"],
      frameSrc: ["'self'", "https://js.stripe.com"], // Allow Stripe for iframes
      imgSrc: ["'self'", "data:"], // Allow images from the same origin and inline data
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles if necessary
    },
  })
);

// developement logging to console
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// body parser , convert jscon to object
app.use(express.json());

// app.use((req, res, next) => {
//   res.setHeader(
//     "Content-Security-Policy",
//     `
//       default-src 'self';
//       script-src 'self' https://api.mapbox.com;
//       style-src 'self' https://api.mapbox.com https://fonts.googleapis.com;
//       connect-src 'self' https://api.mapbox.com;
//       img-src 'self' data: https://api.mapbox.com;
//       font-src 'self' https://fonts.gstatic.com;
//       worker-src 'self' blob:;
//     `
//   );
//   next();
// });

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} yhhh`);
  next();
});

app.use(
  hpp({
    whitelist: [
      'duration',
      'difficulty',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
    ],
  })
);

// API ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`there is no ${req.url} route from the server`);
  // err.statusCode = 404;
  // err.status= 'failed';
  // console.log(`Unhandled route: ${req.method} ${req.url}`);
  const err = new AllError(`there is no ${req.url} route from the server`, 404);

  next(err);
});

app.use(globalError);

// app.get('/api/v1/tours',getAllTours)

// app.get('/api/v1/tours/:id',getTour)

// app.post('/api/v1/tours',createTour )

// app.patch('/api/v1/tours/:id' , updateTour )

module.exports = app;
