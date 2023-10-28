let errorHandler = (err, req, res, next) => {
  if (!err.message) err.message = "Internal Server Error";
  if (!err.statusCode) err.statusCode = 500;

  return res.status(err.statusCode).json({
    success: false,
    error: err.message,
  });
};

export default errorHandler;
