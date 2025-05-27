const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/authMiddleware');

// Submit a review (one per user per book)
router.post('/:bookId/reviews', authenticateToken, (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  // Check if user already reviewed this book
  db.get(
    `SELECT * FROM reviews WHERE book_id = ? AND user_id = ?`,
    [bookId, userId],
    (err, row) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      if (row) return res.status(400).json({ message: 'You have already reviewed this book' });

      // Insert review
      db.run(
        `INSERT INTO reviews (book_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`,
        [bookId, userId, rating, comment],
        function(err) {
          if (err) return res.status(500).json({ message: 'Failed to add review' });
          res.status(201).json({ id: this.lastID, bookId, userId, rating, comment });
        }
      );
    }
  );
});

// Update your own review
router.put('/:reviewId', authenticateToken, (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id;
  const { rating, comment } = req.body;

  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  // Verify review ownership
  db.get(`SELECT * FROM reviews WHERE id = ?`, [reviewId], (err, review) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user_id !== userId) return res.status(403).json({ message: 'Unauthorized' });

    // Update review
    const newRating = rating || review.rating;
    const newComment = comment || review.comment;

    db.run(
      `UPDATE reviews SET rating = ?, comment = ? WHERE id = ?`,
      [newRating, newComment, reviewId],
      function(err) {
        if (err) return res.status(500).json({ message: 'Failed to update review' });
        res.json({ message: 'Review updated successfully' });
      }
    );
  });
});

// Delete your own review
router.delete('/:reviewId', authenticateToken, (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id;

  db.get(`SELECT * FROM reviews WHERE id = ?`, [reviewId], (err, review) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user_id !== userId) return res.status(403).json({ message: 'Unauthorized' });

    db.run(`DELETE FROM reviews WHERE id = ?`, [reviewId], function(err) {
      if (err) return res.status(500).json({ message: 'Failed to delete review' });
      res.json({ message: 'Review deleted successfully' });
    });
  });
});

module.exports = router;
