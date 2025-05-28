# Book Management API

This is a simple RESTful API built with Express, SQLite, JWT authentication, and bcrypt password hashing. Users can sign up, log in, add books, view their books, and delete books securely.

---

## Project Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo

2. Install dependencies
npm install

3. Set up the SQLite database:

The project uses SQLite and creates tables automatically on startup.
Ensure you have write permissions in the project directory.
Database file: mydb.sqlite will be created automatically.

4. Configure environment variables (optional but recommended):
Create a .env file to store secrets:
JWT_SECRET=your_jwt_secret_key_here


5. How to Run Locally
node index.js

6. API Endpoints & Example Requests
   
1. Signup
Endpoint: POST /signup

Body: JSON { "username": "user1", "password": "pass123" }

curl -X POST http://localhost:3000/signup \
 -H "Content-Type: application/json" \
 -d '{"username": "user1", "password": "pass123"}'

2. Login
Endpoint: POST /login

Body: JSON { "username": "user1", "password": "pass123" }
curl -X POST http://localhost:3000/login \
 -H "Content-Type: application/json" \
 -d '{"username": "user1", "password": "pass123"}'


3. Add Book (Authenticated)
Endpoint: POST /books

Headers: Authorization: Bearer <JWT_TOKEN>

Body: JSON { "title": "Book Title", "author": "Author Name", "genre": "Genre", "description": "Optional description" }
curl -X POST http://localhost:3000/books \
 -H "Authorization: Bearer <JWT_TOKEN>" \
 -H "Content-Type: application/json" \
 -d '{"title":"My Book", "author":"John Doe"}'


