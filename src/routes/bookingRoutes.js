// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');

// Get all seats
router.get('/seats', BookingController.getAllSeats);

// Get seat pricing
router.get('/seats/:id', BookingController.getSeatPricing);

// Create a booking
router.post('/booking', BookingController.createBooking);

// Retrieve bookings by user identifier
router.get('/bookings', BookingController.getBookingsByUserIdentifier);

module.exports = router;
