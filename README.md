# SCJE / BSISM Student System (Web App)

This repository contains the web-based version of the SCJE/BSISM Student System, migrated from the original Flutter application design. It serves Admin/Staff, Instructors, and Students.

## Features & Implementation

Based on the original system requirements, this web app implements:

*   **First-Time Login Registration**: Intercepts new users and securely collects their Picture, Full Name, Birthday, Course/Section, and Gender before allowing access.
*   **Role-Based Access Control**:
    *   **SCJE / ISM Students (Crim)**: Full access to the Main Dashboard, Schedules, Grades, and Instructors.
    *   **Non-Department Students**: Restricted to a "View-Only" mode where they can only see Upcoming/Recent Events.
*   **Dynamic Dashboard**:
    *   **Drawer**: Displays exact user info (Picture, Name, Birthday).
    *   **Body**: Features a pinned Hero section, News/Announcements, and shortcuts.
*   **Administration Navbar**: A dedicated Navigation Bar menu that displays Faculty Members and Officers when clicked.
*   **Flutter-Inspired Theme**: Matches the original `scje_system` mobile app styling (Navy, Crimson, Gold, Material 3 borders).

## Project Structure
```text
scje-web-app/
├─ architecture.md          # Detailed system architecture and logic rules
├─ frontend/                # React SPA (Vite + TypeScript)
│   └─ src/
│       ├─ components/      # Drawer.tsx, Navbar.tsx
│       └─ pages/           # Login.tsx, Dashboard.tsx, RegisterProfile.tsx, Events.tsx
├─ backend/                 # Express API
│   └─ src/
│       ├─ index.js         # API Routes (Auth, Events, Faculty)
│       └─ mockData.js      # Mock MIS Office Data
```

## Getting Started

You will need two terminal windows to run this full-stack application locally.

### 1. Run the Backend API
The backend provides the mock MIS data and handles JWT authentication.
```bash
cd backend
npm install
npm start
```
*Runs on `http://localhost:4000`*

### 2. Run the Frontend App
```bash
cd frontend
npm install
npm run dev
```
*Runs on `http://localhost:5173`*

---

## 🧪 Demo Login Credentials

Use the following credentials in the login screen (password for all is `password123`). They are designed to test the specific routing logic of the system:

1. **First-Time Criminology Student (Full Access + Registration Test)**
   - **Email:** `crim@chcc.edu.ph`
   - *Behavior:* Triggers the First-Time Registration screen, then grants full dashboard access.
   
2. **Standard ISM Student (Full Access)**
   - **Email:** `ism@chcc.edu.ph`
   - *Behavior:* Bypasses registration and goes straight to the full dashboard.

3. **Guest / Other Department (View-Only Test)**
   - **Email:** `guest@chcc.edu.ph`
   - *Behavior:* Locked out of the dashboard; can only view the Events & Announcements page.
