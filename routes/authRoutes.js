const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../database');  // ✅ Import DB
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Dummy users array - use DB later
const users = [];

// Signup
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  const userExists = users.find(u => u.username === username);
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: users.length + 1, username, password: hashedPassword };
  users.push(newUser);

  res.status(201).json({ message: 'User registered successfully' });
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, username: user.username }, 'your_jwt_secret');
  res.json({ token, user: { id: user.id, username: user.username } });
});

// Protected route to add a book
router.post('/books', authMiddleware, (req, res) => {
  const { title, author, genre, description } = req.body;
  const userId = req.user.id;

  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }

  const query = `INSERT INTO books (title, author, genre, description, user_id) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [title, author, genre, description, userId], function (err) {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });

    res.json({ id: this.lastID, title, author, genre, description, userId });
  });
});


router.get('/books', authMiddleware, (req, res) => {
  db.all(`SELECT * FROM books WHERE user_id = ?`, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});


router.delete('/books/:id', authMiddleware, (req, res) => {
  db.run(`DELETE FROM books WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ message: 'Error deleting book' });
    if (this.changes === 0) return res.status(404).json({ message: 'Book not found or not yours' });
    res.json({ message: 'Book deleted' });
  });
});


module.exports = router;
