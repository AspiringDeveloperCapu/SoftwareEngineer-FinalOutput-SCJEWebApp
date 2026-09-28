import React from "react";
import { getSession } from "../access";
import StudentDashboard from "../dashboards/StudentDashboard";
import InstructorDashboard from "../dashboards/InstructorDashboard";
import AdminDashboard from "../dashboards/AdminDashboard";

/**
 * One route, three dashboards. The role decides which one renders, and a
 * session the hierarchy doesn't recognise (or no session at all) never renders
 * a dashboard - it goes back to the login screen.
 */
export default function Dashboard() {
  const session = getSession();

  if (!session) {
    window.location.href = "/";
    return null;
  }

  if (session.role === "admin") return <AdminDashboard />;
  if (session.role === "instructor") return <InstructorDashboard />;
  return <StudentDashboard />;
}
