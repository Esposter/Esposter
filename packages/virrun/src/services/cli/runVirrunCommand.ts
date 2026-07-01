import { BackendType } from "@/models/virrun/BackendType";
import { ExecutionMode } from "@/models/virrun/ExecutionMode";
import { formatVirrunBanner } from "@/services/cli/formatVirrunBanner";
import { formatVirrunProvisioning } from "@/services/cli/formatVirrunProvisioning";
import { formatVirrunResult } from "@/services/cli/formatVirrunResult";
import { getCommandNotFoundHint } from "@/services/cli/getCommandNotFoundHint";
import { resolveBackend } from "@/services/configuration/resolveBackend";
import { resolveVirrunConfiguration } from "@/services/configuration/resolveVirrunConfiguration";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createVirrun } from "@/services/virrun/createVirrun";
import { exhaustiveGuard, getResultAsync, toAppError, withFinalizerAsync } from "@esposter/shared";
import { performance } from "node:perf_hooks";
// Shared orchestration behind the passthrough commands: resolve config/backend, construct the sandbox, bracket the
// Run with a banner + result line, propagate the child's exit code. All outcomes converge on the single
// FormatVirrunResult write so timing is always reported and neither path duplicates it. Banner/result/provisioning
// Lines go to stderr only — never stdout — so correctness diffs comparing the child's streams are untouched.
export const runVirrunCommand = async (
  command: readonly string[],
  { mode }: { mode: ExecutionMode },
): Promise<number> => {
  const start = performance.now();
  const result = await getResultAsync(async () => {
    const backend = resolveBackend(resolveVirrunConfiguration());
    const virrun = await createVirrun({ backend });
    process.stderr.write(`${formatVirrunBanner({ backend: virrun.backend, command, nodeVersion: process.version })}\n`);
    // Announce whether this run reuses a warm snapshot or pays the one-time install, so a multi-minute first run is
    // Explained, not a silent stall. Exec skips the snapshot, so it has nothing to announce.
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
      const message = toAppError(error).message;
      // A bare package-script name (e.g. `virrun run typecheck`) reaches the backend as a missing executable; swap
      // The raw sandbox-setup error for a hint that points at the working `virrun -- pnpm <script>` form.
      process.stderr.write(`${getCommandNotFoundHint(command, message, process.cwd()) ?? message}\n`);
      return 1;
    },
  );
  process.stderr.write(
    `${formatVirrunResult({ command, durationMs: Math.round(performance.now() - start), exitCode })}\n`,
  );
  return exitCode;
};
