/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "section-bg-color": "var(--tg-theme-section-bg-color)",
        "defi-bg-base": "#0f172a",
        "defi-card-bg": "#1e293b",
        "defi-accent-blue": "#3b82f6",
        "defi-accent-purple": "#8b5cf6",
        "defi-text-muted": "#94a3b8",
        // New Crypto/Tech Palette
        "crypto-bg": "#0b0e14",         // Deepest dark (Main background)
        "crypto-card": "#151a25",       // Slightly lighter (Card background)
        "crypto-cyan": "#00f3ff",       // Electric Cyan (Primary Accent)
        "crypto-purple": "#bc13fe",     // Neon Purple (Secondary Accent)
        "crypto-text": "#e2e8f0",       // High contrast text
        "crypto-muted": "#64748b",      // Muted text
      },
    },
  },
  plugins: [],
};
