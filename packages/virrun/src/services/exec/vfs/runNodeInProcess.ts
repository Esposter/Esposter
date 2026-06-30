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
// Run a recognised node invocation in the current process instead of spawning a child, inside an overlay vfs
// Mounted at the working dir so the module loader + core fs serve virtual files (falling through to real disk).
// Returns undefined when the code can't run faithfully in-process so the caller falls back to native. Runs
// Serially: it patches the global process streams, exit, and require and mounts the vfs inside withFinalizer, all
// Restored whether the run throws or not, and resets the require cache so each run re-executes from scratch.
export const runNodeInProcess = (
  { code, file }: NodeInvocation,
  { cwd, stdio }: ExecOptions,
): ExecResult | undefined => {
  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  const originalStderrWrite = process.stderr.write.bind(process.stderr);
  const originalExit = process.exit;
  const originalExitCode = process.exitCode;
  const originalRequire = globalThis.require;
  const originalCwd = cwd === "" ? "" : process.cwd();
  const baseDir = cwd === "" ? process.cwd() : cwd;
  const fs = createPlatformaticFsProvider({ isOverlayEnabled: true });
  const isPipe = stdio === "pipe";
  const require = createRequire(resolve(baseDir, "[eval].js"));
  const cachedBefore = new Set(Object.keys(require.cache));
  let stdout = "";
  let stderr = "";
  return withFinalizer(
    () => {
      process.stdout.write = (chunk) => {
        if (isPipe) stdout += String(chunk);
        else originalStdoutWrite(chunk);
        return true;
      };
      process.stderr.write = (chunk) => {
        if (isPipe) stderr += String(chunk);
        else originalStderrWrite(chunk);
        return true;
      };
      process.exit = (code) => {
        const resolved = typeof code === "number" ? code : typeof process.exitCode === "number" ? process.exitCode : 0;
        throw new ExitSignalError(resolved);
      };
      if (cwd !== "") process.chdir(cwd);
      globalThis.require = require;
      fs.mount(baseDir);
      const run = () =>
        file === ""
          ? runInThisContext(code, { displayErrors: false })
          : require(require.resolve(resolve(baseDir, file)));
      return getResult(run).match(
        // An async result needs an event loop we will not spin, so defer it to native.
        (value): ExecResult | undefined =>
          value instanceof Promise
            ? undefined
            : { exitCode: typeof process.exitCode === "number" ? process.exitCode : 0, stderr, stdout },
        // A clean process.exit(n) is reproduced; any other throw defers to native for node's exact stderr/exit.
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
      globalThis.require = originalRequire;
      if (originalCwd !== "") process.chdir(originalCwd);
      for (const key of Object.keys(require.cache)) if (!cachedBefore.has(key)) delete require.cache[key];
    },
  );
};
