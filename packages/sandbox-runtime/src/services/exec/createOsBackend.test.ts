import { createOsBackend } from "@/services/exec/createOsBackend";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(createOsBackend, () => {
  // The no-fallback contract: on an unsupported host construction throws rather than running the
  // Command un-isolated. Windows-runnable assertion of that guard.
  test.skipIf(process.platform === "linux")("throws on an unsupported host instead of falling back", () => {
    expect.hasAssertions();
    expect(() => createOsBackend()).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Create, "os backend", "requires Linux + bubblewrap").message}]`,
    );
  });

  test.skipIf(process.platform !== "linux")("captures stdout and a zero exit code", async () => {
    expect.hasAssertions();

    const { exec } = createOsBackend();
    const { exitCode, stdout } = await exec(`echo ok`, { cwd: "", stdio: "pipe" });

    expect(exitCode).toBe(0);
    expect(stdout).toBe("ok\n");
  });

  test.skipIf(process.platform !== "linux")("propagates a non-zero exit code", async () => {
    expect.hasAssertions();

    const { exec } = createOsBackend();
    const { exitCode } = await exec(`exit 3`, { cwd: "", stdio: "pipe" });

    expect(exitCode).toBe(3);
  });
});
