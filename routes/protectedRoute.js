const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');

router.get('/dashboard', verifyToken, (req, res) => {
  // req.user is available here (decoded token)
  res.json({ message: `Welcome ${req.user.username}! This is a protected route.` });
});

module.exports = router;
