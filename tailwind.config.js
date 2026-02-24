/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,tsx,ts}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        Inter: ["Inter"],
      },
      colors: {
        // loading:"#34A853",
        loading: "#000000",
        error: "#DB3E3E",
        border: "#7A7575",
      },
    },
  },
  plugins: [],
};
