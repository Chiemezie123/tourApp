const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./usermodels')
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty level'],
    enum: {
      values: ['easy', 'medium', 'difficult','hard','medium'],
      message: 'Difficulty is either: easy, medium, or difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
    set: val => Math.round(val * 10) / 10 // rounds the rating to 1 decimal place
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },

  slug:String,

  summary: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
  },

  images: [String],

  startDates: [Date],

  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },

  secretTour: {
    type: Boolean,
    default: false
  },

  startLocation: {
    // GeoJSON
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
  ],
  // guide indictes the use of child referencing, where the child(in this case user),is been
  // refernced on the tour dataset
  // so that when the tour is created or queried, when get the information of the user(guide),on the document
  // then user is populated when queried
  // parent referencing = parent id inside child schema
  // child referencing = child id inside parent schema
  guides:[
    {
      type:mongoose.Schema.ObjectId,
      ref:'User'
    }
  ],
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
}
);

tourSchema.index({startLocation: '2dsphere'})
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7
});

//note taken
// virtual is trying to update the state of the document without persisting it on the database
// the foreign field is the name of the field in the other model(review)
// where  the ref to current model is stored
// local field is the id of the current model(tour._id)


tourSchema.virtual('reviews', {
  ref: "Review",            // The name of the model to reference (Review model)
  foreignField: "tour",     // The field in the Review model that contains the reference to the Tour
  localField: '_id',        // The field in the Tour model that corresponds to the foreignField
});

// so my learning on index , we use index  to create a collection of index of the field object added to the 
// index method, this is to the time it takes to query to each document of the tour to return a particular query
// it is often used for field that a queried mostly from users, 
// we dont have to search document in the collection since an index create a collection of index base on the field returned
 
tourSchema.index({price: 1, ratingsAverage:1 });

//document middleware

tourSchema.pre('save', function(next){
    this.slug = slugify(this.name);
    next()
});

// tourSchema.pre('save', async function(next){
//   const guide = this.guide.map(async (el)=> await User.findById(el));
//             this.guide = await Promise.all(guide);
//   next()
// })
// query middleware

tourSchema.pre(/^find/, function(next){
this.find({
    secretTour:{$ne:true}
})
next()
})


tourSchema.pre(/^find/, function(next){
  this.populate({
    path:'guides'
  })
  next()
  })


//aggregate middleware
// tourSchema.pre('aggregate', function(next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//     console.log(this.pipeline());
//     next();
//   });


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
