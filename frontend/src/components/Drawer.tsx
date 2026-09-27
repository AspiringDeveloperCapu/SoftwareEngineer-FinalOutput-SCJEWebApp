import React from "react";
import { Link } from "react-router-dom";

export default function Drawer() {
  return (
    <aside className="drawer">
      <div className="user-info">
        <div className="avatar-placeholder"></div>
        <h2>Student Name</h2>
        <p>SCJE Department</p>
      </div>
      <nav className="menu">
        <ul>
          <li><Link to="/dashboard" style={{color: 'white', textDecoration: 'none'}}>Dashboard</Link></li>
          <li><Link to="/instructors" style={{color: 'white', textDecoration: 'none'}}>Instructors</Link></li>
          <li><Link to="/schedule" style={{color: 'white', textDecoration: 'none'}}>Schedule</Link></li>
          <li><Link to="/grades" style={{color: 'white', textDecoration: 'none'}}>Grades</Link></li>
          <li><Link to="/events" style={{color: 'white', textDecoration: 'none'}}>Events / Announcements</Link></li>
        </ul>
      </nav>
    </aside>
  );
}
