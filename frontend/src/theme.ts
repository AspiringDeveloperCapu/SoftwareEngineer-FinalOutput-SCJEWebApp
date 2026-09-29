export type Theme = "light" | "dark";

const KEY = "theme";

/**
 * Explicit choice wins; otherwise follow the OS. Called before React renders so
 * the first paint is already the right theme - an app that flashes white before
 * going dark reads as a bug, not as a feature.
 */
export function getTheme(): Theme {
  const stored = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function initTheme(): void {
  document.documentElement.dataset.theme = getTheme();
}

/** Persists the choice, so it survives reloads and new tabs. */
export function setTheme(theme: Theme): void {
  // .theme-anim gives every surface a ~0.4s crossfade while the attribute
  // flips (see the rule in index.css), so the toggle doesn't flash the eyes.
  // Initial load (initTheme) stays instant - a transition there would only
  // delay the first paint.
  const root = document.documentElement;
  root.classList.add("theme-anim");
  localStorage.setItem(KEY, theme);
  root.dataset.theme = theme;
  window.setTimeout(() => root.classList.remove("theme-anim"), 450);
}
