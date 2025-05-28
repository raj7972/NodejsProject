const express = require('express');
const app = express();

// ✅ Load environment variables (optional)
require('dotenv').config();

// ✅ Middleware to parse JSON bodies
app.use(express.json()); // ✅ MUST BE BEFORE ROUTES

const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

const bookRoutes = require('./routes/bookRoutes');
app.use('/api', bookRoutes);


app.use('/auth', authRoutes);    // e.g., /auth/register, /auth/login
app.use('/api', bookRoutes);     // e.g., /api/books

// ✅ Start the server
app.listen(5000, () => console.log('Server started on port 5000'));
