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
      seats.id,
      seats.seat_identifier,
      seats.seat_class,
      seats.booking_id,
      CASE
          WHEN booking_percentages.percentage IS NULL THEN
              IF(seat_pricing.min_price IS NOT NULL, seat_pricing.min_price, seat_pricing.normal_price)
          WHEN booking_percentages.percentage < 40 THEN
              IF(seat_pricing.min_price IS NOT NULL, seat_pricing.min_price, seat_pricing.normal_price)
          WHEN booking_percentages.percentage BETWEEN 40 AND 60 THEN
              IF(seat_pricing.normal_price IS NOT NULL, seat_pricing.normal_price, seat_pricing.max_price)
          ELSE
              IF(seat_pricing.max_price IS NOT NULL, seat_pricing.max_price, seat_pricing.normal_price)
      END AS price
  FROM
      seats
  JOIN
      seat_pricing ON seats.seat_class = seat_pricing.seat_class
  LEFT JOIN
      (
      SELECT
          seat_class,
          (COUNT(is_booked)*100/(SELECT COUNT(*) FROM seats WHERE seats.seat_class = booking_percentages.seat_class)) AS percentage
      FROM
          seats AS booking_percentages
      WHERE
          is_booked = 1
      GROUP BY
          seat_class
      ) AS booking_percentages ON seats.seat_class = booking_percentages.seat_class
  WHERE
      seats.id = ?;

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
      const bookedSeats = await db
        .promise()
        .query("SELECT id FROM seats WHERE id IN (?) AND is_booked = 1", [
          seatIds,
        ]);
        function seatAlreadyBookedError() {
          return new Error("One or more seats are already booked");
        }
        if (bookedSeats[0].length > 0) {
        seatAlreadyBookedError();
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
      throw (error);
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
