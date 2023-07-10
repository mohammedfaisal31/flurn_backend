// models/bookingModel.js
const connection = require("../db_config/db_config");

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
    const [rows] = await db.promise().query(`
      SELECT 
        sp.seat_class, 
        CASE
          WHEN s.booked_count < s.total_seats * 0.4 THEN IFNULL(sp.min_price, sp.normal_price)
          WHEN s.booked_count >= s.total_seats * 0.4 AND s.booked_count <= s.total_seats * 0.6 THEN IFNULL(sp.normal_price, sp.max_price)
          WHEN s.booked_count > s.total_seats * 0.6 THEN IFNULL(sp.max_price, sp.normal_price)
        END AS price
      FROM seat_pricing sp
      JOIN (
        SELECT seat_class, COUNT(*) AS booked_count, COUNT(*) AS total_seats
        FROM seats
        WHERE is_booked = 1
        GROUP BY seat_class
      ) s ON sp.seat_class = s.seat_class
      WHERE sp.id = ?;
    `, [id]);

    return rows[0];
  } catch (error) {
    throw error;
  }
}


// Create a booking
async function createBooking(seatIds, email, phoneNumber) {
  try {
    // const connection = await db.promise().getConnection();
    // await connection.beginTransaction();
    console.log(email);
    // Check if any of the requested seats are already booked
    const [bookedSeats] = await connection.promise().query(
      "SELECT id FROM seats WHERE id IN (?) AND is_booked = 1",
      [seatIds]
    );
    console.log(bookedSeats);
    if (bookedSeats.length > 0) {
      throw new Error("One or more seats are already booked");
    }

    // Insert the booking and mark the seats as booked
    const [bookingResult] = await connection.query(
      "INSERT INTO bookings (email, phone, seat_id) VALUES (?, ?, ?)",
      [email, phoneNumber, seatIds[0]]
    );
    console.log(bookingResult);
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
