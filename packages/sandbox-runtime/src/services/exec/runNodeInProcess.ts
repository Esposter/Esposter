import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";
import type { NodeInvocation } from "@/models/exec/NodeInvocation";

import { ExitSignalError } from "@/models/exec/ExitSignalError";
import { getResult, withFinalizer } from "@esposter/shared";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import process from "node:process";
import { runInThisContext } from "node:vm";
// Run inline node code in the current process so it shares the (vfs-patched, Step B2) module loader
// And core fs instead of spawning a child. Captures stdout/stderr/exit when stdio is "pipe" and
// Streams live for "inherit", matching the native backend. Returns undefined when the code can't be
// Run faithfully in-process — a compile error (e.g. top-level await), an uncaught error whose stderr
// We won't reproduce byte-for-byte, or an async result we won't wait on — so the caller falls back to
// Native and the observable result always matches baseline. Runs serially: it temporarily patches the
// Global process streams, exit, and require inside withFinalizer, restored whether the run throws or not.
export const runNodeInProcess = ({ code }: NodeInvocation, { cwd, stdio }: ExecOptions): ExecResult | undefined => {
  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  const originalStderrWrite = process.stderr.write.bind(process.stderr);
  const originalExit = process.exit;
  const originalExitCode = process.exitCode;
  const originalRequire = (globalThis as { require?: NodeJS.Require }).require;
  const originalCwd = cwd === "" ? "" : process.cwd();
  const isPipe = stdio === "pipe";
  let stdout = "";
  let stderr = "";
  return withFinalizer(
    () => {
      process.stdout.write = ((chunk: unknown) => {
        if (isPipe) stdout += String(chunk);
        else originalStdoutWrite(chunk as string);
        return true;
      }) as typeof process.stdout.write;
      process.stderr.write = ((chunk: unknown) => {
        if (isPipe) stderr += String(chunk);
        else originalStderrWrite(chunk as string);
        return true;
      }) as typeof process.stderr.write;
      process.exit = ((code?: number) => {
        const resolved = typeof code === "number" ? code : typeof process.exitCode === "number" ? process.exitCode : 0;
        throw new ExitSignalError(resolved);
      }) as typeof process.exit;
      if (cwd !== "") process.chdir(cwd);
      (globalThis as { require?: NodeJS.Require }).require = createRequire(
        resolve(cwd === "" ? process.cwd() : cwd, "[eval].js"),
      );
      return getResult(() => runInThisContext(code, { displayErrors: false })).match(
        // A non-Promise completion ran to the end synchronously; an async result needs an event loop we
        // Will not spin, so defer it to native. process.exitCode picks up an explicit `process.exitCode =`.
        (value): ExecResult | undefined =>
          value instanceof Promise
            ? undefined
            : { exitCode: typeof process.exitCode === "number" ? process.exitCode : 0, stderr, stdout },
        // A clean process.exit(n) is reproduced; any other throw defers to native, which emits node's
        // Exact stderr/exit code rather than an approximation that would diverge from the baseline.
        (error): ExecResult | undefined =>
          error instanceof ExitSignalError ? { exitCode: error.code, stderr, stdout } : undefined,
      );
    },
    () => {
      process.stdout.write = originalStdoutWrite;
      process.stderr.write = originalStderrWrite;
      process.exit = originalExit;
      process.exitCode = originalExitCode;
      (globalThis as { require?: NodeJS.Require }).require = originalRequire;
      if (originalCwd !== "") process.chdir(originalCwd);
    },
  );
};
