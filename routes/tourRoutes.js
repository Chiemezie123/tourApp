
const express = require('express')
const router = express.Router();
const tourController = require(`${__dirname}/../controller/tourController`);
const authController = require(`${__dirname}/../controller/authController.js`);
const reviewRouter = require('./reviewRoutes')
// const reviewController = require(`${__dirname}/../controller/reviewController.js`);
const {protect, restriction} = authController;
// const {getAllReviews, createReviews, getReview} = reviewController;
const {
    getAllTours,
    createTour,
    getTour,
    updateTour,
    checkBody,
    deleteTour,
    latestToursMiddleWare,
    getStatOfTours,
    getMonthlyPlan,
    getTourWithIn,
    uploadTourImages,
    resizeTourImages,
    getDistance
    } = tourController
    
// router.param("body", checkBody )
router
.route('/latestTours')
.get(latestToursMiddleWare, getAllTours)

router
.route('/getMaxTourPerMonth/:year')
.get(protect, restriction('admin', 'lead-guide','guide'),getMonthlyPlan)

router
.route('/getStat')
.get(getStatOfTours)

// below we are trying to get a particular tour at a certain distance within our location
// distance params shows the distance of the tour from our location
// center param shows the lat and lang of our position
// unit is the distance si unit

router
.route('/tourWithin/:distance/center/:latlong/unit/:unit')
.get(getTourWithIn)


router
.route('/distances/:latlong/unit/:unit')
.get(getDistance)
router
.route('/')
.get(getAllTours)
.post(protect, restriction('admin', 'lead-guide'),checkBody, createTour)

router
.route('/:id')
.get(protect,getTour)
.patch(
  protect,
  restriction('admin', 'lead-guide'),
  uploadTourImages,
  resizeTourImages,
  updateTour
)
.delete(
  protect,
   restriction('admin', 'lead-guide'),
    deleteTour
  );

// GET TOURS/{ID}/REVIEWS
// POST TOURS/{ID}/REVIEWS
// the below is possible to work because after express as routed to the tour router this below
// app.use('/api/v1/tours', tourRouter); while looking for /tourId/reviews
// and it has seen the use subcriber function chanelling the /:tourId/reviews to the reviewRouter
// it enter the reviewRouter where we merge the params , note continued on that page

router.use('/:tourId/reviews', reviewRouter)

// router
// .route('/:tourId/reviews')
// .post(protect,restriction('user'),createReviews)

module.exports = router