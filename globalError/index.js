const AllError = require('../ErrorHandling/AllError');

const invalidDurationHandler = () => {
  const message = `duration is not a string,it is an integer`;
  const newErrorMessage = new AllError(message, 400);
  return newErrorMessage;
};

const validationHandler = (err) => {
  let validationArray = Object.values(err.errors);
  validationArray = validationArray.map((el) => el.message).join('. ');
  const newErrorMessage = new AllError(validationArray, 400);
  return newErrorMessage;
};

const invalidIdHandler = (err) => {
  const message = `this id : ${err.value} is invalid`;
  const newErrorMessage = new AllError(message, 400);
  return newErrorMessage;
};

const duplicateNameHandler = (err) => {
  const { name } = err.keyValue;
  const message = `the name : ${name} already exist!`;
  const newErrorMessage = new AllError(message, 400);
  return newErrorMessage;
};

const handleJwtError = (err) => {
  const message = 'token is invalid , please login again';
  const newErrorMessage = new AllError(message, 400);
  return newErrorMessage;
};

const handleExpiredJwtError = () => {
  const message = 'token has expired , please login again';
  const newErrorMessage = new AllError(message, 400);
  return newErrorMessage;
};

const errorForDevMode = (err, req, res) => {
  if (req.originalUrl && req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      //   status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Error Page',
      msg: err.message,
    });
  }
};

const errorForProdMode = (err, req, res) => {
  if (req.originalUrl && req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // console.log(err)
      res.status(err.statusCode).json({
        name: err.name,
        message: err.message,
        status: err.status,
      });
    }
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Error Page',
      msg: err.message,
    });
  }
};

exports.globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'faileddd';
  err.message = err.message || 'shiity';
  // console.log(err,'checking error')
  if (process.env.NODE_ENV === 'development') {
    errorForDevMode(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    // console.log(err.message,'checking error production')
    if (err.name === 'CastError') {
      if (err.valueType === 'string' && err.kind === 'Number') {
        error = invalidDurationHandler(error);
      } else {
        error = invalidIdHandler(error);
      }
    }
    if (err.code === 11000) {
      error = duplicateNameHandler(error);
    }

    if (err.name === 'ValidationError') {
      error = validationHandler(error);
    }

    if (err.name === 'JsonWebTokenError') {
      error = handleJwtError();
    }

    if (err.name === 'TokenExpiredError') {
      error = handleExpiredJwtError();
    }
    errorForProdMode(error, req, res);
  }
};
