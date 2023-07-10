// controllers/bookingController.js
const Booking = require("../models/bookingModel");

// Get all seats
async function getAllSeats(req, res) {
  try {
    const seats = await Booking.getAllSeats();
    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Get seat pricing
async function getSeatPricing(req, res) {
  try {
    const { id } = req.params;
    const pricing = await Booking.getSeatPricing(id);
    console.log(pricing);
    res.json(pricing);
  } catch (error) {
    res.status(500).json({ error: err });
  }
}

// Create a booking
async function createBooking(req, res) {
  try {
    const { seatIds, userName, phoneNumber } = req.body;

    // Validate request data
    if (!seatIds || !userName || !phoneNumber) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    const bookingId = await Booking.createBooking(
      seatIds,
      userName,
      phoneNumber
    );

    return res.json({ bookingId });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// Retrieve bookings by user identifier
async function getBookingsByUserIdentifier(req, res) {
  try {
    const { userIdentifier } = req.query;

    if (!userIdentifier) {
      return res.status(400).json({ error: "User identifier is required" });
    }

    const bookings = await Booking.getBookingsByUserIdentifier(userIdentifier);

    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getAllSeats,
  getSeatPricing,
  createBooking,
  getBookingsByUserIdentifier,
};
