# SCJE Web Application

This repository contains the prototype source code for the **SCJE/BSISM Student System** web application.

## Overview
- **Frontend**: React + TypeScript (Vite)
- **Backend**: Node.js + Express (TypeScript)
- **Database**: Mock JSON Data for Prototype
- **Authentication**: JWT Based

## Project Structure
```
scje-web-app/
├─ README.md
├─ frontend/                # React SPA
│   ├─ package.json
│   ├─ vite.config.ts
│   └─ src/
│       ├─ components/
│       └─ pages/
├─ backend/                 # Express API
│   ├─ package.json
│   └─ src/
│       ├─ index.js
│       └─ mockData.js
```

## Getting Started

### 1. Run the Backend API
The backend provides the mock data and handles login.
```bash
cd backend
npm install
npm start
```
*The backend will run on `http://localhost:4000`*

### 2. Run the Frontend App
Open a new terminal window for the frontend.
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173`*

### Prototype Login Credentials
The system comes with mock users for testing the roles:

- **Full Access (SCJE Department):**
  - Email: `student_scje@chcc.edu.ph`
  - Password: `password123`
- **View Only Access (Guest/Other):**
  - Email: `guest@chcc.edu.ph`
  - Password: `password123`
