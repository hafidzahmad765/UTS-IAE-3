const { v4: uuidv4 } = require('uuid');

// In-memory database
// Password untuk john dan jane sekarang adalah hash dari "password123"
let users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    username: 'john',
    password: '$2a$10$f.wT12Yjn.1/1t.sT9v7auqf.Fv8zL7qS2sF.jLz.V/8dY.y.w.m', // Hash dari "password123"
    age: 30,
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    username: 'jane',
    password: '$2a$10$f.wT12Yjn.1/1t.sT9v7auqf.Fv8zL7qS2sF.jLz.V/8dY.y.w.m', // Hash dari "password123"
    age: 25,
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

module.exports = users;