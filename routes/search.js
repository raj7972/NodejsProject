const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Query is required' });

  const searchTerm = `%${q}%`;
  db.all(
    `SELECT * FROM books WHERE title LIKE ? OR author LIKE ?`,
    [searchTerm, searchTerm],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      res.json(rows);
    }
  );
});

module.exports = router;
