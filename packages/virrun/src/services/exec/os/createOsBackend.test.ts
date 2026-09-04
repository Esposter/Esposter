import { checkIsOsBackendSupported } from "#src/services/exec/os/checkIsOsBackendSupported";
import { createOsBackend } from "#src/services/exec/os/createOsBackend";
import { ACCEPTANCE_TIMEOUT_MINUTES } from "#src/services/exec/test/constants.test";
import { TEST_DIR } from "#src/services/exec/util/constants.test";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(createOsBackend, () => {
  // Real bwrap sandbox execs (win32: over the wsl.exe bridge) contend for the one shared WSL bridge when the suite
  // Fans test files across 16 workers, so a ~1-3s exec can exceed vitest's 5s default. Same hang-ceiling the sibling
  // Acceptance/property os tests carry; the exec is not slow, the cross-file contention is.
  const acceptanceTimeoutMs = Temporal.Duration.from({ minutes: ACCEPTANCE_TIMEOUT_MINUTES }).total("milliseconds");

  // No-fallback contract: on an unsupported host, construction throws rather than running un-isolated.
  test.skipIf(checkIsOsBackendSupported())("throws on an unsupported host instead of falling back", () => {
    expect.hasAssertions();
    expect(() => createOsBackend()).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, createOsBackend.name, "requires Linux/WSL + bubblewrap").message}]`,
    );
  });

  test.skipIf(!checkIsOsBackendSupported())(
    "captures stdout and a zero exit code",
    async () => {
      expect.hasAssertions();

      const { exec } = createOsBackend();
      const { exitCode, stdout } = await exec(`echo ok`, { cwd: "", stdio: "pipe" });

      expect(exitCode).toBe(0);
      expect(stdout).toBe("ok\n");
    },
    acceptanceTimeoutMs,
  );

  test.skipIf(!checkIsOsBackendSupported())(
    "propagates a non-zero exit code as a result, not a throw",
    async () => {
      expect.hasAssertions();

      const { exec } = createOsBackend();
      const { exitCode } = await exec(`exit 3`, { cwd: "", stdio: "pipe" });

      expect(exitCode).toBe(3);
    },
    acceptanceTimeoutMs,
  );

  // A command that exits non-zero is a result; a sandbox that can't even start is an error. A
  // Non-existent bind source fails the mount before the command runs, so no child exit-code is
  // Reported and the backend must reject rather than invent a result. The reject message carries the
  // Base sentinel plus bwrap's own (host-/version-specific) diagnostic appended, so match the stable
  // Sentinel as a substring — the exact stderr-surfacing contract is pinned in createBwrapBackend.test.ts.
  test.skipIf(!checkIsOsBackendSupported())(
    "rejects with a sandbox error when bubblewrap fails to set up",
    async () => {
      expect.hasAssertions();

      const { exec } = createOsBackend();

      const message = (
        await getResultAsync(() => exec(`echo hi`, { bindDirs: [TEST_DIR], cwd: "", stdio: "pipe" }))
      ).match(
        () => "",
        (error) => error.message,
      );

      expect(message).toContain(
        new InvalidOperationError(Operation.Create, createOsBackend.name, "bubblewrap failed to set up the sandbox")
          .message,
      );
    },
    acceptanceTimeoutMs,
  );
});
