// In your routes/dashboard.js (or similar file)
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.get('/dashboard', authMiddleware, (req, res) => {
  // This route is protected by verifyToken middleware
  res.json({ message: `Welcome to the dashboard, ${req.user.username}!` });
});

module.exports = router;
