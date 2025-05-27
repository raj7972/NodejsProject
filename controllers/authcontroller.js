const User = require('../models/user');
const jwt = require('jsonwebtoken');

const createToken = (user) => {
  return jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

exports.signup = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already exists' });

    const user = new User({ username, password });
    await user.save();

    const token = createToken(user);
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = createToken(user);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
