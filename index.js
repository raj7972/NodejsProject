const express = require('express');
const app = express();

const authRoutes = require('./routes/authRoutes');

// Your middleware order matters!
// You need this to parse JSON bodies first:
app.use(express.json());

// Then mount auth routes:
app.use('/auth', authRoutes);  // mounts authRoutes at /auth

app.listen(5000, () => console.log('Server started on port 5000'));
