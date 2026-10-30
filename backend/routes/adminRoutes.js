const express = require("express");
const {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  getAllCars,
  updateCarStatus,
  getAllBookings,
  deleteBooking,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validate, carStatusRules, adminUserRules } = require("../middleware/validators");

const router = express.Router();

// Every admin route needs a logged-in admin
router.use(protect, authorize("admin"));

router.get("/stats", getStats);

router.get("/users", getUsers);
router.patch("/users/:id", adminUserRules, validate, updateUser);
router.delete("/users/:id", deleteUser);

router.get("/cars", getAllCars);
router.patch("/cars/:id/status", carStatusRules, validate, updateCarStatus);

router.get("/bookings", getAllBookings);
router.delete("/bookings/:id", deleteBooking);

module.exports = router;
