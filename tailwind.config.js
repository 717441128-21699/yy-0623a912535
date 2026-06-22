/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: {
          purple: "#A78BFA",
          pink: "#F472B6",
          "gradient-start": "#A78BFA",
          "gradient-end": "#F472B6",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)',
      },
      fontFamily: {
        sans: ['PingFang SC', 'Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(167, 139, 250, 0.12)',
      },
    },
  },
  plugins: [],
};
