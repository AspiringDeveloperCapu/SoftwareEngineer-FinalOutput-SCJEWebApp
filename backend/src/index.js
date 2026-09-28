const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
let { mockUsers, mockEvents, mockFaculty, mockGrades, mockSchedules, mockNotifications, mockRoster } = require('./mockData');

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

// admin > instructor > student. Anything below the bar gets the same answer so
// the API never tells a caller what exists behind it.
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Not allowed." });
    }
    next();
  };
}

const gpaOf = (grades) =>
  grades.length > 0 ? (grades.reduce((sum, g) => sum + g.grade, 0) / grades.length).toFixed(2) : "N/A";

const studentRecord = (student) => {
  const grades = mockGrades[student.id] || [];
  return {
    ...student,
    grades,
    gpa: gpaOf(grades),
    totalUnits: grades.reduce((sum, g) => sum + g.units, 0)
  };
};

// ─── Auth Routes ──────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = mockUsers.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Account not recognized." });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role, department: user.department },
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
    section,
    gender,
    isFirstTimeLogin: false
  };

  const rosterIndex = mockRoster.findIndex(s => s.id === id);
  if (rosterIndex !== -1) {
    mockRoster[rosterIndex] = {
      ...mockRoster[rosterIndex],
      name: fullName,
      picture: picture || mockRoster[rosterIndex].picture,
      birthday,
      course,
      section,
      gender
    };
  }

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

  const rosterIndex = mockRoster.findIndex(s => s.id === req.user.id);
  if (rosterIndex !== -1) {
    mockRoster[rosterIndex] = { ...mockRoster[rosterIndex], name: mockUsers[userIndex].name, picture: mockUsers[userIndex].picture, birthday: mockUsers[userIndex].birthday, gender: mockUsers[userIndex].gender };
  }

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

app.post('/api/events', authenticate, requireRole('admin'), (req, res) => {
  const { title, date, description, location, type } = req.body;
  if (!title || !date) return res.status(400).json({ message: "Title and date are required." });

  const event = {
    id: Math.max(0, ...mockEvents.map(e => e.id)) + 1,
    title, date,
    description: description || "",
    location: location || "",
    type: type || "event"
  };
  mockEvents.push(event);
  res.status(201).json({ event });
});

app.put('/api/events/:id', authenticate, requireRole('admin'), (req, res) => {
  const index = mockEvents.findIndex(e => e.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Event not found" });

  const { title, date, description, location, type } = req.body;
  mockEvents[index] = {
    ...mockEvents[index],
    ...(title && { title }),
    ...(date && { date }),
    ...(description !== undefined && { description }),
    ...(location !== undefined && { location }),
    ...(type && { type })
  };
  res.json({ event: mockEvents[index] });
});

app.delete('/api/events/:id', authenticate, requireRole('admin'), (req, res) => {
  const index = mockEvents.findIndex(e => e.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Event not found" });

  const [removed] = mockEvents.splice(index, 1);
  res.json({ event: removed });
});

// ─── Faculty ──────────────────────────────────────────────────────────────────
app.get('/api/faculty', (req, res) => {
  res.json(mockFaculty);
});

app.post('/api/faculty', authenticate, requireRole('admin'), (req, res) => {
  const { name, position, department, specialization, email } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required." });

  const member = {
    id: Math.max(0, ...mockFaculty.map(f => f.id)) + 1,
    name, position: position || "", department: department || "SCJE",
    specialization: specialization || "", email: email || ""
  };
  mockFaculty.push(member);
  res.status(201).json({ faculty: member });
});

app.put('/api/faculty/:id', authenticate, requireRole('admin'), (req, res) => {
  const index = mockFaculty.findIndex(f => f.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Faculty member not found" });

  const { name, position, department, specialization, email } = req.body;
  mockFaculty[index] = {
    ...mockFaculty[index],
    ...(name && { name }),
    ...(position !== undefined && { position }),
    ...(department && { department }),
    ...(specialization !== undefined && { specialization }),
    ...(email !== undefined && { email })
  };
  res.json({ faculty: mockFaculty[index] });
});

app.delete('/api/faculty/:id', authenticate, requireRole('admin'), (req, res) => {
  const index = mockFaculty.findIndex(f => f.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Faculty member not found" });

  const [removed] = mockFaculty.splice(index, 1);
  res.json({ faculty: removed });
});

// ─── Student Roster (admin) ───────────────────────────────────────────────────
app.get('/api/admin/users', authenticate, requireRole('admin'), (req, res) => {
  res.json(mockRoster);
});

app.get('/api/admin/users/:id', authenticate, requireRole('admin'), (req, res) => {
  const student = mockRoster.find(s => s.id === parseInt(req.params.id));
  if (!student) return res.status(404).json({ message: "Student not found" });

  res.json({
    student,
    grades: mockGrades[student.id] || [],
    schedule: mockSchedules[student.id] || []
  });
});

// ─── Grades ───────────────────────────────────────────────────────────────────
app.get('/api/grades', authenticate, (req, res) => {
  if (req.user.role === 'student') {
    return res.json({ scope: 'own', grades: mockGrades[req.user.id] || [] });
  }

  const students = req.user.role === 'admin'
    ? mockRoster
    : mockRoster.filter(s => s.department === req.user.department);

  return res.json({
    scope: req.user.role === 'admin' ? 'all' : 'department',
    students: students.map(studentRecord)
  });
});

// ─── Schedule ─────────────────────────────────────────────────────────────────
app.get('/api/schedule', authenticate, (req, res) => {
  const asRows = (student) =>
    (mockSchedules[student.id] || []).map(row => ({
      ...row,
      student: student.name,
      section: student.section
    }));

  if (req.user.role === 'student') {
    return res.json((mockSchedules[req.user.id] || []).map(r => ({ ...r, student: "", section: "" })));
  }

  if (req.user.role === 'instructor') {
    return res.json(
      mockRoster
        .filter(s => s.department === req.user.department)
        .flatMap(asRows)
        .filter(r => r.instructor === req.user.name)
    );
  }

  return res.json(mockRoster.flatMap(asRows));
});

// ─── Notifications ────────────────────────────────────────────────────────────
app.get('/api/notifications', authenticate, (req, res) => {
  res.json(mockNotifications);
});

// ─── Dashboard Summary ────────────────────────────────────────────────────────
app.get('/api/dashboard/summary', authenticate, (req, res) => {
  const unreadNotifications = mockNotifications.filter(n => !n.read).length;
  const recentEvents = mockEvents.slice(0, 2);

  if (req.user.role === 'instructor') {
    const classes = mockRoster
      .filter(s => s.department === req.user.department)
      .flatMap(s => (mockSchedules[s.id] || []).map(r => ({ ...r, student: s.name, section: s.section })))
      .filter(r => r.instructor === req.user.name);

    return res.json({
      role: 'instructor',
      classesHandled: classes.length,
      subjects: new Set(classes.map(c => c.subject)).size,
      studentsTaught: new Set(classes.map(c => c.student)).size,
      upcomingClasses: classes.slice(0, 4),
      unreadNotifications,
      recentEvents
    });
  }

  if (req.user.role === 'admin') {
    return res.json({
      role: 'admin',
      totalStudents: mockRoster.length,
      totalFaculty: mockFaculty.length,
      totalEvents: mockEvents.length,
      unreadNotifications,
      recentEvents,
      faculty: mockFaculty.slice(0, 4)
    });
  }

  const grades = mockGrades[req.user.id] || [];
  const schedule = mockSchedules[req.user.id] || [];

  res.json({
    role: 'student',
    totalSubjects: grades.length,
    gpa: gpaOf(grades),
    upcomingClasses: schedule.slice(0, 3),
    unreadNotifications,
    recentEvents
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
