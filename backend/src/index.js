const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
let { mockUsers, mockEvents, mockFaculty, mockAnnouncements, mockGrades, mockSchedules, mockNotifications, getRoster } = require('./mockData');

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

const ROLES = ["student", "instructor", "admin"];
const STATUSES = ["draft", "published", "cancelled"];

const safeUser = ({ password, ...rest }) => rest;

const studentRecord = (student) => {
  const grades = mockGrades[student.id] || [];
  return {
    ...student,
    grades,
    gpa: gpaOf(grades),
    totalUnits: grades.reduce((sum, g) => sum + g.units, 0)
  };
};

// The demo can only lock itself out by removing its last administrator, so the
// guard counts them instead of trusting a hard-coded id.
const adminCount = () => mockUsers.filter(u => u.role === "admin").length;

const nextId = (rows) => Math.max(0, ...rows.map(r => r.id)) + 1;

// Pins are independent now: as many announcements and events as the admin
// wants can be pinned at the same time, and the dashboard hero stacks them
// all. (The old rule cleared every other row when one was pinned - that limit
// is gone, because sometimes more than one thing needs to be pinned.)
const pinnedAnnouncement = () => mockAnnouncements.find(a => a.pinned) || null;

// Announcements first, then pinned events - drafts stay off this list, exactly
// like they stay off the public feed.
const pinsForSummary = () => [
  ...mockAnnouncements
    .filter(a => a.pinned)
    .map(a => ({
      type: "announcement",
      id: a.id,
      title: a.title,
      body: a.body,
      date: a.date,
      time: a.time,
      endTime: a.endTime,
      category: a.category
    })),
  ...mockEvents
    .filter(e => e.pinned && e.status !== "draft")
    .map(e => ({
      type: "event",
      id: e.id,
      title: e.title,
      date: e.date,
      time: e.time,
      endTime: e.endTime,
      location: e.location
    }))
];

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

  res.json({ token, user: safeUser(user) });
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

  res.json({ user: safeUser(mockUsers[userIndex]) });
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

  res.json({ user: safeUser(mockUsers[userIndex]) });
});

// ─── Events ───────────────────────────────────────────────────────────────────
// The public feed never shows drafts; admins read the full list from
// /api/admin/events instead.
app.get('/api/events', (req, res) => {
  res.json(mockEvents.filter(e => e.status !== "draft"));
});

app.get('/api/admin/events', authenticate, requireRole('admin'), (req, res) => {
  res.json(mockEvents);
});

// Drafts are admin-only, so the public detail route treats them as missing.
app.get('/api/events/:id', (req, res) => {
  const event = mockEvents.find(e => e.id === parseInt(req.params.id));
  if (!event || event.status === "draft") return res.status(404).json({ message: "Event not found" });
  res.json(event);
});

app.post('/api/events', authenticate, requireRole('admin'), (req, res) => {
  const { title, date, time, endTime, description, location, type, status, pinned } = req.body;
  if (!title || !date) return res.status(400).json({ message: "Title and date are required." });
  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ message: "Status must be draft, published or cancelled." });
  }

  const event = {
    id: nextId(mockEvents),
    title, date,
    time: time || "",
    endTime: endTime || "",
    description: description || "",
    location: location || "",
    type: type || "event",
    status: status || "published",
    pinned: !!pinned
  };
  mockEvents.push(event);
  res.status(201).json({ event });
});

app.put('/api/events/:id', authenticate, requireRole('admin'), (req, res) => {
  const index = mockEvents.findIndex(e => e.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Event not found" });

  const { title, date, time, endTime, description, location, type, status, pinned } = req.body;
  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ message: "Status must be draft, published or cancelled." });
  }
  mockEvents[index] = {
    ...mockEvents[index],
    ...(title && { title }),
    ...(date && { date }),
    ...(time !== undefined && { time }),
    ...(endTime !== undefined && { endTime }),
    ...(description !== undefined && { description }),
    ...(location !== undefined && { location }),
    ...(type && { type }),
    ...(status && { status }),
    ...(pinned !== undefined && { pinned: !!pinned })
  };
  res.json({ event: mockEvents[index] });
});

app.delete('/api/events/:id', authenticate, requireRole('admin'), (req, res) => {
  const index = mockEvents.findIndex(e => e.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Event not found" });

  const [removed] = mockEvents.splice(index, 1);
  res.json({ event: removed });
});

// ─── Announcements ────────────────────────────────────────────────────────────
app.get('/api/announcements', (req, res) => {
  const pinned = mockAnnouncements.filter(a => a.pinned);
  const rest = mockAnnouncements.filter(a => !a.pinned);
  res.json([...pinned, ...rest]);
});

app.get('/api/announcements/pinned', (req, res) => {
  res.json(pinnedAnnouncement());
});

app.post('/api/announcements', authenticate, requireRole('admin'), (req, res) => {
  const { title, body, category, pinned, time, endTime } = req.body;
  if (!title || !body) return res.status(400).json({ message: "Title and body are required." });

  const announcement = {
    id: nextId(mockAnnouncements),
    title,
    body,
    author: req.user.name,
    date: new Date().toISOString().slice(0, 10),
    time: time || "",
    endTime: endTime || "",
    category: category || "announcement",
    pinned: !!pinned
  };
  mockAnnouncements.push(announcement);
  res.status(201).json({ announcement });
});

app.put('/api/announcements/:id', authenticate, requireRole('admin'), (req, res) => {
  const index = mockAnnouncements.findIndex(a => a.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Announcement not found" });

  const { title, body, category, pinned, time, endTime } = req.body;
  mockAnnouncements[index] = {
    ...mockAnnouncements[index],
    ...(title && { title }),
    ...(body && { body }),
    ...(category && { category }),
    ...(time !== undefined && { time }),
    ...(endTime !== undefined && { endTime }),
    ...(pinned !== undefined && { pinned: !!pinned })
  };
  res.json({ announcement: mockAnnouncements[index] });
});

app.delete('/api/announcements/:id', authenticate, requireRole('admin'), (req, res) => {
  const index = mockAnnouncements.findIndex(a => a.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Announcement not found" });

  const [removed] = mockAnnouncements.splice(index, 1);
  res.json({ announcement: removed });
});

// ─── Faculty ──────────────────────────────────────────────────────────────────
app.get('/api/faculty', (req, res) => {
  res.json(mockFaculty);
});

app.post('/api/faculty', authenticate, requireRole('admin'), (req, res) => {
  const { name, position, department, specialization, email } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required." });

  const member = {
    id: nextId(mockFaculty),
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

// ─── Accounts (admin) ─────────────────────────────────────────────────────────
app.get('/api/admin/users', authenticate, requireRole('admin'), (req, res) => {
  res.json(mockUsers.map(safeUser));
});

app.get('/api/admin/users/:id', authenticate, requireRole('admin'), (req, res) => {
  const account = mockUsers.find(u => u.id === parseInt(req.params.id));
  if (!account) return res.status(404).json({ message: "Account not found" });

  res.json({
    student: safeUser(account),
    grades: mockGrades[account.id] || [],
    schedule: mockSchedules[account.id] || []
  });
});

app.post('/api/admin/users', authenticate, requireRole('admin'), (req, res) => {
  const { name, email, password, role, department, course, section, year } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required." });
  }
  if (!ROLES.includes(role)) {
    return res.status(400).json({ message: "Role must be student, instructor or admin." });
  }
  if (mockUsers.some(u => u.email === email)) {
    return res.status(409).json({ message: "That email is already registered." });
  }

  const account = {
    id: nextId(mockUsers),
    email,
    password,
    name,
    department: department || "SCJE",
    course: course || "",
    section: section || "",
    year: year || "",
    role,
    isFirstTimeLogin: false,
    picture: "",
    birthday: "",
    gender: ""
  };
  mockUsers.push(account);
  res.status(201).json({ user: safeUser(account) });
});

app.put('/api/admin/users/:id', authenticate, requireRole('admin'), (req, res) => {
  const index = mockUsers.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Account not found" });

  const { name, email, password, role, department, course, section, year } = req.body;
  const account = mockUsers[index];

  if (email && mockUsers.some(u => u.email === email && u.id !== account.id)) {
    return res.status(409).json({ message: "That email is already registered." });
  }
  if (role && !ROLES.includes(role)) {
    return res.status(400).json({ message: "Role must be student, instructor or admin." });
  }
  // Demoting the last administrator would strand the app with nobody able to
  // reach the back office.
  if (role && role !== account.role && account.role === "admin" && role !== "admin" && adminCount() <= 1) {
    return res.status(409).json({ message: "The last administrator cannot be demoted." });
  }

  mockUsers[index] = {
    ...account,
    ...(name && { name }),
    ...(email && { email }),
    ...(password && { password }),
    ...(role && { role }),
    ...(department && { department }),
    ...(course !== undefined && { course }),
    ...(section !== undefined && { section }),
    ...(year !== undefined && { year })
  };
  res.json({ user: safeUser(mockUsers[index]) });
});

app.delete('/api/admin/users/:id', authenticate, requireRole('admin'), (req, res) => {
  const index = mockUsers.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Account not found" });

  const [removed] = mockUsers.splice(index, 1);
  if (removed.role === "admin" && adminCount() === 0) {
    mockUsers.push(removed);
    return res.status(409).json({ message: "The last administrator cannot be deleted." });
  }

  // Hard delete: the academic record goes with the account.
  delete mockGrades[removed.id];
  delete mockSchedules[removed.id];
  res.json({ user: safeUser(removed) });
});

// ─── Grade rows (admin records grades) ────────────────────────────────────────
const gradeRow = (row) => ({
  code: row.code || "",
  description: row.description || "",
  units: Number(row.units) || 0,
  midterm: Number(row.midterm) || 0,
  finals: Number(row.finals) || 0,
  grade: Number(row.grade) || 0
});

app.post('/api/admin/users/:id/grades', authenticate, requireRole('admin'), (req, res) => {
  const account = mockUsers.find(u => u.id === parseInt(req.params.id));
  if (!account) return res.status(404).json({ message: "Account not found" });
  if (!req.body.code) return res.status(400).json({ message: "Course code is required." });

  const rows = (mockGrades[account.id] = mockGrades[account.id] || []);
  rows.push(gradeRow(req.body));
  res.status(201).json({ grades: rows, gpa: gpaOf(rows) });
});

app.put('/api/admin/users/:id/grades/:rowIndex', authenticate, requireRole('admin'), (req, res) => {
  const rows = mockGrades[parseInt(req.params.id)];
  const index = parseInt(req.params.rowIndex);
  if (!rows || !rows[index]) return res.status(404).json({ message: "Grade row not found" });
  if (!req.body.code) return res.status(400).json({ message: "Course code is required." });

  rows[index] = gradeRow(req.body);
  res.json({ grades: rows, gpa: gpaOf(rows) });
});

app.delete('/api/admin/users/:id/grades/:rowIndex', authenticate, requireRole('admin'), (req, res) => {
  const rows = mockGrades[parseInt(req.params.id)];
  const index = parseInt(req.params.rowIndex);
  if (!rows || !rows[index]) return res.status(404).json({ message: "Grade row not found" });

  rows.splice(index, 1);
  res.json({ grades: rows, gpa: gpaOf(rows) });
});

// ─── Schedule rows (admin manages schedules) ──────────────────────────────────
const scheduleRow = (row) => ({
  day: row.day || "",
  time: row.time || "",
  subject: row.subject || "",
  room: row.room || "",
  instructor: row.instructor || ""
});

app.post('/api/admin/users/:id/schedule', authenticate, requireRole('admin'), (req, res) => {
  const account = mockUsers.find(u => u.id === parseInt(req.params.id));
  if (!account) return res.status(404).json({ message: "Account not found" });
  if (!req.body.subject || !req.body.day) {
    return res.status(400).json({ message: "Day and subject are required." });
  }

  const rows = (mockSchedules[account.id] = mockSchedules[account.id] || []);
  rows.push(scheduleRow(req.body));
  res.status(201).json({ schedule: rows });
});

app.put('/api/admin/users/:id/schedule/:rowIndex', authenticate, requireRole('admin'), (req, res) => {
  const rows = mockSchedules[parseInt(req.params.id)];
  const index = parseInt(req.params.rowIndex);
  if (!rows || !rows[index]) return res.status(404).json({ message: "Schedule row not found" });
  if (!req.body.subject || !req.body.day) {
    return res.status(400).json({ message: "Day and subject are required." });
  }

  rows[index] = scheduleRow(req.body);
  res.json({ schedule: rows });
});

app.delete('/api/admin/users/:id/schedule/:rowIndex', authenticate, requireRole('admin'), (req, res) => {
  const rows = mockSchedules[parseInt(req.params.id)];
  const index = parseInt(req.params.rowIndex);
  if (!rows || !rows[index]) return res.status(404).json({ message: "Schedule row not found" });

  rows.splice(index, 1);
  res.json({ schedule: rows });
});

// ─── Grades ───────────────────────────────────────────────────────────────────
app.get('/api/grades', authenticate, (req, res) => {
  if (req.user.role === 'student') {
    return res.json({ scope: 'own', grades: mockGrades[req.user.id] || [] });
  }

  const roster = getRoster();
  const students = req.user.role === 'admin'
    ? roster
    : roster.filter(s => s.department === req.user.department);

  return res.json({
    scope: req.user.role === 'admin' ? 'all' : 'department',
    students: students.map(studentRecord)
  });
});

// ─── Schedule ─────────────────────────────────────────────────────────────────
app.get('/api/schedule', authenticate, (req, res) => {
  const roster = getRoster();
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
      roster
        .filter(s => s.department === req.user.department)
        .flatMap(asRows)
        .filter(r => r.instructor === req.user.name)
    );
  }

  return res.json(roster.flatMap(asRows));
});

// ─── Notifications ────────────────────────────────────────────────────────────
app.get('/api/notifications', authenticate, (req, res) => {
  res.json(mockNotifications);
});

// ─── Dashboard Summary ────────────────────────────────────────────────────────
app.get('/api/dashboard/summary', authenticate, (req, res) => {
  const unreadNotifications = mockNotifications.filter(n => !n.read).length;
  const recentEvents = mockEvents.filter(e => e.status === "published").slice(0, 2);
  const roster = getRoster();

  if (req.user.role === 'instructor') {
    const classes = roster
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
      recentEvents,
      pins: pinsForSummary()
    });
  }

  if (req.user.role === 'admin') {
    return res.json({
      role: 'admin',
      totalStudents: roster.length,
      totalFaculty: mockFaculty.length,
      totalEvents: mockEvents.length,
      unreadNotifications,
      recentEvents,
      faculty: mockFaculty.slice(0, 4),
      pins: pinsForSummary()
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
    recentEvents,
    pins: pinsForSummary()
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
