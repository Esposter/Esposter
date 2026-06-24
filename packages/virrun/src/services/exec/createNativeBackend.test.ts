import { createNativeBackend } from "@/services/exec/createNativeBackend";
import { describe, expect, test } from "vitest";

describe(createNativeBackend, () => {
  test("captures stdout and a zero exit code", async () => {
    expect.hasAssertions();

    const { exec } = createNativeBackend();
    const { exitCode, stdout } = await exec(`node -e "process.stdout.write('ok')"`, { cwd: "", stdio: "pipe" });

    expect(exitCode).toBe(0);
    expect(stdout).toBe("ok");
  });

  test("propagates a non-zero exit code", async () => {
    expect.hasAssertions();

    const { exec } = createNativeBackend();
    const { exitCode } = await exec(`node -e "process.exit(3)"`, { cwd: "", stdio: "pipe" });

    expect(exitCode).toBe(3);
  });
});
