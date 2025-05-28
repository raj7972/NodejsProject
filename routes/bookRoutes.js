const express = require('express');
const router = express.Router();
const db = require('../database'); // Your SQLite instance
const authMiddleware = require('../middleware/authMiddleware'); // JWT auth middleware

// Utility: Calculate average rating
function calcAvgRating(reviews) {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / reviews.length).toFixed(2);
}

// POST /books - Add new book (Auth required)
router.post('/books', authMiddleware, (req, res) => {
  const { title, author, genre } = req.body;
  if (!title || !author || !genre) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const sql = `INSERT INTO books (title, author, genre) VALUES (?, ?, ?)`;
  db.run(sql, [title, author, genre], function(err) {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(201).json({ id: this.lastID, title, author, genre });
  });
});

// GET /books - Get all books with pagination & optional filters
router.get('/books', (req, res) => {
  let { page = 1, limit = 10, author, genre } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;

  let where = [];
  let params = [];

  if (author) {
    where.push('author LIKE ?');
    params.push(`%${author}%`);
  }
  if (genre) {
    where.push('genre LIKE ?');
    params.push(`%${genre}%`);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const sql = `SELECT * FROM books ${whereClause} LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  db.all(sql, params, (err, books) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    // Optionally: total count for pagination info
    const countSql = `SELECT COUNT(*) as count FROM books ${whereClause}`;
    db.get(countSql, params.slice(0, params.length - 2), (err, countResult) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      res.json({
        page,
        limit,
        total: countResult.count,
        books,
      });
    });
  });
});

// GET /books/:id - Book details + avg rating + reviews (with pagination)
router.get('/books/:id', (req, res) => {
  const bookId = req.params.id;
  const { page = 1, limit = 5 } = req.query;
  const offset = (page - 1) * limit;

  db.get('SELECT * FROM books WHERE id = ?', [bookId], (err, book) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Get reviews with pagination
    db.all(
      `SELECT * FROM reviews WHERE bookId = ? LIMIT ? OFFSET ?`,
      [bookId, limit, offset],
      (err, reviews) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        // Get total reviews count
        db.get(
          `SELECT COUNT(*) as count FROM reviews WHERE bookId = ?`,
          [bookId],
          (err, countResult) => {
            if (err) return res.status(500).json({ message: 'Database error' });

            const avgRating = calcAvgRating(reviews);

            res.json({
              book,
              avgRating,
              reviews,
              pagination: {
                page: Number(page),
                limit: Number(limit),
                totalReviews: countResult.count,
              },
            });
          }
        );
      }
    );
  });
});

// POST /books/:id/reviews - Submit review (auth required, one per user per book)
router.post('/books/:id/reviews', authMiddleware, (req, res) => {
  const bookId = req.params.id;
  const userId = req.user.id; // from JWT middleware
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be 1-5' });
  }

  // Check if user already reviewed this book
  db.get(
    `SELECT * FROM reviews WHERE bookId = ? AND userId = ?`,
    [bookId, userId],
    (err, existingReview) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (existingReview)
        return res.status(400).json({ message: 'Review already submitted' });

      const sql = `INSERT INTO reviews (bookId, userId, rating, comment) VALUES (?, ?, ?, ?)`;
      db.run(sql, [bookId, userId, rating, comment], function (err) {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.status(201).json({ id: this.lastID, bookId, userId, rating, comment });
      });
    }
  );
});

// PUT /reviews/:id - Update your review (auth required)
router.put('/reviews/:id', authMiddleware, (req, res) => {
  const reviewId = req.params.id;
  const userId = req.user.id;
  const { rating, comment } = req.body;

  // Check if review exists and belongs to user
  db.get(`SELECT * FROM reviews WHERE id = ?`, [reviewId], (err, review) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.userId !== userId)
      return res.status(403).json({ message: 'Not authorized' });

    // Update review
    const sql = `UPDATE reviews SET rating = ?, comment = ? WHERE id = ?`;
    db.run(sql, [rating, comment, reviewId], function (err) {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json({ message: 'Review updated' });
    });
  });
});

// DELETE /reviews/:id - Delete your review (auth required)
router.delete('/reviews/:id', authMiddleware, (req, res) => {
  const reviewId = req.params.id;
  const userId = req.user.id;

  db.get(`SELECT * FROM reviews WHERE id = ?`, [reviewId], (err, review) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.userId !== userId)
      return res.status(403).json({ message: 'Not authorized' });

    db.run(`DELETE FROM reviews WHERE id = ?`, [reviewId], (err) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json({ message: 'Review deleted' });
    });
  });
});

// GET /search?query= - Search books by title or author (partial, case-insensitive)
router.get('/search', (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: 'Query param is required' });

  const q = `%${query}%`;
  const sql = `SELECT * FROM books WHERE title LIKE ? OR author LIKE ?`;
  db.all(sql, [q, q], (err, books) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(books);
  });
});

module.exports = router;
