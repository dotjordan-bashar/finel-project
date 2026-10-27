const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

// Read the token from the "Authorization: Bearer <token>" header
const getTokenFromHeader = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.split(" ")[1];
  }
  return null;
};

// Find the logged-in user from a token (returns null if the token is bad)
const getUserFromToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    return user && user.isActive ? user : null;
  } catch {
    return null;
  }
};

// Only logged-in users can continue
const protect = async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) {
    throw new AppError("Not authorized, please log in", 401);
  }

  const user = await getUserFromToken(token);
  if (!user) {
    throw new AppError("Your session is invalid or expired, please log in again", 401);
  }

  req.user = user;
  next();
};

// Like protect, but guests are allowed too (req.user stays undefined)
const optionalAuth = async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (token) {
    const user = await getUserFromToken(token);
    if (user) req.user = user;
  }
  next();
};

// Only users with one of the given roles can continue
// Example: authorize("owner", "admin")
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError("You do not have permission to do this", 403);
    }
    next();
  };
};

module.exports = { protect, optionalAuth, authorize };
