import { createNativeBackend } from "@/services/exec/createNativeBackend";
import { createOsBackend } from "@/services/exec/createOsBackend";
import { isOsBackendSupported } from "@/services/exec/isOsBackendSupported";
import { existsSync, mkdtempSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// Compares the observable command result (exit code + stdout + stderr) against native — not host disk
// Side-effects, since the os backend intentionally hides writes from the host. The isolation contract
// Is asserted separately below. See features/sandbox-runtime/specs/correctness.md.
describe.skipIf(!isOsBackendSupported())(createOsBackend, () => {
  const native = createNativeBackend();
  const COMMANDS = [`echo hello`, `printf 'a\\nb'`, `pwd`, `cat /etc/hostname`, `false`, `sh -c 'exit 7'`];

  test.each(COMMANDS)("matches the native backend for %j", async (command) => {
    expect.hasAssertions();

    const os = createOsBackend();
    const nativeResult = await native.exec(command, { cwd: "", stdio: "pipe" });
    const osResult = await os.exec(command, { cwd: "", stdio: "pipe" });

    expect(osResult).toStrictEqual(nativeResult);
  });

  test("a write inside the sandbox never touches the host disk", async () => {
    expect.hasAssertions();

    const dir = realpathSync(mkdtempSync(join(tmpdir(), "os-wall-")));
    const os = createOsBackend();

    const writeResult = await os.exec("echo x > sentinel.txt", { cwd: dir, stdio: "pipe" });

    expect(writeResult.exitCode).toBe(0);
    expect(existsSync(join(dir, "sentinel.txt"))).toBe(false);

    // A fresh exec gets a fresh RAM upper, so the previous run's write is gone there too.
    const readResult = await os.exec("cat sentinel.txt", { cwd: dir, stdio: "pipe" });

    expect(readResult.exitCode).not.toBe(0);
  });
});
