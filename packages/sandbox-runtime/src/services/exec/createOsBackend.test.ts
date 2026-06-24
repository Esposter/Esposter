import { createOsBackend } from "@/services/exec/createOsBackend";
import { isOsBackendSupported } from "@/services/exec/isOsBackendSupported";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(createOsBackend, () => {
  // No-fallback contract: on an unsupported host, construction throws rather than running un-isolated.
  test.skipIf(isOsBackendSupported())("throws on an unsupported host instead of falling back", () => {
    expect.hasAssertions();
    expect(() => createOsBackend()).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, createOsBackend.name, "requires Linux + bubblewrap").message}]`,
    );
  });

  test.skipIf(!isOsBackendSupported())("captures stdout and a zero exit code", async () => {
    expect.hasAssertions();

    const { exec } = createOsBackend();
    const { exitCode, stdout } = await exec(`echo ok`, { cwd: "", stdio: "pipe" });

    expect(exitCode).toBe(0);
    expect(stdout).toBe("ok\n");
  });

  test.skipIf(!isOsBackendSupported())("propagates a non-zero exit code", async () => {
    expect.hasAssertions();

    const { exec } = createOsBackend();
    const { exitCode } = await exec(`exit 3`, { cwd: "", stdio: "pipe" });

    expect(exitCode).toBe(3);
  });
});
