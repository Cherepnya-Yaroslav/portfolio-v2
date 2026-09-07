import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { setTimeout } from "node:timers/promises";

const container = `portfolio-db-test-${randomUUID().slice(0, 8)}`;
let started = false;
try {
  execFileSync("docker", ["run", "--detach", "--rm", "--network", "none", "--name", container, "--env", "POSTGRES_HOST_AUTH_METHOD=trust", "postgres:16-alpine"], { stdio: "pipe" });
  started = true;
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      execFileSync("docker", ["exec", container, "pg_isready", "-U", "postgres"], { stdio: "pipe" });
      ready = true; break;
    } catch { await setTimeout(200); }
  }
  if (!ready) throw new Error("Temporary PostgreSQL did not become ready.");
  const prelude = readFileSync(new URL("../tests/fixtures/supabase-schema.sql", import.meta.url), "utf8");
  const migration = readFileSync(new URL("../supabase/migrations/202609070001_portfolio_admin.sql", import.meta.url), "utf8");
  const checks = readFileSync(new URL("../tests/fixtures/database-checks.sql", import.meta.url), "utf8");
  const output = execFileSync("docker", ["exec", "-i", container, "psql", "-U", "postgres", "-v", "ON_ERROR_STOP=1", "-q"], {
    input: `${prelude}\n${migration}\n${migration}\n${checks}`, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"],
  });
  console.log(output.trim());
} catch (error) {
  console.error(error.stderr?.toString() || error.message);
  process.exitCode = 1;
} finally {
  if (started) execFileSync("docker", ["rm", "--force", container], { stdio: "pipe" });
}
