import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: ["supabase-transport.spec.ts", "deployment.spec.ts", "video-loading.spec.ts"],
  workers: 1,
  timeout: 15_000,
});
