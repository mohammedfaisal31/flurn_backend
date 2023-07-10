// models/bookingModel.js
const db = require("../db_config/db_config");

// Fetch all seats from db
async function getAllSeats() {
  try {
    const [rows] = await db.promise().query("SELECT * FROM seats");
    return rows;
  } catch (error) {
    throw error;
  }
}

// Fetch seat pricing based on bookings
async function getSeatPricing(id) {
  try {
    const [rows] = await db.promise().query(
      `SELECT seat_class, 
                CASE 
                  WHEN booked_count < total_seats * 0.4 THEN IFNULL(min_price, normal_price)
                  WHEN booked_count >= total_seats * 0.4 AND booked_count <= total_seats * 0.6 THEN IFNULL(normal_price, max_price)
                  WHEN booked_count > total_seats * 0.6 THEN IFNULL(max_price, normal_price)
                END AS price
        FROM seat_pricing
        WHERE id = ?`,
      [id]
    );
    console.log(rows[0]);
    return rows[0];
  } catch (error) {
    throw error;
  }
}

// Create a booking
async function createBooking(seatIds, userName, phoneNumber) {
  try {
    const connection = await db.promise().getConnection();
    await connection.beginTransaction();

    // Check if any of the requested seats are already booked
    const [bookedSeats] = await connection.query(
      "SELECT id FROM seats WHERE id IN (?) AND is_booked = 1",
      [seatIds]
    );
    if (bookedSeats.length > 0) {
      throw new Error("One or more seats are already booked");
    }

    // Insert the booking and mark the seats as booked
    const [bookingResult] = await connection.query(
      "INSERT INTO bookings (user_name, phone_number, seat_id) VALUES (?, ?, ?)",
      [userName, phoneNumber, seatIds[0]]
    );

    const bookingId = bookingResult.insertId;

    // Update the is_booked flag for the booked seats
    await connection.query("UPDATE seats SET is_booked = 1 WHERE id IN (?)", [
      seatIds,
    ]);

    await connection.commit();
    connection.release();

    return bookingId;
  } catch (error) {
    throw error;
  }
}

// Retrieve bookings by user identifier
async function getBookingsByUserIdentifier(userIdentifier) {
  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM bookings WHERE user_name = ? OR phone_number = ?", [
        userIdentifier,
        userIdentifier,
      ]);
    return rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllSeats,
  getSeatPricing,
  createBooking,
  getBookingsByUserIdentifier,
};
