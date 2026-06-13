import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "school-primary": "#064e3b", // emerald-900
        "school-accent": "#f97316", // orange-500
        "school-success": "#10b981", // emerald-500
      },
    },
  },
  plugins: [],
};
export default config;
