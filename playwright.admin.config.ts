import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/admin",
  workers: 1,
  timeout: 30_000,
  use: { baseURL: "http://127.0.0.1:3101", browserName: "chromium", reducedMotion: "reduce", trace: "retain-on-failure" },
  webServer: [
    { command: "node tests/fixtures/supabase-server.mjs", url: "http://127.0.0.1:3111/health", reuseExistingServer: false },
    {
      command: "npm run dev -- --port 3101", url: "http://127.0.0.1:3101/admin", reuseExistingServer: false, timeout: 90_000,
      env: { PORTFOLIO_BUILD_DIR: ".next-admin-tests", NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:3111", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_local_test_only" },
    },
  ],
});
