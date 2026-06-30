import { BackendType } from "@/models/virrun/BackendType";
import { ExecutionMode } from "@/models/virrun/ExecutionMode";
import { formatVirrunBanner } from "@/services/cli/formatVirrunBanner";
import { formatVirrunProvisioning } from "@/services/cli/formatVirrunProvisioning";
import { formatVirrunResult } from "@/services/cli/formatVirrunResult";
import { resolveBackend } from "@/services/configuration/resolveBackend";
import { resolveVirrunConfiguration } from "@/services/configuration/resolveVirrunConfiguration";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createVirrun } from "@/services/virrun/createVirrun";
import { exhaustiveGuard, getResultAsync, toAppError, withFinalizerAsync } from "@esposter/shared";
import { performance } from "node:perf_hooks";
import process from "node:process";
// The shared orchestration behind the passthrough commands (`virrun -- <cmd>`, `virrun run`, `virrun exec`):
// Resolve config/backend, construct the sandbox, bracket the run with a banner + result line on stderr, and
// Propagate the child's exit code. Captures the whole run in getResultAsync so any failure (malformed
// Virrun.config.json, no lockfile, bubblewrap setup, a missing command, a failed install) surfaces as a clean
// Error line and a propagated exit code instead of an unhandled rejection. All outcomes converge on the single
// FormatVirrunResult write so timing is always reported and the success/failure paths never duplicate it.
//
// `mode` picks the execution path (ExecutionMode): Persist (the default) forks a warm snapshot and flushes the
// Command's produced files back to the host so disk matches native; Fork forks the same warm snapshot but lets
// Writes vanish (ephemeral verification/CI); Exec plain-execs with no snapshot reuse. All three plain-exec on a
// Non-os backend. Stderr-only for the banner/result/provisioning lines — never stdout — so correctness diffs that
// Compare the child's streams are untouched.
export const runVirrunCommand = async (
  command: readonly string[],
  { mode }: { mode: ExecutionMode },
): Promise<number> => {
  const start = performance.now();
  const result = await getResultAsync(async () => {
    const backend = resolveBackend(resolveVirrunConfiguration());
    const virrun = await createVirrun({ backend });
    process.stderr.write(`${formatVirrunBanner({ backend: virrun.backend, command, nodeVersion: process.version })}\n`);
    // Persist and Fork both run over a frozen dependency snapshot (see Virrun.fork/persist): announce whether this
    // Run reuses a warm snapshot or pays the one-time install, so a multi-minute first run is explained, not a
    // Silent stall. Exec skips the snapshot, so it has nothing to announce.
    if (mode !== ExecutionMode.Exec && virrun.backend === BackendType.Os) {
      const { exists, hash } = resolveSnapshotLocation("");
      process.stderr.write(`${formatVirrunProvisioning({ exists, hash })}\n`);
    }
    return withFinalizerAsync(
      () => {
        switch (mode) {
          case ExecutionMode.Exec:
            return virrun.exec(command, "inherit");
          case ExecutionMode.Fork:
            return virrun.fork(command, "inherit");
          case ExecutionMode.Persist:
            return virrun.persist(command, "inherit");
          default:
            return exhaustiveGuard(mode);
        }
      },
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
