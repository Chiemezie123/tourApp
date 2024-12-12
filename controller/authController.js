const User = require(`${__dirname}/../models/usermodels.js`);
const catchAsync = require(`${__dirname}/../ErrorHandling/catchAsync.js`);
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AllError = require('../ErrorHandling/AllError');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Email = require('../utils/emailHander');

// const { token } = require('morgan');
const sendEmail = require(`${__dirname}/../utils/emailHander`);

const getToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
};

const sendTokenGenerated = (user, statusCode, res) => {
  const token = getToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: false,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  // remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    user: user,
    token,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword, createdPasswordAt, role } =
    req.body;
  const newUser = {
    name,
    email,
    password,
    confirmPassword,
    createdPasswordAt,
    role,
  };

  const createNewUser = new User(newUser);
  const user = await createNewUser.save();
    const url = `${req.protocol}://${req.get('host')}/userAccount`
    let mail = new Email(user, url);
      mail = await mail.sendWelcome()
  if (user) {
    sendTokenGenerated(user, 201, res);
    // res.status(201).json({
    //     status : 'success',
    //     token,
    //     data: {
    //         user,
    //     }
    // })
  }
});
//a cookie is bascially just a small piece of text that server can send to client
// then when client receives its stores it and sends it back in all future request to the server

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const message = new AllError(`must input email and password`, 400);
    next(message);
  }

  const user = await User.findOne({ email }).select('+password');
  console.log(user, 'user is the what i am looking for');

  if(user === null) return next(new AllError('user doesnt exist ,please check email and password '));
  
  const isPassword = await user.correctPassword(password, user.password);
  console.log(isPassword, 'is this true');
  if (!user.email || !isPassword) {
    const message = new AllError(`incorrect password or email`, 401);
    return next(message);
  }
  const token = getToken(user._id);
  if (user) {
    sendTokenGenerated(user, 200, res);
  }
  // res.status(200).json({
  //   message: 'success',
  //   token,
  // });
  // console.log(user, 'user detail')
});

exports.logOut =(req, res, next)=>{
  const cookieOptions = {
    expires: new Date(
      Date.now() + 10  * 1000
    ),
    httpOnly: true,
  };

  res.cookie('jwt', 'noMOreJwtToken', cookieOptions);

  res.status(200).json({
    status:"success",
    message:"successfully, user logged out",
  })
};


exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }else{
    token = req.cookies.jwt
  }
  // console.log(req.headers.authorization, 'what is token')
  if (!token) {
    const message = new AllError(`user is not logged in`, 401);
    return next(message);
  }
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);
  // console.log(decode, 'ohhhhh')
  // if user still exist
  const freshUser = await User.findById(decode.id);
  // console.log(freshUser,'freshUser')
  if (!freshUser) {
    const message = new AllError(
      `the user who had this token no longer exist`,
      401
    );
    return next(message);
  }

  //check if user changed password after token was issued
  if (freshUser.changedPasswordAfter(decode.iat)) {
    // const message = ;
    // console.log(message,'from here')
    return next(
      new AllError(`Password has been changed, fuzzy please log in again`, 401)
    );
  }

  req.user = freshUser;

  next();
});


exports.isLoggedIn = async (req, res, next) => {
  
   try{
    let token = req.cookies.jwt; // Use req.cookies, not res.cookies

    if (!token) {
      return next(); // No token means user is not logged in, proceed without attaching a user
    }

    // Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);

    // Find the user based on the token's payload
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      return next(); // User no longer exists, proceed without attaching a user
    }

    // Check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
      return next(); // Password changed, token is no longer valid
    }

    // Attach user to the request object
    res.locals.user = freshUser;
    return next(); // User is logged in

   } catch(err){
    res.locals.user = null;
    return next()
   }
};


exports.restriction = (...roles) => {
  return (req, res, next) => {
    //['admin', 'lead-guide] role = 'user'
    if (!roles.includes(req.user.role)) {
      //   console.log(req.user.role, 'make i sure');
      const message = new AllError(
        `you are trying to access an authorized page`,
        403
      );
      return next(message);
    }

    next();
  };
};

exports.forgotPasswords = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    const message = new AllError(
      `fuck out! , this user doesn't exist in my database`,
      403
    );
    return next(message);
  }

  const resetToken = user.createNewTokenAndRetrieveToken();
  await user.save({ validateBeforeSave: false });

  const resetURl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/${resetToken}`;

  const message = `if you forgot your password, please on this url : ${resetURl} to get a new, or ignore if you dont need a new password`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'please reset password in 10 mins',
      message,
    });

    res.status(200).json({
      message: 'success',
      secondMessage: 'token sent to email',
    });
  } catch (err) {
    user.resetTokenProperty = undefined;
    user.resetTokenExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });

    const message = `password reset failed , please try again later`;
    const errorMessage = new AllError(message, 500);
    return next(errorMessage);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based on token
  // if token has expired, and there is user, set the new password
  // update changePasswordAt property for the user
  // login user in , send jwt
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  //   console.log(hashedToken, 'from here');
  const user = await User.findOne({
    resetTokenProperty: hashedToken,
    resetTokenExpiresIn: { $gt: Date.now() },
  });
  console.log(user, 'this is user');
  if (!user) {
    const message = `token is invalid or has expired`;

    const errorMessage = new AllError(message, 500);
    return next(errorMessage);
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.resetTokenProperty = undefined;
  user.resetTokenExpiresIn = undefined;
  await user.save();

  const jwTtoken = getToken(user._id);

  res.status(200).json({
    message: 'success',
    token: jwTtoken,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user from the collection
  // check if the posted passwords is correct
  // update the password
  // log the user in, with the new password that was just update
  let jwTtoken;
  const { id } = req.user;
  const user = await User.findById(id).select('+password');
  // console.log(user, 'chai');
  // const isConfirmPassword = comparePassword(password, user.confirmPassword)
  if (!user) {
    const message = new AllError(
      `no user with this details, is our database`,
      400
    );
    return next(message);
  }
  console.log( req.body.password, 'here')
  const isPassword = await user.correctPassword(
    req.body.password,
    user.password
  );
  if (isPassword) {
    user.password = req.body.updatePassword;
    user.confirmPassword = req.body.updatePassword;
    await user.save();
    jwTtoken = getToken(user._id);

    

    res.cookie('jwt', jwTtoken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

  } else {
    const message = new AllError(`fuck men , this password is wrong`, 401);
    return next(message);
  }
  // user.findIDandUpdate would not work,so the middle 'pre' for saving changes to the db would not be called
  // this is because when use findbyidandupdate, this doesnt save the previous schema object in memories, and doesnt also used the
  // the middleware to encrpt and update create for password,
  res.status(200).json({
    message: 'success',
    token: jwTtoken,
  });
});
