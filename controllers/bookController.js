// booksController.js
const db = require('../database');

exports.addBook = (req, res) => {
  const { title, author, genre, description } = req.body;
  const userId = req.user.id; // from decoded JWT

  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }

  const sql = `INSERT INTO books (title, author, genre, description, user_id) VALUES (?, ?, ?, ?, ?)`;
  const params = [title, author, genre, description, userId];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      message: 'Book added successfully',
      book: {
        id: this.lastID,
        title,
        author,
        genre,
        description,
        user_id: userId
      }
    });
  });
};
