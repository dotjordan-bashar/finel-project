const AppError = require("../utils/AppError");

// Runs when no route matched the request
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

// Every error in the app ends up here and is turned into a JSON response
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Server error";

  // Invalid MongoDB id, e.g. /api/cars/123
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Duplicate unique field, e.g. an email that already exists
  if (err.code === 11000) {
    statusCode = 400;
    message = `${Object.keys(err.keyValue)[0]} already exists`;
  }

  // Mongoose schema validation failed
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({
    message,
    // show the stack trace only while developing
    ...(process.env.NODE_ENV === "development" && statusCode === 500 && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
