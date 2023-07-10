// db_config/db_config.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost', // Hosted on GCP, using a VM and hence db is also at local
  port: 3306, // MySQL port
  user: 'root', // Using root
  password: 'password', // Replace with your MySQL password
  database: 'booking_db', // Replace with your MySQL database name
});

module.exports = connection;
