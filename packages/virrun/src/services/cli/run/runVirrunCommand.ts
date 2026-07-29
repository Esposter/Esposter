import { Color } from "@/models/cli/Color";
import { BackendType } from "@/models/virrun/BackendType";
import { ExecutionMode } from "@/models/virrun/ExecutionMode";
import { colorize } from "@/services/cli/color/colorize";
import { formatVirrunBanner } from "@/services/cli/format/formatVirrunBanner";
import { formatVirrunLine } from "@/services/cli/format/formatVirrunLine";
import { formatVirrunPrepare } from "@/services/cli/format/formatVirrunPrepare";
import { formatVirrunProvisioning } from "@/services/cli/format/formatVirrunProvisioning";
import { formatVirrunResult } from "@/services/cli/format/formatVirrunResult";
import { getCommandNotFoundHint } from "@/services/cli/run/getCommandNotFoundHint";
import { resolveBackend } from "@/services/configuration/resolveBackend";
import { resolvePrepareStep } from "@/services/configuration/resolvePrepareStep";
import { resolveVirrunConfiguration } from "@/services/configuration/resolveVirrunConfiguration";
import { resolvePrepareLocation } from "@/services/exec/snapshot/resolvePrepareLocation";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { getSandboxNodeVersion } from "@/services/exec/util/getSandboxNodeVersion";
import { createVirrun } from "@/services/virrun/createVirrun";
import { exhaustiveGuard, getResult, getResultAsync, noop, toAppError, withFinalizerAsync } from "@esposter/shared";
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
    const configuration = resolveVirrunConfiguration();
    const backend = resolveBackend(configuration);
    const virrun = await createVirrun({ backend, environment: configuration?.environment });
    // The os backend runs the command inside a Linux guest whose node comes from the WSL login environment, not this
    // Windows process — so report the guest's version there and the host's for the backends that run in place. A
    // Banner that always printed process.version hid exactly the mismatch (host on one node, sandbox on another) that
    // Makes a run fail its own engines check.
    process.stderr.write(
      `${formatVirrunBanner({
        backend: virrun.backend,
        command,
        nodeVersion: virrun.backend === BackendType.Os ? getSandboxNodeVersion() : process.version,
      })}\n`,
    );
    // Announce whether this run reuses a warm snapshot or pays the one-time install, so a multi-minute first run is
    // Explained, not a silent stall. Exec skips the snapshot, so it has nothing to announce.
    if (mode !== ExecutionMode.Exec && virrun.backend === BackendType.Os) {
      const { exists, hash } = resolveSnapshotLocation("");
      process.stderr.write(`${formatVirrunProvisioning({ exists, hash })}\n`);
      // When an environment preset regenerates framework artifacts (e.g. .nuxt), report whether this run reuses the
      // Source-keyed prepare layer or rebuilds it (expected on a source edit — the key tracks the working-tree hash),
      // So prepare is as observable as the deps snapshot instead of a silent stall. resolvePrepareStep already returns
      // Undefined when no preset is set, so no separate none-check is needed. A read-only resolve for the log only —
      // CreateVirrun owns the authoritative build — wrapped so a resolve throw never masks the run.
      getResult(() => {
        const prepareStep = resolvePrepareStep(configuration?.environment, "");
        if (prepareStep) process.stderr.write(`${formatVirrunPrepare(resolvePrepareLocation("", prepareStep))}\n`);
      }).match(noop, noop);
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
    ({ exitCode: resolvedExitCode }) => resolvedExitCode,
    (error) => {
      const message = toAppError(error).message;
      // A bare package-script name (e.g. `virrun run typecheck`) reaches the backend as a missing executable; swap
      // The raw sandbox-setup error for a hint that points at the working `virrun -- pnpm <script>` form. The hint is
      // Already tagged + colored; the raw-message fallback gets the same [virrun] tag and a red body.
      process.stderr.write(
        `${getCommandNotFoundHint(command, message, process.cwd()) ?? formatVirrunLine(colorize(message, Color.Red))}\n`,
      );
      return 1;
    },
  );
  process.stderr.write(
    `${formatVirrunResult({ command, durationMs: Math.round(performance.now() - start), exitCode })}\n`,
  );
  return exitCode;
};
