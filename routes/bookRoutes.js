const express = require('express');
const router = express.Router();

// Define your routes here, for example:
router.get('/', (req, res) => {
  res.send('Books endpoint');
});

// Export the router at the end:
module.exports = router;
