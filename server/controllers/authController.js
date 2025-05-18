const User = require('../models/User');
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Basic input check (can be improved later with express-validator)
    if (!userId || !password) {
      return res.status(400).json({ message: 'User ID and password are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      userId,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

module.exports = { registerUser };

const jwt = require('jsonwebtoken');
const loginUser = async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: 'User ID and password are required' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Optional: Create token (can be used on frontend to keep the user logged in)
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
      expiresIn: '2h',
    });

    res.status(200).json({ message: 'Login successful', token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};