import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";

import { formatVirrunCacheHit } from "@/services/cli/format/formatVirrunCacheHit";
import { computeTaskCacheKey } from "@/services/exec/cache/computeTaskCacheKey";
import { isTaskCacheEnabled } from "@/services/exec/cache/isTaskCacheEnabled";
import { recordTaskCache } from "@/services/exec/cache/recordTaskCache";
import { replayTaskCache } from "@/services/exec/cache/replayTaskCache";
import { resolveTaskCacheLocation } from "@/services/exec/cache/resolveTaskCacheLocation";
import { persistRun } from "@/services/exec/snapshot/persistRun";
import { resolveCwd } from "@/services/exec/util/resolveCwd";
// PersistRun wrapped with the task cache — the "skip unchanged builds" dev-loop lever (roadmap.md). On a hit the
// Sandbox is skipped: the recorded diff is flushed to the host and the recorded streams + exit code reproduced. On a
// Miss the run executes (capturing output) and its exit-0 result is recorded. Falls back to a plain persistRun when
// The cache is off or the key can't be computed (not a git repo / no lockfile).
export const persistWithCache = async (
  backend: ExecBackend,
  command: readonly string[] | string,
  options: ExecOptions,
): Promise<ExecResult> => {
  const key = isTaskCacheEnabled() ? computeTaskCacheKey(command, options.cwd) : null;
  if (key === null) return persistRun(backend, command, options);
  // Reproduce a result under the caller's stdio convention, matching createBwrapBackend: "inherit" already put its
  // Output on the terminal so it returns empty streams; "pipe" returns the captured streams.
  const toResult = (result: ExecResult): ExecResult =>
    options.stdio === "inherit" ? { exitCode: result.exitCode, stderr: "", stdout: "" } : result;
  if (resolveTaskCacheLocation(key).exists) {
    const cached = replayTaskCache(key, resolveCwd(options.cwd));
    if (options.stdio === "inherit") {
      process.stderr.write(`${formatVirrunCacheHit(command)}\n`);
      process.stdout.write(cached.stdout);
      process.stderr.write(cached.stderr);
    }
    return toResult(cached);
  }
  // Capture output so a miss can be recorded; tee it live only when the caller wanted it inherited, so a bare
  // `virrun -- <cmd>` still streams during the run.
  const result = await persistRun(
    backend,
    command,
    { ...options, stdio: "pipe", tee: options.stdio === "inherit" },
    (upperDir, plan, persistResult) => {
      recordTaskCache(key, upperDir, plan, persistResult);
    },
  );
  return toResult(result);
};
