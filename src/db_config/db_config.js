// db_config/db_config.js
const mysql = require("mysql2");
const fs = require("fs");
const csv = require("csv-parser");

const connection = mysql.createConnection({
  host: "localhost", // Hosted on GCP, using a VM and hence db is also at local
  port: 3306, // MySQL port
  user: "root", // Using root
  password: "flurn_mysql", // Replace with your MySQL password
  database: "booking_test_db", // Replace with your MySQL database name
});

module.exports = connection;
