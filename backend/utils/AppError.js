// A normal Error that also carries an HTTP status code.
// Example: throw new AppError("Car not found", 404);
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
