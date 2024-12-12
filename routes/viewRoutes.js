const express = require('express');
const router = express.Router();
const authController = require(`${__dirname}/../controller/authController.js`);
const viewController = require(`${__dirname}/../controller/viewController.js`);
const bookingController = require(`${__dirname}/../controller/bookingController.js`);
const { toLandingPage, toOverview, toTour,login, userAccount ,getUserBookings} = viewController;
const {isLoggedIn,protect} = authController;
const {creatingBookingAndRedirectingUser}= bookingController
// VIEW ROUTES
// this are the routes to the pug template that would displayed on the browser
// .get for rendering pages on the browser

// getUserBookings

// router.use();

router.route('/').get(isLoggedIn,creatingBookingAndRedirectingUser,toOverview);

router.route('/myTours').get(protect,isLoggedIn, getUserBookings);

router.route('/userAccount').get(isLoggedIn,userAccount);

router.route('/tour/:slug').get(isLoggedIn, toTour);

router.route('/login').get(isLoggedIn, login);

module.exports = router;

//   app.get('/overview', (req, res) => {
//     // where render method renders the template in the base file
//     res.status(200).render('overview',{
//       title:'All tours',
//     });
//   });

//   app.get('/tour', (req, res) => {
//     // where render method renders the template in the base file
//     res.status(200).render('tour',{
//       title:'The forest hikers',
//     });
//   });
