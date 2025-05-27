const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./mydb.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create table (if it doesn't exist)
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  password TEXT
)`);

// Optional: Insert a sample row (comment out after first run)
// db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, ['testuser', 'testpass'], function(err) {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log(`A row has been inserted with rowid ${this.lastID}`);
// });

// ✅ Export the database instance
module.exports = db;
