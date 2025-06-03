const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    specPattern: "tests/e2e/**/*.spec.js",
    baseUrl: "http://localhost:9000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
