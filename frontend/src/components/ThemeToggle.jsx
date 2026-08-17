import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../lib/useTheme";

/**
 * Standalone theme switch for the signed-out pages. The dashboard header has
 * its own instance styled as a .header-icon-btn; this one carries Tailwind
 * classes so it sits correctly in the landing/auth layouts.
 */
export default function ThemeToggle({ className = "" }) {
  const [theme, toggleTheme] = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border " +
        "bg-background text-foreground shadow-sm transition-colors hover:bg-muted " +
        className
      }
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
