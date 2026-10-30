// Automatische tests: de app wordt geopend in een echte browser (Chromium) en bediend zoals een trainer dat doet.
// Lokaal: npm install && npx playwright install chromium && npm test
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "tests",
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    // Standaard een GSM; tests die een pc nodig hebben, stellen zelf een groter scherm in
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  },
  // Chrome (Android/pc) en Safari (iPhone): beide motoren testen, ze tonen soms verschillend
  projects: [
    { name: "chrome", use: { browserName: "chromium" } },
    { name: "safari", use: { browserName: "webkit" } },
  ],
  // Een kleine webserver, nodig voor o.a. het werken zonder internet (service worker)
  webServer: {
    command: "python3 -m http.server 4173 --bind 127.0.0.1",
    url: "http://127.0.0.1:4173/index.html",
    reuseExistingServer: !process.env.CI,
  },
});
