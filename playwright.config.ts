import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testIgnore: "**/admin/**",
  fullyParallel: true,
  workers: 2,
  use: { baseURL: "http://127.0.0.1:3100", browserName: "chromium", reducedMotion: "reduce", trace: "retain-on-failure" },
  webServer: { command: "npm run start -- --port 3100", url: "http://127.0.0.1:3100/ru", reuseExistingServer: !process.env.CI, timeout: 60_000 },
});
