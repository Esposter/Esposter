import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";
import type { NodeInvocation } from "@/models/exec/NodeInvocation";

import { ExitSignal } from "@/models/exec/ExitSignal";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import process from "node:process";
import { runInThisContext } from "node:vm";
// Run inline node code in the current process so it shares the (vfs-patched, Step B2) module loader
// And core fs instead of spawning a child. Captures stdout/stderr/exit when stdio is "pipe" and
// Streams live for "inherit", matching the native backend. Returns undefined when the code can't be
// Run faithfully in-process — a compile error (e.g. top-level await), or an async result we will not
// Wait on — so the caller falls back to native and the observable result always matches baseline.
// Runs serially: it temporarily patches global process streams, exit, and require, restored in finally.
export const runNodeInProcess = ({ code }: NodeInvocation, { cwd, stdio }: ExecOptions): ExecResult | undefined => {
  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  const originalStderrWrite = process.stderr.write.bind(process.stderr);
  const originalExit = process.exit;
  const originalExitCode = process.exitCode;
  const originalRequire = (globalThis as { require?: NodeRequire }).require;
  const originalCwd = cwd === "" ? "" : process.cwd();
  const isPipe = stdio === "pipe";
  let stdout = "";
  let stderr = "";
  let exitCode = 0;
  let fellBack = false;
  try {
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
      throw new ExitSignal(resolved);
    }) as typeof process.exit;
    if (cwd !== "") process.chdir(cwd);
    (globalThis as { require?: NodeRequire }).require = createRequire(
      resolve(cwd === "" ? process.cwd() : cwd, "[eval].js"),
    );
    try {
      const result: unknown = runInThisContext(code, { displayErrors: false });
      if (result instanceof Promise) fellBack = true;
      else exitCode = typeof process.exitCode === "number" ? process.exitCode : 0;
    } catch (error) {
      if (error instanceof ExitSignal) exitCode = error.code;
      else if (error instanceof SyntaxError) fellBack = true;
      else {
        const message = error instanceof Error ? `${error.stack ?? error.message}\n` : `${String(error)}\n`;
        if (isPipe) stderr += message;
        else originalStderrWrite(message);
        exitCode = 1;
      }
    }
  } finally {
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
    process.exit = originalExit;
    process.exitCode = originalExitCode;
    (globalThis as { require?: NodeRequire }).require = originalRequire;
    if (originalCwd !== "") process.chdir(originalCwd);
  }
  return fellBack ? undefined : { exitCode, stderr, stdout };
};
