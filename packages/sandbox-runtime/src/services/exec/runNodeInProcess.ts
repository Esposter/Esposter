import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";
import type { NodeInvocation } from "@/models/exec/NodeInvocation";

import { ExitSignalError } from "@/models/exec/ExitSignalError";
import { createPlatformaticFsProvider } from "@/services/vfs/createPlatformaticFsProvider";
import { getResult, withFinalizer } from "@esposter/shared";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import process from "node:process";
import { runInThisContext } from "node:vm";
// Run a recognised node invocation in the current process instead of spawning a child: inline code
// (`node -e`) via runInThisContext, or a file (`node <file>`) via require. The run happens inside an
// Overlay vfs mounted at the working dir, so the module loader + core fs serve virtual files where
// They exist and fall through to real disk otherwise — module loading therefore matches native.
// Captures stdout/stderr/exit when stdio is "pipe" and streams live for "inherit". Returns undefined
// When the code can't be run faithfully in-process — a compile error, an uncaught error whose stderr
// We won't reproduce byte-for-byte, or an async result we won't wait on — so the caller falls back to
// Native and the observable result always matches baseline. Runs serially: it temporarily patches the
// Global process streams, exit, and require and mounts the vfs inside withFinalizer, all restored
// Whether the run throws or not. The require cache is cleared back to its pre-run state so each run
// Re-executes from scratch, matching a fresh native process.
export const runNodeInProcess = (
  { code, file }: NodeInvocation,
  { cwd, stdio }: ExecOptions,
): ExecResult | undefined => {
  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  const originalStderrWrite = process.stderr.write.bind(process.stderr);
  const originalExit = process.exit;
  const originalExitCode = process.exitCode;
  const originalRequire = (globalThis as { require?: NodeJS.Require }).require;
  const originalCwd = cwd === "" ? "" : process.cwd();
  const baseDir = cwd === "" ? process.cwd() : cwd;
  const fs = createPlatformaticFsProvider({ overlay: true });
  const isPipe = stdio === "pipe";
  const require = createRequire(resolve(baseDir, "[eval].js"));
  const cachedBefore = new Set(Object.keys(require.cache));
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
      (globalThis as { require?: NodeJS.Require }).require = require;
      fs.mount(baseDir);
      // Inline code evaluates directly; a file run resolves against the working dir and loads through
      // The mounted vfs so its modules come from virtual files (or real disk via the overlay).
      const run = () =>
        file === ""
          ? runInThisContext(code, { displayErrors: false })
          : require(require.resolve(resolve(baseDir, file)));
      return getResult(run).match(
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
      fs.dispose();
      process.stdout.write = originalStdoutWrite;
      process.stderr.write = originalStderrWrite;
      process.exit = originalExit;
      process.exitCode = originalExitCode;
      (globalThis as { require?: NodeJS.Require }).require = originalRequire;
      if (originalCwd !== "") process.chdir(originalCwd);
      for (const key of Object.keys(require.cache)) if (!cachedBefore.has(key)) delete require.cache[key];
    },
  );
};
