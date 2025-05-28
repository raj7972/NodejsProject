// routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // if you're using auth

const db = require('../database'); // adjust if needed

// Add a new book - Authenticated users only
router.post('/books', authMiddleware, (req, res) => {
  const { title, author, genre } = req.body;
  if (!title || !author || !genre) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  db.run(`INSERT INTO books (title, author, genre) VALUES (?, ?, ?)`, [title, author, genre], function (err) {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(201).json({ id: this.lastID, title, author, genre });
  });
});

module.exports = router;
