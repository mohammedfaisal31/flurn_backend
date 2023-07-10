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
// Create a booking
async function createBooking(seatIds, email, phoneNumber) {
  try {
    
    try {
      const bookedSeats = await db.promise().query('SELECT id FROM seats WHERE id IN (?) AND is_booked = 1', [seatIds]);
      console.log(bookedSeats);
      if (bookedSeats[0].length > 0) {
        throw new Error('One or more seats are already booked');
      }

      const bookingIds = [];

      for (const seatId of seatIds) {
        const [bookingResult] = await db.promise().query('INSERT INTO bookings (email, phone, seat_id) VALUES (?, ?, ?)', [
          email,
          phoneNumber,
          seatId,
        ]);

        bookingIds.push(bookingResult.insertId);

        await db.promise().query('UPDATE seats SET is_booked = 1 WHERE id = ?', [seatId]);
      }

      
      return bookingIds;
    } catch (error) {
      console.log(error) ;
    }
  } catch (error) {
    console.log(error);
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
