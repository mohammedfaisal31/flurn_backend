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
      `
      SELECT
      s.id,
      s.seat_identifier,
      s.seat_class,
      CASE
        WHEN s.booked_count < s.total_seats * 0.4 THEN IFNULL(sp.min_price, sp.normal_price)
        WHEN s.booked_count >= s.total_seats * 0.4 AND s.booked_count <= s.total_seats * 0.6 THEN IFNULL(sp.normal_price, sp.max_price)
        WHEN s.booked_count > s.total_seats * 0.6 THEN IFNULL(sp.max_price, sp.normal_price)
      END AS price
    FROM
      seats s
    JOIN
      (
        SELECT
          seat_class,
          COUNT(*) AS booked_count,
          (SELECT COUNT(*) FROM seats WHERE seat_class = s2.seat_class) AS total_seats
        FROM
          seats s2
        WHERE
          s2.is_booked = 1
        GROUP BY
          seat_class
      ) AS s_count ON s.seat_class = s_count.seat_class
    JOIN
      seat_pricing sp ON s.seat_class = sp.seat_class
    WHERE
      s.id = ?;
    `,
      [id]
    );

    return rows[0];
  } catch (error) {
    throw error;
  }
}

// Create a booking
async function createBooking(seatIds, email, phone) {
  try {
    try {
      const bookedSeats = await db
        .promise()
        .query("SELECT id FROM seats WHERE id IN (?) AND is_booked = 1", [
          seatIds,
        ]);
      if (bookedSeats[0].length > 0) {
        throw new Error("One or more seats are already booked");
      }

      const [bookingResult] = await db
        .promise()
        .query("INSERT INTO bookings (email, phone_number) VALUES (?, ?)", [
          email,
          phone,
        ]);

      const bookingId = bookingResult.insertId;

      let totalAmount = 0;
      for (const seatId of seatIds) {
        const pricing = await getSeatPricing(seatId);
        totalAmount += parseFloat(pricing.price);
        console.log(pricing);
        await db
          .promise()
          .query(
            "UPDATE seats SET is_booked = 1, booking_id = ? WHERE id = ?",
            [bookingId, seatId]
          );
      }

      return { bookingId, totalAmount };
    } catch (error) {
      console.log(error);
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
      .query("SELECT * FROM bookings WHERE email = ? OR phone_number = ?", [
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
