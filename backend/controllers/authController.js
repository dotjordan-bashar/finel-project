const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const AppError = require("../utils/AppError");

// The user data we send to the frontend (never the password)
const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

// POST /api/auth/register  (public)
const register = async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    throw new AppError("This email is already registered", 400);
  }

  // People can sign up as customer or owner, never as admin
  const safeRole = role === "owner" ? "owner" : "customer";

  const user = await User.create({ name, email, password, phone, role: safeRole });

  res.status(201).json({ user: userResponse(user), token: generateToken(user._id) });
};

// POST /api/auth/login  (public)
const login = async (req, res) => {
  const { email, password } = req.body;

  // password has select:false in the model, so we ask for it here
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("Your account has been disabled, please contact support", 403);
  }

  res.json({ user: userResponse(user), token: generateToken(user._id) });
};

// GET /api/auth/me  (logged in)
const getMe = async (req, res) => {
  res.json({ user: userResponse(req.user) });
};

// PUT /api/auth/me  (logged in) - update name, phone or password
const updateMe = async (req, res) => {
  const { name, phone, password } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (password) user.password = password; // hashed by the pre-save hook

  await user.save();

  res.json({ user: userResponse(user) });
};

module.exports = { register, login, getMe, updateMe };
