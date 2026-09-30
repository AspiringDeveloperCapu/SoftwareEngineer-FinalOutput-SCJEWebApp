// Where the backend lives. The web build talks to localhost; the Android APK
// is built with VITE_API_URL pointing at the machine running the backend
// (e.g. http://192.168.1.5:4000) so a phone on the same network can reach it.
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
