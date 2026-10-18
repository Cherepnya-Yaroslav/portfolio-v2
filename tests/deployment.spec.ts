import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { expect, test } from "@playwright/test";

const revision = "a".repeat(40);

function deploy(scenario: string, command = `deploy ${revision}`) {
  const directory = mkdtempSync(join(tmpdir(), "portfolio-deployment-"));
  const app = join(directory, "app");
  const state = join(directory, "state");
  const bin = join(directory, "bin");
  const fixture = join(directory, "fixture");
  const trace = join(directory, "docker.log");
  for (const path of [app, bin, join(fixture, "deploy")]) mkdirSync(path, { recursive: true });
  writeFileSync(join(app, "version"), "previous");
  writeFileSync(join(app, ".env.local"), "preserved-value");
  writeFileSync(join(fixture, "version"), "candidate");
  writeFileSync(join(fixture, "compose.yaml"), "services: {}\n");
  writeFileSync(join(fixture, "deploy", "healthcheck.mjs"), "// health probe\n");
  const archive = join(directory, "release.tar");
  const packed = spawnSync("tar", ["-cf", archive, "-C", fixture, "."]);
  if (packed.status !== 0) throw new Error("Could not prepare deployment fixture");

  const scripts: Record<string, string> = {
    flock: "exit 0",
    timeout: "shift; exec \"$@\"",
    df: `echo 'Filesystem 1024-blocks Used Available Capacity Mounted on'
      if [ "$TEST_SCENARIO" = low-disk ]; then
        echo 'test 8000000 7000000 1000000 88% /'
      else
        echo 'test 8000000 3000000 5000000 38% /'
      fi`,
    git: `case "$*" in
      *rev-parse*) echo "$TEST_REVISION" ;;
      *archive*) cat "$TEST_ARCHIVE" ;;
      *) exit 0 ;;
    esac`,
    docker: `echo "$*" >> "$TEST_TRACE"
      case "$*" in
        *" build app") [ "$TEST_SCENARIO" != build ] && [ "$TEST_SCENARIO" != low-disk ] ;;
        "exec -i "*) cat >/dev/null; [ "$TEST_SCENARIO" != candidate ] ;;
        *" ps -q app") echo previous-container ;;
        "inspect "*) echo sha256:previous ;;
        *" up -d "*)
          if [ "$TEST_SCENARIO" = promote ] && [ ! -f "$TEST_STATE/promoted" ]; then
            touch "$TEST_STATE/promoted"; exit 1
          fi ;;
        *) exit 0 ;;
      esac`,
  };
  for (const [name, body] of Object.entries(scripts)) {
    writeFileSync(join(bin, name), `#!/bin/sh\n${body}\n`, { mode: 0o755 });
  }
  const source = readFileSync("deploy/deploy-vps.sh", "utf8")
    .replace("/opt/yaroslav-portfolio", app)
    .replace("/var/lib/yaroslav-portfolio-deploy", state)
    .replace("/run/lock/yaroslav-portfolio-deploy.lock", join(directory, "lock"));
  const script = join(directory, "deploy.sh");
  writeFileSync(script, source);
  const result = spawnSync("bash", [script], {
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      SSH_ORIGINAL_COMMAND: command,
      TEST_SCENARIO: scenario,
      TEST_REVISION: revision,
      TEST_ARCHIVE: archive,
      TEST_TRACE: trace,
      TEST_STATE: state,
    },
  });
  return { directory, app, trace, result };
}

test("deployment SSH entry rejects arbitrary commands", () => {
  const run = deploy("", "deploy a; whoami");
  try {
    expect(run.result.status).toBe(2);
    expect(run.result.stderr).toContain("Expected: deploy");
    expect(readFileSync(join(run.app, "version"), "utf8")).toBe("previous");
  } finally { rmSync(run.directory, { recursive: true, force: true }); }
});

test("low disk triggers cache cleanup before building and preserves the working site", () => {
  const run = deploy("low-disk");
  try {
    expect(run.result.status).not.toBe(0);
    const trace = readFileSync(run.trace, "utf8");
    expect(trace.indexOf("buildx prune --all --force")).toBeGreaterThanOrEqual(0);
    expect(trace.indexOf("buildx prune --all --force")).toBeLessThan(trace.indexOf("build app"));
    expect(readFileSync(join(run.app, "version"), "utf8")).toBe("previous");
  } finally { rmSync(run.directory, { recursive: true, force: true }); }
});

for (const scenario of ["build", "candidate", "promote"]) {
  test(`${scenario} failure preserves the working release and environment`, () => {
    const run = deploy(scenario);
    try {
      expect(run.result.status, run.result.stderr).not.toBe(0);
      expect(readFileSync(join(run.app, "version"), "utf8")).toBe("previous");
      expect(readFileSync(join(run.app, ".env.local"), "utf8")).toBe("preserved-value");
      if (scenario === "promote") {
        expect(run.result.stderr).toContain("restoring the previous application");
        expect(readFileSync(run.trace, "utf8").match(/up -d --wait/g)).toHaveLength(2);
      }
    } finally { rmSync(run.directory, { recursive: true, force: true }); }
  });
}
