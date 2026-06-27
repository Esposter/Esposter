import { createVfsBackend } from "@/services/exec/vfs/createVfsBackend";
import { describe, expect, test } from "vitest";

describe(createVfsBackend, () => {
  test("runs a recognised node invocation in-process", async () => {
    expect.hasAssertions();

    const { exec } = createVfsBackend();
    const result = await exec(`node -e "process.stdout.write(' ')"`, { cwd: "", stdio: "pipe" });

    expect(result).toStrictEqual({ exitCode: 0, stderr: "", stdout: " " });
  });

  test("falls back to native for a command it cannot run in-process", async () => {
    expect.hasAssertions();

    const { exec } = createVfsBackend();
    const { exitCode, stdout } = await exec(`node -p "1 + 1"`, { cwd: "", stdio: "pipe" });

    expect(exitCode).toBe(0);
    expect(stdout).toBe("2\n");
  });

  test("identifies itself as the vfs backend", () => {
    expect.hasAssertions();

    expect(createVfsBackend().name).toBe("vfs");
  });
});
