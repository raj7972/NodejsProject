const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./mydb.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});



// db.serialize(() => {
//   // Create books table
//   db.run(`CREATE TABLE IF NOT EXISTS books (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     title TEXT NOT NULL,
//     author TEXT NOT NULL,
//     genre TEXT,
//     description TEXT
//   )`);

//   // Create reviews table
//   db.run(`CREATE TABLE IF NOT EXISTS reviews (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     book_id INTEGER NOT NULL,
//     user_id INTEGER NOT NULL,
//     rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
//     comment TEXT,
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//     UNIQUE(book_id, user_id),
//     FOREIGN KEY(book_id) REFERENCES books(id),
//     FOREIGN KEY(user_id) REFERENCES users(id)
//   )`);
// });

// ✅ Export the database instance
module.exports = db;
