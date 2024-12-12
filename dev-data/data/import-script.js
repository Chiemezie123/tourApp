const dotenv = require('dotenv');
const Tour =require(`${__dirname}/../../models/tourModels.js`);
const User =require(`${__dirname}/../../models/usermodels.js`);
const Review =require(`${__dirname}/../../models/reviewModel.js`);
const fs = require('fs');
const mongoose = require('mongoose');

dotenv.config({path: `${__dirname}/../../config.env`});

const DB = process.env.DATABASE.replace("<db_password>", process.env.DATABASE_PASSWORD)

mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
  }).then(()=> console.log("db was connected successful"));

// READ JSON FILE
const tours = JSON.parse( fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse( fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse( fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Review.create(reviews);
    await Tour.create(tours);
    await User.create(users,{validateBeforeSave:false});
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}


console.log(process.argv)