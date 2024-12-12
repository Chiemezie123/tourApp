const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'A user must have a name'],
      unique: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      lowercase:true,
      required: [true, 'A user must have an email'],
      validate: [validator.isEmail,'must have an email yh yh yh']
    },
    role:{
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default:'user',
    },
    password: {
      type: String,
      required: [true, 'A tour must have a group size'],
      select:false,
    },
    confirmPassword: {
      type: String,
      required: [true, 'password must correlate'],
      validate: {
        validator: function(el){
          return el === this.password;
        },
        message:'password are not the same',
      },
      select:false,
    },
    resetTokenProperty:{
      type:String,
    },
    resetTokenExpiresIn:{
      type:Date,
    },
    photo: {
      type: String,
      default:'default.jpg',
      required: [false, 'must include a profile picture']
    },

    createdPasswordAt :{
      type:Date,
      default:Date.now()
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  });


  // document middleware
  userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();

      this.createdPasswordAt = Date.now() -1000;

    next()
  });


  userSchema.pre('save', async function(next){
      if(!this.isModified('password')) return next()

      this.password = await bcrypt.hash(this.password,12);

      this.passwordConfirm = undefined;

      next()
  })

// query middleware

userSchema.pre(/^find/, function(next){
  this.find({ isDeleted: false });

  next()
})


  userSchema.methods.correctPassword = async function(loginPassword, dataBasePassword){
      return await bcrypt.compare(loginPassword, dataBasePassword)
  };


  userSchema.methods.changedPasswordAfter = function(jwtTimeStamp){
    const getMainTimeStamp = parseInt(this.createdPasswordAt.getTime() /1000,10);
    if(this.createdPasswordAt){
      console.log(getMainTimeStamp, jwtTimeStamp,'pena colastS')
      return jwtTimeStamp < getMainTimeStamp
    }

    return false
  }



  userSchema.methods.createNewTokenAndRetrieveToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.resetTokenProperty = crypto .createHash('sha256') .update(resetToken) .digest('hex');

    this.resetTokenExpiresIn = Date.now() +10 * 60 * 1000;
      // console.log(resetToken, this.resetTokenProperty, 'jireh');
      return resetToken
  }

  
  const User = mongoose.model('User', userSchema);

module.exports = User;
