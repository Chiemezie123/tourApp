const mongoose = require('mongoose');
const Tour = require('./tourModels');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'must include a review'],
    },
    rating: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    // this review model created, the tourRef and userRef passed as a dataset to it represent
    // the parent referencing where the child references the parent by
    // having the id of the parent document releationship in an array
    // so that when the review is created or queried, we get info of the tour and user related to the reviews

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'reviews must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// note that in the static method , the this references the model of the document
//  this.aggregate returns a promise , so we await that
// this method would called somewhere using middleware each a time a document is created
reviewSchema.statics.calcRatingAndAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: {$sum: 1},
        avgRating: { $avg:'$rating'},
        // avgRating:{$avg:'$ratingsAverage'},
      },
    },
  ]);

  console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    // Reset ratings if no reviews exist
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};
// this index is used to make sure a user doesnt a duplicate review on a particular
// tour

reviewSchema.index({tour: 1, user: 1}, {unique: true})

// this below references the document being created or saved
// this.constructor reference the review model (this = document and constructor = model that created that document)

reviewSchema.post('save', function () {
  this.constructor.calcRatingAndAverageRating(this.tour[0]);
});
// note: find query method does not have access to the current review, this is why can't use this.tour
// findByIdAndUpdae
// findByIdandUpdate
// we use findOne(), to return the queried document , the create a field called rev that holds the initial
// queried document,
// after the query as been executed , the this.rev is used in the .post middleware to target the inital queried document
// and get the tour id from it

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.rev = await this.findOne();
  console.log(this.rev, 'look console')
  next();
});

// the this.rev is field created on the quereied document, it is a property that takes the return document
// the constructor method is on the this.rev object or queried document returned
// then the calcRatingAndAverageRating is passed to it since it is a static method
//  this.rev.tour[0] is the tour property on the returned query document

reviewSchema.post(/^findOneAnd/, function () {
  this.rev.constructor.calcRatingAndAverageRating(this.rev.tour[0]);
});



// if we were meant to use the populate on many
// this is one way to populate data,by putting the path together (tourRef, userRef)
// or by using the populate method
// 1
// this.populate({
//       path:'tourRef',
//       select:'name'
//     }).populate({
//     path:"userRef"
// })
// 2
// reviewSchema.pre(/^find/, function(next){
//     this.populate({
//       path:'tourRef userRef',
//       select:'name'
//     })
//     next()
//     })

// review decleration

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
