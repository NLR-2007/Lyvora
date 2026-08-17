/** @type {import('tailwindcss').Config} */

/* Colours are declared with the <alpha-value> placeholder so opacity
   modifiers (bg-background/70, text-muted-foreground/80) resolve correctly.
   Without it Tailwind emits a bare hsl() and silently drops the opacity. */
const token = (name) => `hsl(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: token("background"),
        foreground: token("foreground"),
        card: {
          DEFAULT: token("card"),
          foreground: token("card-foreground"),
        },
        primary: {
          DEFAULT: token("primary"),
          foreground: token("primary-foreground"),
        },
        secondary: {
          DEFAULT: token("secondary"),
          foreground: token("secondary-foreground"),
        },
        muted: {
          DEFAULT: token("muted"),
          foreground: token("muted-foreground"),
        },
        accent: {
          DEFAULT: token("accent-hsl"),
          foreground: token("accent-foreground"),
        },
        border: token("border"),
        ring: token("ring"),
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        dashboard: "var(--shadow-dashboard)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
