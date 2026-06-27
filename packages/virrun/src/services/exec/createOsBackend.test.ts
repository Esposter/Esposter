import { TEST_DIR } from "@/services/exec/constants.test";
import { createOsBackend } from "@/services/exec/createOsBackend";
import { isOsBackendSupported } from "@/services/exec/isOsBackendSupported";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(createOsBackend, () => {
  // No-fallback contract: on an unsupported host, construction throws rather than running un-isolated.
  test.skipIf(isOsBackendSupported())("throws on an unsupported host instead of falling back", () => {
    expect.hasAssertions();
    expect(() => createOsBackend()).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, createOsBackend.name, "requires Linux/WSL + bubblewrap").message}]`,
    );
  });

  test.skipIf(!isOsBackendSupported())("captures stdout and a zero exit code", async () => {
    expect.hasAssertions();

    const { exec } = createOsBackend();
    const { exitCode, stdout } = await exec(`echo ok`, { cwd: "", stdio: "pipe" });

    expect(exitCode).toBe(0);
    expect(stdout).toBe("ok\n");
  });

  test.skipIf(!isOsBackendSupported())("propagates a non-zero exit code as a result, not a throw", async () => {
    expect.hasAssertions();

    const { exec } = createOsBackend();
    const { exitCode } = await exec(`exit 3`, { cwd: "", stdio: "pipe" });

    expect(exitCode).toBe(3);
  });

  // A command that exits non-zero is a result; a sandbox that can't even start is an error. A
  // Non-existent bind source fails the mount before the command runs, so no child exit-code is
  // Reported and the backend must reject rather than invent a result.
  test.skipIf(!isOsBackendSupported())("rejects with a sandbox error when bubblewrap fails to set up", async () => {
    expect.hasAssertions();

    const { exec } = createOsBackend();

    await expect(
      exec(`echo hi`, { bindDirs: [TEST_DIR], cwd: "", stdio: "pipe" }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, createOsBackend.name, "bubblewrap failed to set up the sandbox").message}]`,
    );
  });
});
