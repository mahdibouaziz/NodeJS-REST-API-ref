const syncError = (message, statusCode, errorsData) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (errorsData) {
    error.data = errorsData;
  }
  throw error;
};
const asyncError = (err, next) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
};

module.exports = { syncError, asyncError };
