const mongoose = require('mongoose');
const Tour = require('./tourModels');

const bookingsSchema = new mongoose.Schema(
  {
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'bookings must belong to a tour'],
      },
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
      price: {
        type: Number,
        required: [true, 'A bookings must have a price']
      },
      createdAt:{
            type:Date,
            default:Date.now()
      },
      paid:{
        type:Boolean,
        default:false,
      }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookingsSchema.pre(/^find/, function(next){
    this.populate('user').populate({
        path:'tour',
        select:'name'
    })
    next()
    })



const Bookings = mongoose.model('bookings', bookingsSchema);

module.exports = Bookings;
