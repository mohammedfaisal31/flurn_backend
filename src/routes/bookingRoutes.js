// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');

// Get all seats
router.get('/api/seats', BookingController.getAllSeats);

// Get seat pricing
router.get('/api/seats/:id', BookingController.getSeatPricing);

// Create a booking
router.post('/api/booking', BookingController.createBooking);

// Retrieve bookings by user identifier
router.get('/api/bookings', BookingController.getBookingsByUserIdentifier);

module.exports = router;
