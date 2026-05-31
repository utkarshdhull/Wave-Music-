export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        wave: {
          base: "#050505",
          panel: "#111111",
          muted: "#181818",
          accent: "rgb(var(--dynamic-color-r), var(--dynamic-color-g), var(--dynamic-color-b))"
        }
      }
    }
  },
  plugins: []
};
