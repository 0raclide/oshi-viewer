import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Dark theme colors
        dark: {
          bg: '#1a1a1a',
          surface: '#242424',
          border: '#333333',
          hover: '#2a2a2a',
        },
        accent: {
          blue: '#3b82f6',
          'blue-hover': '#2563eb',
        }
      },
      fontFamily: {
        japanese: ['Noto Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
