import { BackendType } from "#src/models/virrun/BackendType";
import { ExecutionMode } from "#src/models/virrun/ExecutionMode";
import { writeVirrunDebug } from "#src/services/cli/debug/writeVirrunDebug";
import { formatVirrunBanner } from "#src/services/cli/format/formatVirrunBanner";
import { formatVirrunDegraded } from "#src/services/cli/format/formatVirrunDegraded";
import { formatVirrunError } from "#src/services/cli/format/formatVirrunError";
import { formatVirrunPrepare } from "#src/services/cli/format/formatVirrunPrepare";
import { formatVirrunProvisioning } from "#src/services/cli/format/formatVirrunProvisioning";
import { formatVirrunResult } from "#src/services/cli/format/formatVirrunResult";
import { getCommandNotFoundHint } from "#src/services/cli/run/getCommandNotFoundHint";
import { checkIsVirrunEnabled } from "#src/services/configuration/checkIsVirrunEnabled";
import { resolveBackend } from "#src/services/configuration/resolveBackend";
import { resolvePrepareStep } from "#src/services/configuration/resolvePrepareStep";
import { resolveRequestedBackend } from "#src/services/configuration/resolveRequestedBackend";
import { resolveVirrunConfiguration } from "#src/services/configuration/resolveVirrunConfiguration";
import { resolvePrepareLocation } from "#src/services/exec/snapshot/resolvePrepareLocation";
import { resolveSnapshotLocation } from "#src/services/exec/snapshot/resolveSnapshotLocation";
import { getSandboxNodeVersion } from "#src/services/exec/util/getSandboxNodeVersion";
import { createVirrun } from "#src/services/virrun/createVirrun";
import { exhaustiveGuard, getResult, getResultAsync, noop, withFinalizerAsync } from "@esposter/shared";
import { performance } from "node:perf_hooks";
// Shared orchestration behind the passthrough commands: resolve config/backend, construct the sandbox, bracket the
// Run with a banner + result line, propagate the child's exit code. All outcomes converge on the single
// `formatVirrunResult` write so timing is always reported and neither path duplicates it. Banner/result/provisioning
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
    // A run that asked for the sandbox and got native ran un-isolated, and the os-only lines below are the only trace
    // Of that — so say it instead of leaving their absence to be read as "nothing to report". The test is what was
    // REQUESTED against what resolved, never "resolved to native": every other configured backend reaches native by
    // Its own design (`auto` is native today, `vfs` falls back per command) and owes no warning. A nested run
    // Degrades by design too (resolveBackend), so it stays quiet as well.
    if (
      resolveRequestedBackend(configuration) === BackendType.Os &&
      virrun.backend !== BackendType.Os &&
      !checkIsVirrunEnabled(process.env)
    )
      process.stderr.write(`${formatVirrunDegraded()}\n`);
    // Announce whether this run reuses a warm snapshot or pays the one-time install, so a multi-minute first run is
    // Explained, not a silent stall. Exec skips the snapshot, so it has nothing to announce.
    if (mode !== ExecutionMode.Exec && virrun.backend === BackendType.Os) {
      const { exists, hash } = resolveSnapshotLocation("");
      process.stderr.write(`${formatVirrunProvisioning({ exists, hash })}\n`);
      // When an environment preset regenerates framework artifacts (e.g. .nuxt), report whether this run reuses the
      // Source-keyed prepare layer or rebuilds it (expected on a source edit — the key tracks the working-tree hash),
      // So prepare is as observable as the deps snapshot instead of a silent stall. resolvePrepareStep already returns
      // Undefined when no preset is set, so no separate none-check is needed. A read-only resolve for the log only —
      // `createVirrun` owns the authoritative build — wrapped so a resolve throw never masks the run. A throw costs
      // The prepare line and nothing else, which is the degradation the debug sink exists for: the run goes on, and
      // A missing line is otherwise indistinguishable from having no preset configured at all.
      getResult(() => {
        const prepareStep = resolvePrepareStep(configuration?.environment, "");
        if (prepareStep) process.stderr.write(`${formatVirrunPrepare(resolvePrepareLocation("", prepareStep))}\n`);
      }).match(noop, ({ message }) => {
        writeVirrunDebug(`prepare location unresolved, line skipped — ${message}`);
      });
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
    ({ message }) => {
      // A bare package-script name (e.g. `virrun run typecheck`) reaches the backend as a missing executable; swap
      // The raw sandbox-setup error for a hint that points at the working `virrun -- pnpm <script>` form. The hint is
      // Already tagged + colored; the raw-message fallback gets the same [virrun] tag and a red body.
      process.stderr.write(
        `${getCommandNotFoundHint(command, message, process.cwd()) ?? formatVirrunError(message)}\n`,
      );
      return 1;
    },
  );
  process.stderr.write(
    `${formatVirrunResult({ command, durationMs: Math.round(performance.now() - start), exitCode })}\n`,
  );
  return exitCode;
};
