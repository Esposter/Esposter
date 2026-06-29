import { createTemporaryDirectory } from "@/services/exec/test/createTemporaryDirectory.test";
import { runNodeInProcess } from "@/services/exec/vfs/runNodeInProcess";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(runNodeInProcess, () => {
  const dir = createTemporaryDirectory();
  const writeScript = (name: string, source: string) => {
    const file = join(dir, name);
    writeFileSync(file, source);
    return file;
  };

  test("captures stdout and a zero exit code", () => {
    expect.hasAssertions();

    const result = runNodeInProcess({ code: "process.stdout.write(' ')", file: "" }, { cwd: "", stdio: "pipe" });

    expect(result).toStrictEqual({ exitCode: 0, stderr: "", stdout: " " });
  });

  test("captures stderr and a zero exit code", () => {
    expect.hasAssertions();

    const result = runNodeInProcess({ code: "process.stderr.write(' ')", file: "" }, { cwd: "", stdio: "pipe" });

    expect(result).toStrictEqual({ exitCode: 0, stderr: " ", stdout: "" });
  });

  test("picks up an explicit process.exitCode without a process.exit call", () => {
    expect.hasAssertions();

    const result = runNodeInProcess({ code: "process.exitCode = 5", file: "" }, { cwd: "", stdio: "pipe" });

    expect(result).toStrictEqual({ exitCode: 5, stderr: "", stdout: "" });
  });

  test("changes the working directory when cwd is provided", () => {
    expect.hasAssertions();

    const result = runNodeInProcess(
      { code: "process.stdout.write(process.cwd())", file: "" },
      { cwd: dir, stdio: "pipe" },
    );

    expect(result?.stdout).toBe(dir);
  });

  test("propagates the code passed to process.exit", () => {
    expect.hasAssertions();

    const result = runNodeInProcess({ code: "process.exit(3)", file: "" }, { cwd: "", stdio: "pipe" });

    expect(result).toStrictEqual({ exitCode: 3, stderr: "", stdout: "" });
  });

  test("falls back (undefined) on an uncaught error so native emits the canonical stderr", () => {
    expect.hasAssertions();

    expect(runNodeInProcess({ code: "throw new Error('')", file: "" }, { cwd: "", stdio: "pipe" })).toBeUndefined();
  });

  test("exposes require to the in-process code", () => {
    expect.hasAssertions();

    const result = runNodeInProcess(
      { code: "process.stdout.write(require('node:path').sep)", file: "" },
      { cwd: "", stdio: "pipe" },
    );

    expect(result?.exitCode).toBe(0);
  });

  test("falls back (undefined) on a syntax error", () => {
    expect.hasAssertions();

    expect(runNodeInProcess({ code: "process.exit(", file: "" }, { cwd: "", stdio: "pipe" })).toBeUndefined();
  });

  test("falls back (undefined) on an async result it will not await", () => {
    expect.hasAssertions();

    expect(runNodeInProcess({ code: "Promise.resolve()", file: "" }, { cwd: "", stdio: "pipe" })).toBeUndefined();
  });

  test("does not capture stdout when streaming live (inherit)", () => {
    expect.hasAssertions();

    const result = runNodeInProcess({ code: "process.exit(0)", file: "" }, { cwd: "", stdio: "inherit" });

    expect(result).toStrictEqual({ exitCode: 0, stderr: "", stdout: "" });
  });

  test("runs a file and captures its stdout", () => {
    expect.hasAssertions();

    const file = writeScript("stdout.cjs", "process.stdout.write(' ')");
    const result = runNodeInProcess({ code: "", file }, { cwd: "", stdio: "pipe" });

    expect(result).toStrictEqual({ exitCode: 0, stderr: "", stdout: " " });
  });

  test("propagates process.exit from a file run", () => {
    expect.hasAssertions();

    const file = writeScript("exit.cjs", "process.exit(3)");
    const result = runNodeInProcess({ code: "", file }, { cwd: "", stdio: "pipe" });

    expect(result).toStrictEqual({ exitCode: 3, stderr: "", stdout: "" });
  });

  test("re-executes a file on each run (require cache is cleared)", () => {
    expect.hasAssertions();

    const file = writeScript("twice.cjs", "process.stdout.write(' ')");
    runNodeInProcess({ code: "", file }, { cwd: "", stdio: "pipe" });
    const result = runNodeInProcess({ code: "", file }, { cwd: "", stdio: "pipe" });

    expect(result).toStrictEqual({ exitCode: 0, stderr: "", stdout: " " });
  });

  test("falls back (undefined) for a missing file so native emits the canonical error", () => {
    expect.hasAssertions();

    expect(runNodeInProcess({ code: "", file: join(dir, "missing.cjs") }, { cwd: "", stdio: "pipe" })).toBeUndefined();
  });
});
