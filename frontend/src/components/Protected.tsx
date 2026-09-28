import React from "react";
import { Navigate } from "react-router-dom";
import { getSession, Role } from "../access";

/**
 * Route guard: no session goes back to the login screen, and a session without
 * the required role goes to its own dashboard - never to a page it can't use.
 * `getSession` already rejects any role the hierarchy doesn't recognise, so a
 * tampered or stale payload simply lands on the login screen.
 */
export default function Protected({
  roles,
  children
}: {
  roles: Role[];
  children: React.ReactElement;
}) {
  const session = getSession();
  if (!session) return <Navigate to="/" replace />;
  if (!roles.includes(session.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
