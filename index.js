const express = require('express');
const bodyParser = require('body-parser');
const bookingRoutes = require('./src/routes/bookingRoutes');

const app = express();

// Parse JSON bodies
app.use(bodyParser.json());

// API routes
app.use('/api/', bookingRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
