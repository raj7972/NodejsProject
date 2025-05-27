const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes'); // adjust path if needed

const app = express();

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Middleware to parse URL-encoded form data (optional but useful)
app.use(bodyParser.urlencoded({ extended: true }));

// Mount your auth routes at /api/auth
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
