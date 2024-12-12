const express = require('express');
// the review router has an inbuilt property name margeparams
// merges params from other routes(tour) to it
// so /tour/tourid/reviews
// /reviews
// which ever of this is passed is handle my this route

const router = express.Router({ mergeParams: true });
const reviewController = require(`${__dirname}/../controller/reviewController.js`);
const authController = require(`${__dirname}/../controller/authController.js`);
const {
  getAllReviews,
  createReviews,
  getReview,
  updateReviews,
  deleteReviews,
  setUpUserAndTourId,
} = reviewController;
const { protect, restriction } = authController;

// protect middleware to protect the middleware below, because of stacking
router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(restriction('user'), setUpUserAndTourId, createReviews);

router.route('/:id').get(getReview).patch(updateReviews).delete(deleteReviews);

module.exports = router;
