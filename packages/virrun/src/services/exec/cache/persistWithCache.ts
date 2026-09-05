import type { ExecBackend } from "#src/models/exec/ExecBackend";
import type { ExecOptions } from "#src/models/exec/ExecOptions";
import type { ExecResult } from "#src/models/exec/ExecResult";

import { writeVirrunDebug } from "#src/services/cli/debug/writeVirrunDebug";
import { formatVirrunCacheHit } from "#src/services/cli/format/formatVirrunCacheHit";
import { formatVirrunNetworkHint } from "#src/services/cli/format/formatVirrunNetworkHint";
import { checkHasDependencyClosureMutation } from "#src/services/exec/cache/checkHasDependencyClosureMutation";
import { checkIsNetworkFailure } from "#src/services/exec/cache/checkIsNetworkFailure";
import { checkIsTaskCacheEnabled } from "#src/services/exec/cache/checkIsTaskCacheEnabled";
import { computeTaskCacheKey } from "#src/services/exec/cache/computeTaskCacheKey";
import { recordTaskCache } from "#src/services/exec/cache/recordTaskCache";
import { replayTaskCache } from "#src/services/exec/cache/replayTaskCache";
import { resolveTaskCacheLocation } from "#src/services/exec/cache/resolveTaskCacheLocation";
import { persistRun } from "#src/services/exec/snapshot/persistRun";
import { resolveCwd } from "#src/services/exec/util/resolveCwd";
// `persistRun` wrapped with the task cache — the "skip unchanged builds" dev-loop lever (roadmap.md). On a hit the
// Sandbox is skipped: the recorded diff is flushed to the host and the recorded streams + exit code reproduced. On a
// Miss the run executes (capturing output) and its exit-0 result is recorded. Falls back to a plain persistRun when
// The cache is off or the key can't be computed (not a git repo / no lockfile).
//
// `maskedPaths` is keyed on, not re-applied: a hit replays the recorded plan verbatim, so an entry built under a
// Different mask must miss rather than flush what today's mask forbids (computeTaskCacheKey).
export const persistWithCache = async (
  backend: ExecBackend,
  command: readonly string[] | string,
  options: ExecOptions,
  extraLowerDirs: readonly string[] = [],
  maskedPaths: readonly string[] = [],
): Promise<ExecResult> => {
  const key = checkIsTaskCacheEnabled() ? computeTaskCacheKey(command, options.cwd, maskedPaths) : null;
  if (key === null) {
    writeVirrunDebug(
      checkIsTaskCacheEnabled()
        ? "task cache off — no key (not a git repo or no lockfile)"
        : "task cache off — disabled (CI or VIRRUN_NO_CACHE)",
    );
    return persistRun(backend, command, options, extraLowerDirs, maskedPaths);
  }
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
  // `virrun -- <cmd>` still streams during the run. Run the command with network unshared (`isNetworkEnabled: false`):
  // The task-cache key can't see network state, so a cacheable run must be hermetic for the key to be honest. Deps are
  // Already provisioned (ensureSnapshot ran upstream with network on), so a pure task (typecheck/lint/test) is
  // Unaffected, while a read-network command (`pnpm outdated`/`audit`) can't reach the registry, exits non-zero, and is
  // Never recorded (onPersist fires only on exit 0). `--no-cache` / CI take the key===null branch above, which keeps
  // Network on — the escape hatch for a command that genuinely needs it.
  const result = await persistRun(
    backend,
    command,
    { ...options, isNetworkEnabled: false, stdio: "pipe", tee: options.stdio === "inherit" ? "stdout" : undefined },
    extraLowerDirs,
    maskedPaths,
    (upperDir, plan, persistResult) => {
      // A write-network install (`pnpm install`/`add`/`update`) can still succeed offline from the warm store, so the
      // Net-unshare gate alone would cache it. Its output isn't determined by the key it mutates, so skip recording —
      // The run is flushed and correct, just uncached.
      if (checkHasDependencyClosureMutation(plan)) {
        writeVirrunDebug("task cache record skipped — run mutated the dependency closure");
        return;
      }
      recordTaskCache(key, upperDir, plan, persistResult);
    },
  );
  // The run above was hermetic (network unshared). If it FAILED reaching the network, the tool's own error is opaque (a
  // Buried "fetch failed"), so translate it into the cause + the --no-cache fix — human CLI path only (inherit, matching
  // The hit label; a programmatic pipe caller reads the streams itself). Recording was already skipped (exit != 0).
  if (
    result.exitCode !== 0 &&
    options.stdio === "inherit" &&
    checkIsNetworkFailure(`${result.stdout}\n${result.stderr}`)
  )
    process.stderr.write(`${formatVirrunNetworkHint(command)}\n`);
  return toResult(result);
};
