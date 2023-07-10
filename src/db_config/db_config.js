// db_config/db_config.js
const mysql = require("mysql2");
require('dotenv').config();

const connection = mysql.createConnection({
  host: "localhost", // Hosted on GCP, using a VM and hence db is also at local
  port: 3306, // MySQL port
  user: "root", // Using root
  password: "flurn_mysql", // MySQL password stored in env
  database: "booking_db", // MySQL database name
});

module.exports = connection;
