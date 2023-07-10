// db_config/db_config.js
const mysql = require("mysql2");
const fs = require("fs");
const csv = require("csv-parser");

const connection = mysql.createConnection({
  host: "localhost", // Hosted on GCP, using a VM and hence db is also at local
  port: 3306, // MySQL port
  user: "root", // Using root
  password: "flurn_mysql", // Replace with your MySQL password
  database: "booking_db", // Replace with your MySQL database name
});

// Read the CSV file
fs.createReadStream('/var/lib/mysql-files/Seats.csv')
  .pipe(csv({ separator: '\t', enclosed: '"' }))
  .on('data', (row) => {
    // Skip rows with null seat_identifier
    if (!row.seat_identifier) {
      return;
    }

    // Insert each valid row into the seats table
    connection.query('INSERT INTO seats (seat_identifier, seat_class) VALUES (?, ?)', [
      row.seat_identifier,
      row.seat_class,
    ], (error, results) => {
      if (error) {
        console.error(`Error inserting row: ${row.seat_identifier}`);
      }
    });
  })
  .on('end', () => {
    console.log('Data imported successfully');
    connection.end();
  });
module.exports = connection;
