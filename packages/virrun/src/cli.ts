import { BackendType } from "@/models/virrun/BackendType";
import { formatVirrunBanner } from "@/services/cli/formatVirrunBanner";
import { formatVirrunProvisioning } from "@/services/cli/formatVirrunProvisioning";
import { formatVirrunResult } from "@/services/cli/formatVirrunResult";
import { parseCliCommand } from "@/services/cli/parseCliCommand";
import { resolveBackend } from "@/services/configuration/resolveBackend";
import { resolveVirrunConfiguration } from "@/services/configuration/resolveVirrunConfiguration";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createVirrun } from "@/services/virrun/createVirrun";
import { getResultAsync, toAppError, withFinalizerAsync } from "@esposter/shared";
import { performance } from "node:perf_hooks";
import process from "node:process";
// The human-facing entrypoint and the adoption entry point (specs/adoption.md): `virrun -- <cmd>` runs a
// Command through the sandbox with no other change. Output streams live (stdio "inherit") and the child's
// Exit code is propagated so it is a drop-in wrapper around any command. The command is forwarded as an argv
// Array (never a joined string) so it runs with shell: false and argument boundaries are preserved — spaces
// And metacharacters reach the program literally instead of being re-tokenized by a shell. Operators inside
// The sandbox are opt-in via `virrun -- sh -c "..."`.
//
// The prefix is the switch: every `virrun -- <cmd>` is sandboxed, and opting a command in or out is just adding
// Or removing the `virrun -- ` prefix on it — there is no separate on/off flag or allowlist. The repo's
// `virrun.config.json` (adoption level 3) only chooses *which* backend a sandboxed command runs through; with no
// Config the backend defaults to auto (native today), so the prefix is safe everywhere. virrun does inject a
// `VIRRUN=true` signal into the command's environment (see createVirrun), the way vitest sets `VITEST`, so the
// Command can detect it.
const main = async (): Promise<void> => {
  const command = parseCliCommand(process.argv.slice(2));
  if (command.length === 0) {
    process.stderr.write("usage: virrun -- <command>\n");
    process.exitCode = 1;
    return;
  }
  const backend = resolveBackend(resolveVirrunConfiguration());
  const start = performance.now();
  // Capture the whole run — construction, provisioning, and exec — so any failure (no lockfile, bubblewrap
  // Setup, a missing command, a failed install) surfaces as a clean error line and a propagated exit code instead
  // Of an unhandled rejection that dumps a stack and skips the result line below. All outcomes converge on the
  // Single formatVirrunResult write so timing is always reported and the success/failure paths never duplicate it.
  const result = await getResultAsync(async () => {
    const virrun = await createVirrun({ backend });
    // Bracket the run with a start + result line on stderr (never stdout — correctness diffs compare the child's
    // Streams) so each `virrun -- <cmd>` is self-describing: resolved backend, node version, and wall-clock time.
    process.stderr.write(`${formatVirrunBanner({ backend: virrun.backend, command, nodeVersion: process.version })}\n`);
    // The os backend runs over a frozen dependency snapshot (see Virrun.fork): announce whether this run reuses a
    // Warm snapshot or pays the one-time install, so a multi-minute first run is explained, not a silent stall.
    if (virrun.backend === BackendType.Os) {
      const { exists, hash } = resolveSnapshotLocation("");
      process.stderr.write(`${formatVirrunProvisioning({ exists, hash })}\n`);
    }
    return withFinalizerAsync(
      () => (virrun.backend === BackendType.Os ? virrun.fork(command, "inherit") : virrun.exec(command, "inherit")),
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
  process.exitCode = exitCode;
};

await main();
