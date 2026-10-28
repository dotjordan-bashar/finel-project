const express = require("express");
const {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validate, bookingRules, bookingStatusRules } = require("../middleware/validators");

const router = express.Router();

// Every booking route needs a logged-in user
router.use(protect);

router.post("/", authorize("customer"), bookingRules, validate, createBooking);
router.get("/my", authorize("customer"), getMyBookings);
router.get("/owner", authorize("owner"), getOwnerBookings);
router.patch("/:id/status", bookingStatusRules, validate, updateBookingStatus);

module.exports = router;
