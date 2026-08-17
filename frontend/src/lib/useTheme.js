import { useEffect, useState } from "react";

const STORAGE_KEY = "lyvora-theme";

/**
 * Theme lives on <html> so CSS owns every colour and no component needs to know
 * which one is active. index.html applies the stored value before first paint,
 * so a dark reload never flashes white.
 *
 * Shared rather than local to App, because the toggle has to be reachable on
 * the signed-out landing and auth pages too — not only inside the dashboard.
 */
export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // A blocked storage quota must not break the toggle itself.
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return [theme, toggleTheme];
};
