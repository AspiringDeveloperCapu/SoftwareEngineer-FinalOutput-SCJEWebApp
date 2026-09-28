const mockUsers = [
  {
    id: 1,
    email: "crim@chcc.edu.ph",
    password: "password123",
    name: "Juan Dela Cruz",
    department: "SCJE",
    course: "BS Criminology",
    section: "1A",
    role: "student",
    isFirstTimeLogin: true,
    viewOnly: false,
    picture: "",
    birthday: "",
    gender: ""
  },
  {
    id: 2,
    email: "ism@chcc.edu.ph",
    password: "password123",
    name: "Maria Santos",
    department: "ISM",
    course: "BS Information Systems",
    section: "2B",
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
    section: "3A",
    role: "student",
    isFirstTimeLogin: false,
    viewOnly: true
  },
  {
    id: 4,
    email: "instructor@chcc.edu.ph",
    password: "password123",
    name: "Prof. Reyes",
    department: "SCJE",
    course: "",
    section: "",
    role: "instructor",
    isFirstTimeLogin: false,
    picture: "https://i.pravatar.cc/150?img=12",
    birthday: "1985-03-20",
    gender: "Male",
    viewOnly: false
  },
  {
    id: 5,
    email: "admin@chcc.edu.ph",
    password: "password123",
    name: "Admin Staff",
    department: "SCJE",
    course: "",
    section: "",
    role: "admin",
    isFirstTimeLogin: false,
    picture: "https://i.pravatar.cc/150?img=8",
    birthday: "1980-01-10",
    gender: "Male",
    viewOnly: false
  }
];

const mockEvents = [
  {
    id: 1,
    title: "Criminology Seminar 2026",
    date: "2026-10-15",
    description: "Annual seminar featuring top law enforcement officers and forensic experts. All Criminology students are required to attend.",
    location: "Main Auditorium",
    type: "seminar"
  },
  {
    id: 2,
    title: "Intramurals 2026",
    date: "2026-11-01",
    description: "College-wide sports festival. Sign up with your section representative. Go SCJE!",
    location: "Gymnasium & Field",
    type: "sports"
  },
  {
    id: 3,
    title: "ISM Tech Week",
    date: "2026-12-05",
    description: "Showcase of IT projects and coding competitions. Open to all departments.",
    location: "ISM Building",
    type: "academic"
  },
  {
    id: 4,
    title: "Christmas Party 2026",
    date: "2026-12-20",
    description: "Annual SCJE Christmas celebration. Bring your best Christmas spirit!",
    location: "Covered Court",
    type: "social"
  }
];

const mockFaculty = [
  { id: 1, name: "Sir Arjay Yalung", position: "Instructor", department: "SCJE", specialization: "Criminal Law", email: "ayalung@chcc.edu.ph" },
  { id: 2, name: "Dr. Elena Reyes", position: "Dean", department: "SCJE", specialization: "Criminology", email: "ereyes@chcc.edu.ph" },
  { id: 3, name: "Prof. Mark Santos", position: "Instructor", department: "SCJE", specialization: "Forensic Science", email: "msantos@chcc.edu.ph" },
  { id: 4, name: "Prof. Ana Cruz", position: "Instructor", department: "ISM", specialization: "Database Systems", email: "acruz@chcc.edu.ph" },
  { id: 5, name: "Mr. John Smith", position: "IT Coordinator", department: "ISM", specialization: "Network Admin", email: "jsmith@chcc.edu.ph" }
];

const mockGrades = {
  1: [
    { code: "CRIM 101", description: "Introduction to Criminology", units: 3, midterm: 88, finals: 92, grade: 1.5 },
    { code: "CRIM 102", description: "Criminal Law (Book 1)", units: 3, midterm: 85, finals: 87, grade: 1.75 },
    { code: "CRIM 103", description: "Forensic Science", units: 3, midterm: 90, finals: 94, grade: 1.25 },
    { code: "GE 101", description: "Understanding the Self", units: 3, midterm: 82, finals: 80, grade: 2.0 },
    { code: "PE 1", description: "Physical Fitness", units: 2, midterm: 95, finals: 96, grade: 1.0 },
    { code: "NSTP 1", description: "National Service Training", units: 3, midterm: 88, finals: 90, grade: 1.5 }
  ],
  2: [
    { code: "IT 101", description: "Introduction to Computing", units: 3, midterm: 90, finals: 93, grade: 1.25 },
    { code: "IT 102", description: "Computer Programming 1", units: 3, midterm: 88, finals: 91, grade: 1.5 },
    { code: "IT 103", description: "Discrete Mathematics", units: 3, midterm: 78, finals: 82, grade: 2.25 },
    { code: "GE 101", description: "Understanding the Self", units: 3, midterm: 85, finals: 88, grade: 1.75 },
    { code: "PE 1", description: "Physical Fitness", units: 2, midterm: 92, finals: 94, grade: 1.25 }
  ]
};

const mockSchedules = {
  1: [
    { day: "Monday", time: "7:30 AM - 9:00 AM", subject: "CRIM 101", room: "Room 301", instructor: "Dr. Elena Reyes" },
    { day: "Monday", time: "9:30 AM - 11:00 AM", subject: "CRIM 102", room: "Room 302", instructor: "Sir Arjay Yalung" },
    { day: "Tuesday", time: "7:30 AM - 9:00 AM", subject: "CRIM 103", room: "Lab 1", instructor: "Prof. Mark Santos" },
    { day: "Tuesday", time: "9:30 AM - 11:00 AM", subject: "GE 101", room: "Room 201", instructor: "Prof. Ana Cruz" },
    { day: "Wednesday", time: "7:30 AM - 9:00 AM", subject: "CRIM 101", room: "Room 301", instructor: "Dr. Elena Reyes" },
    { day: "Wednesday", time: "1:00 PM - 2:30 PM", subject: "PE 1", room: "Gymnasium", instructor: "Coach Garcia" },
    { day: "Thursday", time: "7:30 AM - 9:00 AM", subject: "CRIM 102", room: "Room 302", instructor: "Sir Arjay Yalung" },
    { day: "Thursday", time: "9:30 AM - 11:00 AM", subject: "NSTP 1", room: "Covered Court", instructor: "Lt. Mendoza" },
    { day: "Friday", time: "7:30 AM - 9:00 AM", subject: "CRIM 103", room: "Lab 1", instructor: "Prof. Mark Santos" },
    { day: "Friday", time: "9:30 AM - 11:00 AM", subject: "GE 101", room: "Room 201", instructor: "Prof. Ana Cruz" }
  ],
  2: [
    { day: "Monday", time: "8:00 AM - 9:30 AM", subject: "IT 101", room: "CompLab 1", instructor: "Mr. John Smith" },
    { day: "Monday", time: "10:00 AM - 11:30 AM", subject: "IT 102", room: "CompLab 2", instructor: "Prof. Ana Cruz" },
    { day: "Tuesday", time: "8:00 AM - 9:30 AM", subject: "IT 103", room: "Room 401", instructor: "Prof. Lim" },
    { day: "Wednesday", time: "8:00 AM - 9:30 AM", subject: "IT 101", room: "CompLab 1", instructor: "Mr. John Smith" },
    { day: "Thursday", time: "8:00 AM - 9:30 AM", subject: "IT 102", room: "CompLab 2", instructor: "Prof. Ana Cruz" },
    { day: "Friday", time: "8:00 AM - 9:30 AM", subject: "GE 101", room: "Room 201", instructor: "Prof. Reyes" }
  ]
};

const mockNotifications = [
  { id: 1, title: "Final Exam Schedule Released", message: "Please check your schedule for the upcoming finals.", date: "2026-09-25", read: false },
  { id: 2, title: "Library Hours Extended", message: "Library is now open until 8PM during midterms week.", date: "2026-09-24", read: false },
  { id: 3, title: "New Lab Equipment", message: "Forensics lab has been updated with new equipment.", date: "2026-09-20", read: true }
];

module.exports = { mockUsers, mockEvents, mockFaculty, mockGrades, mockSchedules, mockNotifications };
