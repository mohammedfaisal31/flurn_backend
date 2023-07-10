// models/bookingModel.js
const db = require('../db_config/db_config');

// Fetch all seats from db
async function getAllSeats() {
  try {
    const [rows] = await db.promise().query('SELECT * FROM seats');
    return rows;
  } catch (error) {
    throw error;
  }
}

// Fetch seat pricing based on bookings
async function getSeatPricing(id) {
  try {
    const [rows] = await db
      .promise()
      .query(
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
    return rows[0];
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllSeats,
  getSeatPricing,
};
