import { BackendType } from "@/models/virrun/BackendType";
import { formatVirrunBanner } from "@/services/cli/formatVirrunBanner";
import { formatVirrunProvisioning } from "@/services/cli/formatVirrunProvisioning";
import { formatVirrunResult } from "@/services/cli/formatVirrunResult";
import { resolveBackend } from "@/services/configuration/resolveBackend";
import { resolveVirrunConfiguration } from "@/services/configuration/resolveVirrunConfiguration";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createVirrun } from "@/services/virrun/createVirrun";
import { getResultAsync, toAppError, withFinalizerAsync } from "@esposter/shared";
import { performance } from "node:perf_hooks";
import process from "node:process";
// The shared orchestration behind the passthrough commands (`virrun -- <cmd>`, `virrun run`, `virrun exec`):
// Resolve config/backend, construct the sandbox, bracket the run with a banner + result line on stderr, and
// Propagate the child's exit code. Captures the whole run in getResultAsync so any failure (malformed
// Virrun.config.json, no lockfile, bubblewrap setup, a missing command, a failed install) surfaces as a clean
// Error line and a propagated exit code instead of an unhandled rejection. All outcomes converge on the single
// FormatVirrunResult write so timing is always reported and the success/failure paths never duplicate it.
//
// `isExec` picks the execution mode: the smart default (false) forks a warm snapshot on the os backend and plain-
// Execs elsewhere; `exec` (true) always plain-execs, skipping any snapshot reuse. Stderr-only for the banner/
// Result/provisioning lines — never stdout — so correctness diffs that compare the child's streams are untouched.
export const runVirrunCommand = async (
  command: readonly string[],
  { isExec }: { isExec: boolean },
): Promise<number> => {
  const start = performance.now();
  const result = await getResultAsync(async () => {
    const backend = resolveBackend(resolveVirrunConfiguration());
    const virrun = await createVirrun({ backend });
    process.stderr.write(`${formatVirrunBanner({ backend: virrun.backend, command, nodeVersion: process.version })}\n`);
    // The os backend runs over a frozen dependency snapshot (see Virrun.fork): announce whether this run reuses a
    // Warm snapshot or pays the one-time install, so a multi-minute first run is explained, not a silent stall.
    if (!isExec && virrun.backend === BackendType.Os) {
      const { exists, hash } = resolveSnapshotLocation("");
      process.stderr.write(`${formatVirrunProvisioning({ exists, hash })}\n`);
    }
    return withFinalizerAsync(
      () =>
        !isExec && virrun.backend === BackendType.Os
          ? virrun.fork(command, "inherit")
          : virrun.exec(command, "inherit"),
      () => virrun.dispose(),
    );
  });
  const exitCode = result.match(
    ({ exitCode }) => exitCode,
    (error) => {
      process.stderr.write(`${toAppError(error).message}\n`);
      return 1;
    },
  );
  process.stderr.write(
    `${formatVirrunResult({ command, durationMs: Math.round(performance.now() - start), exitCode })}\n`,
  );
  return exitCode;
};
