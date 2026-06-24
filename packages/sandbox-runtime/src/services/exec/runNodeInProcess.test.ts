import { runNodeInProcess } from "@/services/exec/runNodeInProcess";
import { realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { describe, expect, test } from "vitest";

describe(runNodeInProcess, () => {
  test("captures stdout and a zero exit code", () => {
    expect.hasAssertions();

    const result = runNodeInProcess({ code: "process.stdout.write(' ')" }, { cwd: "", stdio: "pipe" });

    expect(result).toStrictEqual({ exitCode: 0, stderr: "", stdout: " " });
  });

  test("captures stderr and a zero exit code", () => {
    expect.hasAssertions();

    const result = runNodeInProcess({ code: "process.stderr.write(' ')" }, { cwd: "", stdio: "pipe" });

    expect(result).toStrictEqual({ exitCode: 0, stderr: " ", stdout: "" });
  });

  test("picks up an explicit process.exitCode without a process.exit call", () => {
    expect.hasAssertions();

    const result = runNodeInProcess({ code: "process.exitCode = 5" }, { cwd: "", stdio: "pipe" });

    expect(result).toStrictEqual({ exitCode: 5, stderr: "", stdout: "" });
  });

  test("changes the working directory when cwd is provided", () => {
    expect.hasAssertions();

    const cwd = tmpdir();
    const result = runNodeInProcess({ code: "process.stdout.write(process.cwd())" }, { cwd, stdio: "pipe" });

    expect(result?.stdout).toBe(realpathSync(cwd));
  });

  test("propagates the code passed to process.exit", () => {
    expect.hasAssertions();

    const result = runNodeInProcess({ code: "process.exit(3)" }, { cwd: "", stdio: "pipe" });

    expect(result).toStrictEqual({ exitCode: 3, stderr: "", stdout: "" });
  });

  test("falls back (undefined) on an uncaught error so native emits the canonical stderr", () => {
    expect.hasAssertions();

    expect(runNodeInProcess({ code: "throw new Error('')" }, { cwd: "", stdio: "pipe" })).toBeUndefined();
  });

  test("exposes require to the in-process code", () => {
    expect.hasAssertions();

    const result = runNodeInProcess(
      { code: "process.stdout.write(require('node:path').sep)" },
      { cwd: "", stdio: "pipe" },
    );

    expect(result?.exitCode).toBe(0);
  });

  test("falls back (undefined) on a syntax error", () => {
    expect.hasAssertions();

    expect(runNodeInProcess({ code: "process.exit(" }, { cwd: "", stdio: "pipe" })).toBeUndefined();
  });

  test("falls back (undefined) on an async result it will not await", () => {
    expect.hasAssertions();

    expect(runNodeInProcess({ code: "Promise.resolve()" }, { cwd: "", stdio: "pipe" })).toBeUndefined();
  });

  test("does not capture stdout when streaming live (inherit)", () => {
    expect.hasAssertions();

    const result = runNodeInProcess({ code: "process.exit(0)" }, { cwd: "", stdio: "inherit" });

    expect(result).toStrictEqual({ exitCode: 0, stderr: "", stdout: "" });
  });
});
