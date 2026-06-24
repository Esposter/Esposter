import { createNativeBackend } from "@/services/exec/createNativeBackend";
import { createOsBackend } from "@/services/exec/createOsBackend";
import { existsSync, mkdtempSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// The correctness gate for the os backend. It runs only on Linux (bubblewrap is Linux-only); the
// Suite skips cleanly elsewhere. The differential compares the OBSERVABLE command result (exit code +
// Stdout + stderr) against native — not host disk side-effects, because the os backend intentionally
// Hides writes from the host, so a disk diff would correctly differ. The isolation contract is
// Asserted separately by the wall-broken test below. See features/sandbox-runtime/specs/correctness.md.
describe.skipIf(process.platform !== "linux")(createOsBackend, () => {
  const native = createNativeBackend();
  const os = createOsBackend();
  const COMMANDS = [`echo hello`, `printf 'a\\nb'`, `pwd`, `cat /etc/hostname`, `false`, `sh -c 'exit 7'`];

  test.each(COMMANDS)("matches the native backend for %j", async (command) => {
    expect.hasAssertions();

    const nativeResult = await native.exec(command, { cwd: "", stdio: "pipe" });
    const osResult = await os.exec(command, { cwd: "", stdio: "pipe" });

    expect(osResult).toStrictEqual(nativeResult);
  });

  // The reason the os backend exists: the wall is broken. A write inside the sandbox lands in the RAM
  // Tmpfs upper, invisible to the host — so the sentinel never appears on the real working dir. And
  // Because each exec gets a fresh tmp-overlay, a second run can't see the first's write either: the
  // Upper is ephemeral per-run, which is the expected Step A behaviour.
  test("a write inside the sandbox never touches the host disk", async () => {
    expect.hasAssertions();

    const dir = realpathSync(mkdtempSync(join(tmpdir(), "os-wall-")));
    const os = createOsBackend();

    const writeResult = await os.exec("echo x > sentinel.txt", { cwd: dir, stdio: "pipe" });

    expect(writeResult.exitCode).toBe(0);
    expect(existsSync(join(dir, "sentinel.txt"))).toBe(false);

    // A fresh exec gets a fresh RAM upper, so the previous run's file is gone there too (non-zero exit).
    const readResult = await os.exec("cat sentinel.txt", { cwd: dir, stdio: "pipe" });

    expect(readResult.exitCode).not.toBe(0);
  });
});
