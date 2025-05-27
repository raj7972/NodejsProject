const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/authMiddleware'); // JWT middleware

// Add a new book (Authenticated)
router.post('/', authenticateToken, (req, res) => {
  const { title, author, genre, description } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }
  db.run(
    `INSERT INTO books (title, author, genre, description) VALUES (?, ?, ?, ?)`,
    [title, author, genre, description],
    function(err) {
      if (err) return res.status(500).json({ message: 'Failed to add book' });
      res.status(201).json({ id: this.lastID, title, author, genre, description });
    }
  );
});

// Get all books with pagination and optional filters
router.get('/', (req, res) => {
  let { page = 1, limit = 10, author, genre } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  let whereClauses = [];
  let params = [];

  if (author) {
    whereClauses.push(`author LIKE ?`);
    params.push(`%${author}%`);
  }
  if (genre) {
    whereClauses.push(`genre LIKE ?`);
    params.push(`%${genre}%`);
  }

  let whereSQL = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : '';

  // Count total books for pagination info
  db.get(`SELECT COUNT(*) AS count FROM books ${whereSQL}`, params, (err, countRow) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    const offset = (page - 1) * limit;

    db.all(
      `SELECT * FROM books ${whereSQL} LIMIT ? OFFSET ?`,
      [...params, limit, offset],
      (err, rows) => {
        if (err) return res.status(500).json({ message: 'DB error' });

        res.json({
          page,
          limit,
          total: countRow.count,
          books: rows,
        });
      }
    );
  });
});

// Get book details by ID including avg rating & reviews (with pagination)
router.get('/:id', (req, res) => {
  const bookId = req.params.id;
  let { page = 1, limit = 5 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;

  // Get book info
  db.get(`SELECT * FROM books WHERE id = ?`, [bookId], (err, book) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Get average rating
    db.get(
      `SELECT AVG(rating) as averageRating, COUNT(*) as reviewCount FROM reviews WHERE book_id = ?`,
      [bookId],
      (err, ratingStats) => {
        if (err) return res.status(500).json({ message: 'DB error' });

        // Get reviews with pagination
        db.all(
          `SELECT r.id, r.rating, r.comment, r.created_at, u.username 
           FROM reviews r JOIN users u ON r.user_id = u.id 
           WHERE r.book_id = ? 
           ORDER BY r.created_at DESC 
           LIMIT ? OFFSET ?`,
          [bookId, limit, offset],
          (err, reviews) => {
            if (err) return res.status(500).json({ message: 'DB error' });

            res.json({
              ...book,
              averageRating: ratingStats.averageRating ? parseFloat(ratingStats.averageRating).toFixed(2) : null,
              reviewCount: ratingStats.reviewCount,
              reviews,
              page,
              limit,
            });
          }
        );
      }
    );
  });
});

module.exports = router;
