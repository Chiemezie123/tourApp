const express = require('express');
// const { deleteUser } = require('../controller/userController');
const router = express.Router();
const userController = require(`${__dirname}/../controller/userController`);
const authController = require(`${__dirname}/../controller/authController`);


const {
  getAllUsers,
  getUser,
  updateUser,
  updateMe,
  deleteMe,
  deleteUser,
  getMe,
  updateExistingDocuments,
  userUploadImage
} = userController;

const {
  signUp,
  logIn,
  forgotPasswords,
  resetPassword,
  updatePassword,
  protect,
  restriction,
  logOut
} = authController;




router.post('/signup', signUp);

router.post('/login', logIn);

router.get('/logout', logOut);

router.patch('/resetPassword/:token', resetPassword);

router.post('/forgotPassword', forgotPasswords);

router.patch('/updateDeleteField', updateExistingDocuments);
// using the protect middleware from his junction
router.use(protect);

router.patch('/updatePassword', updatePassword);

router.patch('/updateMe', restriction('user'), userUploadImage, updateMe);

router.delete('/deleteMe', restriction('user'), deleteMe);

router.get('/getMe', getMe, getUser);

// router.post('/resetPassword', resetPassword)

router.route('/').get(restriction('admin', 'lead-guide'), getAllUsers);

router
  .route('/:id')
  .get(restriction('admin'), getUser)
  .patch(restriction('admin'), updateUser)
  .delete(restriction('admin'), deleteUser);

module.exports = router;
