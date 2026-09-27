# Architecture Overview for SCJE Web Application

## 1. Project Background
This project is a migration of the **SCJE/BSISM Student System** from a planned Flutter mobile application to a modern, fully-featured web application.

## 2. Technology Stack
- **Frontend**: React, TypeScript, Vite, React Router. (Styled closely to the original Flutter app's Material 3 theme).
- **Backend**: Node.js, Express, jsonwebtoken (JWT).
- **Database**: Mock JSON (representing MIS Office data) designed to be easily swappable to PostgreSQL or MySQL in the future.

## 3. User Roles & Access Control
The system is built to accommodate three main types of users:
1. **Admin / Staff** (e.g., Sir Yalung, Deans)
2. **Instructors**
3. **Students**

### Routing & Department Logic
Access to features is strictly gated based on the user's department:
- **SCJE & ISM Students (e.g., Criminology):** Granted full access to the Main Dashboard, Instructors, Schedules, and Grades.
- **Out-of-Department / Guests:** Routed immediately to a restricted **View-Only Mode**. They are locked out of the dashboard and can only view Upcoming/Recent Events and Announcements.

## 4. System Workflows

### Authentication & First-Time Registration Flow
1. User enters Email and Password.
2. The system checks the database (MIS data).
3. **First-Time Login**: If the user is logging in for the first time, they are intercepted and forced to register their profile. The required fields are:
   - Picture
   - Full Name
   - Birthday
   - Course / Section
   - Gender
4. Once completed, the session is updated and they are routed based on their department.

## 5. UI Architecture

### Drawer (Sidebar)
The drawer dynamically renders based on the session data. It includes:
- **User Info**: Picture, Name, Birthday, and Course/Department.
- **Menu Items**: Dashboard, Instructors, Schedule, Achievement/Grades, Events/Announcement.

### Main Dashboard Body
- **Dashboard Hero**: Includes a "Pin option" for critical alerts or featured news.
- **News / Announcement Section**
- **Specific Feature Cards**: Quick access to Schedules, Grades, and Instructors.

### Navigation Bar
- Features the **"Administration"** dropdown. When clicked, it fetches and displays a list of current Faculty Members and Officers.

## 6. Future Extensibility
- **MIS API Integration**: The `mockData.js` file is abstracted so that it can be directly replaced by live `fetch` calls to the actual school MIS Office database.
