const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
let { mockUsers, mockEvents, mockFaculty } = require('./mockData');

const app = express();
const PORT = process.env.PORT || 4000;
const SECRET_KEY = "scje_secret_super_safe";

app.use(cors());
app.use(express.json());

// --- Authentication Endpoint ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, viewOnly: user.viewOnly },
    SECRET_KEY,
    { expiresIn: '2h' }
  );

  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// --- Register Profile (First Time Login) ---
app.post('/api/auth/register-profile', (req, res) => {
  const { id, picture, fullName, birthday, course, section, gender } = req.body;
  
  let userIndex = mockUsers.findIndex(u => u.id === id);
  if (userIndex === -1) return res.status(404).json({ message: "User not found" });

  // Update user with new details
  mockUsers[userIndex] = {
    ...mockUsers[userIndex],
    name: fullName,
    picture,
    birthday,
    course: `${course} / ${section}`,
    gender,
    isFirstTimeLogin: false
  };

  const updatedUser = mockUsers[userIndex];
  const { password: _, ...safeUser } = updatedUser;

  res.json({ user: safeUser });
});

// --- Events Endpoint ---
app.get('/api/events', (req, res) => {
  res.json(mockEvents);
});

// --- Faculty Endpoint (Administration) ---
app.get('/api/faculty', (req, res) => {
  res.json(mockFaculty);
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
