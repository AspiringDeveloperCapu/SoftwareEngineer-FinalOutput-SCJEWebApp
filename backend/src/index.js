const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { mockUsers, mockEvents } = require('./mockData');

const app = express();
const PORT = process.env.PORT || 4000;
const SECRET_KEY = "scje_secret_super_safe"; // Use environment variables in production

app.use(cors());
app.use(express.json());

// --- Authentication Endpoint ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  // Find user in mock database
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, department: user.department, viewOnly: user.viewOnly },
    SECRET_KEY,
    { expiresIn: '2h' }
  );

  // Return user data (excluding password) and token
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// --- Events Endpoint ---
app.get('/api/events', (req, res) => {
  // Public endpoint for now, or you could add JWT middleware verification
  res.json(mockEvents);
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
