const express = require('express');
const router = express.Router();
const bookingController = require(`${__dirname}/../controller/bookingController.js`);
const authController = require(`${__dirname}/../controller/authController.js`);
const { protect, isLoggedIn } = authController;

const {
  getCheckoutSession,
  createBooking,
  getBooking,
  updateBooking,
  deleteBooking,
} = bookingController;

router.use(protect);

router
  .route('/')
  .post(createBooking)
  
  

  router.route('/:id')
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking);
router.get('/checkout-session/:tourId', protect, getCheckoutSession);


module.exports = router;
