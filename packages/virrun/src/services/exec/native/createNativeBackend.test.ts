import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
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

  test("passes an argv array as discrete arguments so a token with spaces is not re-split", async () => {
    expect.hasAssertions();

    const { exec } = createNativeBackend();
    const { stdout } = await exec(["node", "-e", "process.stdout.write(process.argv[1] ?? '')", "hello world.txt"], {
      cwd: "",
      stdio: "pipe",
    });

    expect(stdout).toBe("hello world.txt");
  });
});
