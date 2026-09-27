const mockUsers = [
  {
    id: 1,
    email: "student_scje@chcc.edu.ph",
    password: "password123", // In a real app, use bcrypt to hash!
    name: "Juan Dela Cruz",
    department: "SCJE",
    course: "BS Criminology",
    role: "student",
    viewOnly: false
  },
  {
    id: 2,
    email: "student_ism@chcc.edu.ph",
    password: "password123",
    name: "Maria Santos",
    department: "ISM",
    course: "BS Information Systems",
    role: "student",
    viewOnly: false
  },
  {
    id: 3,
    email: "guest@chcc.edu.ph",
    password: "password123",
    name: "Guest Student",
    department: "Other",
    course: "BS Accountancy",
    role: "student",
    viewOnly: true // Only allowed to view events
  }
];

const mockEvents = [
  {
    id: 1,
    title: "Criminology Seminar 2026",
    date: "2026-10-15",
    description: "Annual seminar featuring top law enforcement officers."
  },
  {
    id: 2,
    title: "Intramurals 2026",
    date: "2026-11-01",
    description: "College wide sports festival. Go SCJE!"
  },
  {
    id: 3,
    title: "ISM Tech Week",
    date: "2026-12-05",
    description: "Showcase of IT projects and coding competitions."
  }
];

module.exports = { mockUsers, mockEvents };
