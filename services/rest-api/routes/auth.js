const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Impor data user
let users = require('../data/users');

const router = express.Router();

// Rahasia JWT (simpan di .env di aplikasi production)
const JWT_SECRET = 'your-very-secret-key-please-change-me';

// Skema validasi untuk register
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// Skema validasi untuk login
const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

// POST /api/auth/register - Registrasi user baru
router.post('/register', async (req, res) => {
  // 1. Validasi input
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      message: error.details[0].message
    });
  }
  
  const { username, email, password } = req.body;

  // 2. Cek apakah user sudah ada
  const emailExists = users.find(u => u.email === email);
  if (emailExists) {
    return res.status(409).json({ message: 'Email already exists' });
  }
  const usernameExists = users.find(u => u.username === username);
  if (usernameExists) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  // 3. Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 4. Buat user baru
  const newUser = {
    id: uuidv4(),
    name: username, // Default 'name' to 'username'
    username,
    email,
    password: hashedPassword,
    age: 18, // Default age
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(newUser);

  // 5. Buat token
  const token = jwt.sign({ id: newUser.id, username: newUser.username, role: newUser.role }, JWT_SECRET, {
    expiresIn: '1h' // Token berlaku 1 jam
  });

  const { password: pw, ...userWithoutPassword } = newUser;

  res.status(201).json({
    message: 'User created successfully',
    token,
    user: userWithoutPassword
  });
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  // 1. Validasi input
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      message: error.details[0].message
    });
  }

  const { username, password } = req.body;

  // 2. Cari user
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(400).json({ message: 'Invalid username or password' });
  }

  // 3. Cek password
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) {
    return res.status(400).json({ message: 'Invalid username or password' });
  }

  // 4. Buat dan kirim token
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
    expiresIn: '1h'
  });
  
  const { password: pw, ...userWithoutPassword } = user;

  res.json({
    message: 'Login successful',
    token,
    user: userWithoutPassword
  });
});

module.exports = router;