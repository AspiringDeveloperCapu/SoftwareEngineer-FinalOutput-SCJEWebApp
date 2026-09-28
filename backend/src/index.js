const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
let { mockUsers, mockEvents, mockFaculty, mockGrades, mockSchedules, mockNotifications } = require('./mockData');

const app = express();
const PORT = process.env.PORT || 4000;
const SECRET_KEY = "scje_secret_super_safe";

app.use(cors());
app.use(express.json());

// ─── Auth Middleware ───────────────────────────────────────────────────────────
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ─── Auth Routes ──────────────────────────────────────────────────────────────
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
    { id: user.id, email: user.email, role: user.role, department: user.department, viewOnly: user.viewOnly },
    SECRET_KEY,
    { expiresIn: '2h' }
  );

  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

app.post('/api/auth/register-profile', (req, res) => {
  const { id, picture, fullName, birthday, course, section, gender } = req.body;

  const userIndex = mockUsers.findIndex(u => u.id === id);
  if (userIndex === -1) return res.status(404).json({ message: "User not found" });

  mockUsers[userIndex] = {
    ...mockUsers[userIndex],
    name: fullName,
    picture,
    birthday,
    course: course,
    section: section,
    gender,
    isFirstTimeLogin: false
  };

  const { password: _, ...safeUser } = mockUsers[userIndex];
  res.json({ user: safeUser });
});

// ─── Profile ──────────────────────────────────────────────────────────────────
app.put('/api/users/profile', authenticate, (req, res) => {
  const { name, picture, birthday, gender } = req.body;
  const userIndex = mockUsers.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) return res.status(404).json({ message: "User not found" });

  if (name) mockUsers[userIndex].name = name;
  if (picture) mockUsers[userIndex].picture = picture;
  if (birthday) mockUsers[userIndex].birthday = birthday;
  if (gender) mockUsers[userIndex].gender = gender;

  const { password: _, ...safeUser } = mockUsers[userIndex];
  res.json({ user: safeUser });
});

// ─── Events ───────────────────────────────────────────────────────────────────
app.get('/api/events', (req, res) => {
  res.json(mockEvents);
});

app.get('/api/events/:id', (req, res) => {
  const event = mockEvents.find(e => e.id === parseInt(req.params.id));
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json(event);
});

// ─── Faculty ──────────────────────────────────────────────────────────────────
app.get('/api/faculty', (req, res) => {
  res.json(mockFaculty);
});

// ─── Grades ───────────────────────────────────────────────────────────────────
app.get('/api/grades', authenticate, (req, res) => {
  const grades = mockGrades[req.user.id] || [];
  res.json(grades);
});

// ─── Schedule ─────────────────────────────────────────────────────────────────
app.get('/api/schedule', authenticate, (req, res) => {
  const schedule = mockSchedules[req.user.id] || [];
  res.json(schedule);
});

// ─── Notifications ────────────────────────────────────────────────────────────
app.get('/api/notifications', authenticate, (req, res) => {
  res.json(mockNotifications);
});

// ─── Dashboard Summary ───────────────────────────────────────────────────────
app.get('/api/dashboard/summary', authenticate, (req, res) => {
  const user = mockUsers.find(u => u.id === req.user.id);
  const grades = mockGrades[req.user.id] || [];
  const schedule = mockSchedules[req.user.id] || [];
  const unreadNotifications = mockNotifications.filter(n => !n.read).length;

  const gpa = grades.length > 0
    ? (grades.reduce((sum, g) => sum + g.grade, 0) / grades.length).toFixed(2)
    : "N/A";

  res.json({
    totalSubjects: grades.length,
    gpa,
    upcomingClasses: schedule.slice(0, 3),
    unreadNotifications,
    recentEvents: mockEvents.slice(0, 2)
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
