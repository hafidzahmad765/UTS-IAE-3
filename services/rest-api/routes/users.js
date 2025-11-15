const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { validateUser, validateUserUpdate } = require('../middleware/validation');
const bcrypt = require('bcryptjs');

// Impor data user dari file terpusat
let users = require('../data/users');

const router = express.Router();

// GET /api/users - Get all users
router.get('/', (req, res) => {
  const { page, limit, role, search } = req.query;
  
  let filteredUsers = [...users];
  
  // Filter by role
  if (role) {
    filteredUsers = filteredUsers.filter(user => user.role === role);
  }
  
  // Search by name or email
  if (search) {
    filteredUsers = filteredUsers.filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // If pagination params provided, return paginated response
  if (page && limit) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    return res.json({
      users: paginatedUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredUsers.length / limit),
        totalUsers: filteredUsers.length,
        hasNext: endIndex < filteredUsers.length,
        hasPrev: startIndex > 0
      }
    });
  }
  
  // Otherwise return all users as simple array
  // Kita hapus password sebelum mengirim
  const usersWithoutPassword = filteredUsers.map(u => {
    const { password, ...user } = u;
    return user;
  });
  res.json(usersWithoutPassword);
});

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      message: `User with ID ${req.params.id} does not exist`
    });
  }
  
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});


router.post('/', validateUser, async (req, res) => {
  
  const { name, email, age, password, role = 'user' } = req.body;
  
  // 1. Cek apakah email sudah ada
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({
      error: 'Email already exists',
      message: 'A user with this email already exists'
    });
  }

  // 2. Buat username default (dari nama)
  // Ganti spasi dengan _ dan buat jadi lowercase
  const defaultUsername = name.replace(/\s+/g, '_').toLowerCase();

  // 3. Cek jika username sudah ada
  const usernameExists = users.find(u => u.username === defaultUsername);
  if (usernameExists) {
     return res.status(409).json({
      error: 'Username already exists',
      message: 'A user with this name (or similar) already exists, please try another name.'
    });
  }

  // 4. Hash password yang dikirim dari form
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 5. Buat user baru
  const newUser = {
    id: uuidv4(),
    name,
    username: defaultUsername, // Gunakan username default
    email,
    password: hashedPassword, // Simpan password yang sudah di-hash
    age,
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  // 6. Kirim kembali user baru tanpa password
  const { password: pw, ...userWithoutPassword } = newUser;

  res.status(201).json({
    message: 'User created successfully',
    user: userWithoutPassword 
  });
});



// PUT /api/users/:id - Update user
router.put('/:id', validateUserUpdate, (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({
      error: 'User not found',
      message: `User with ID ${req.params.id} does not exist`
    });
  }
  
  const { name, email, age, role } = req.body;
  
  // Check if email already exists (excluding current user)
  if (email) {
    const existingUser = users.find(u => u.email === email && u.id !== req.params.id);
    if (existingUser) {
      return res.status(409).json({
        error: 'Email already exists',
        message: 'A user with this email already exists'
      });
    }
  }
  
  const updatedUser = {
    ...users[userIndex],
    ...(name && { name }),
    ...(email && { email }),
    ...(age && { age }),
    ...(role && { role }),
    updatedAt: new Date().toISOString()
  };
  
  users[userIndex] = updatedUser;
  
  const { password, ...userWithoutPassword } = updatedUser;
  res.json({
    message: 'User updated successfully',
    user: userWithoutPassword
  });
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({
      error: 'User not found',
      message: `User with ID ${req.params.id} does not exist`
    });
  }
  
  const deletedUser = users.splice(userIndex, 1)[0];
  const { password, ...userWithoutPassword } = deletedUser;

  res.json({
    message: 'User deleted successfully',
    user: userWithoutPassword
  });
});

module.exports = router;