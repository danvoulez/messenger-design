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
        // Core palette - warm dark with terracotta accent
        'bg-base': '#0f0f0f',
        'bg-elevated': '#161616',
        'bg-surface': '#1c1c1c',
        'bg-hover': '#242424',
        'bg-active': '#2a2a2a',
        
        // Text hierarchy
        'text-primary': '#f5f5f5',
        'text-secondary': '#a8a8a8',
        'text-tertiary': '#6b6b6b',
        'text-inverse': '#0f0f0f',
        
        // Accent - warm terracotta
        'accent': '#e07a5f',
        'accent-hover': '#c96a52',
        
        // Secondary accent - warm cream
        'cream': '#f4e4bc',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'SF Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
