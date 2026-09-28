import React, { useState } from "react";
import { getTheme, setTheme, Theme } from "../theme";

export default function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>(getTheme);
  const next: Theme = theme === "dark" ? "light" : "dark";

  const toggle = () => {
    setThemeState(next);
    setTheme(next);
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
