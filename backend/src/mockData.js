const mockUsers = [
  {
    id: 1,
    email: "crim@chcc.edu.ph",
    password: "password123",
    name: "Juan Dela Cruz",
    department: "SCJE",
    course: "BS Criminology",
    role: "student",
    isFirstTimeLogin: true, // Will trigger registration flow
    viewOnly: false
  },
  {
    id: 2,
    email: "ism@chcc.edu.ph",
    password: "password123",
    name: "Maria Santos",
    department: "ISM",
    course: "BS Information Systems",
    role: "student",
    isFirstTimeLogin: false,
    picture: "https://i.pravatar.cc/150?img=5",
    birthday: "2002-05-14",
    gender: "Female",
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
    isFirstTimeLogin: false,
    viewOnly: true // Restricts to Events only
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
  }
];

const mockFaculty = [
  { id: 1, name: "Sir Arjay Yalung", position: "Instructor / Admin Staff", department: "SCJE" },
  { id: 2, name: "Dr. Jane Doe", position: "Dean", department: "SCJE" },
  { id: 3, name: "Mr. John Smith", position: "IT Coordinator", department: "ISM" }
];

module.exports = { mockUsers, mockEvents, mockFaculty };
