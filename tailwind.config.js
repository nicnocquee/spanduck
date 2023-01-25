const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#5857d6",
          dark: "#5e5ce6",
        },
        "accent-hover": {
          DEFAULT: "#3635a4",
          dark: "#7d7aff",
        },
        primary: {
          DEFAULT: colors.gray[50],
          dark: colors.zinc[900],
        },
        card: {
          DEFAULT: colors.white,
          dark: colors.zinc[800],
        },
        input: {
          DEFAULT: colors.zinc[50],
          dark: colors.zinc[700],
        },
        "input-border": {
          DEFAULT: colors.zinc[300],
          dark: colors.zinc[600],
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
