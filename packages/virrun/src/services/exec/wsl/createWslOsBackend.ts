import type { ExecBackend } from "@/models/exec/ExecBackend";

import {
  WSL_BWRAP_STATUS_BEGIN,
  WSL_BWRAP_STATUS_END,
  WSL_SOURCE_MIRROR_SYNC_FAILURE_MARKER,
} from "@/services/exec/bwrap/constants";
import { createBwrapBackend } from "@/services/exec/bwrap/createBwrapBackend";
import { SOURCE_MIRROR_TIMEOUT_SECONDS } from "@/services/exec/util/constants";
import { resolveCwd } from "@/services/exec/util/resolveCwd";
import { spawnBackground } from "@/services/exec/util/spawnBackground";
import { buildWslReapCommand } from "@/services/exec/wsl/buildWslReapCommand";
import { createWslBwrapArgs } from "@/services/exec/wsl/createWslBwrapArgs";
import { createWslEnvArgs } from "@/services/exec/wsl/createWslEnvArgs";
import { createWslProcessMarker } from "@/services/exec/wsl/createWslProcessMarker";
import { createWslSourceMirrorSync } from "@/services/exec/wsl/createWslSourceMirrorSync";
import { getSourceMirrorKey } from "@/services/exec/wsl/getSourceMirrorKey";
import { reapAbandonedSourceMirrors } from "@/services/exec/wsl/reapAbandonedSourceMirrors";
import { reapOrphanedWslRuns } from "@/services/exec/wsl/reapOrphanedWslRuns";
import { shellQuote } from "@/services/exec/wsl/shellQuote";

export const createWslOsBackend = (errorName: string): ExecBackend => {
  // Reap any bwrap tree a previous hard-killed run left orphaned (its onTerminate reaper never fired) before this
  // Backend spawns its own — off the critical path, and scoped to true orphans so a concurrent live run is untouched.
  reapOrphanedWslRuns();
  return createBwrapBackend(
    createWslBwrapArgs,
    (bwrapArgs, options) => {
      // Tag this run's shell with a unique `$0` so Ctrl+C can find and group-kill exactly its process tree.
      const marker = createWslProcessMarker();
      // The mirror sync rides the run's own wsl.exe invocation instead of a separate spawn: an empty script (mirror
      // Already current) prepends nothing, a delta/full sync runs ahead of bwrap and a failure prints the
      // WSL_SOURCE_MIRROR_SYNC_FAILURE_MARKER line then exits with its own code before the sandbox starts — the
      // Close handler keys on that marker (no status block ever reaches stderr on this path) so a sync failure reads
      // As one instead of masquerading as a bwrap setup failure. Never a stale mirror. On success the sync is silent
      // (tar without -v), so the child's stdout/stderr stay byte-exact vs native.
      // The whole body then runs under a shared flock on the mirror lock (fd 9, held until sh exits): bwrap reads the
      // Mirror lower for the run's full duration, and a concurrent same-cwd sync takes the exclusive side of the same
      // Lock — so its deletes/renames wait for readers to drain instead of tearing a live run's source tree. Shared
      // Holders don't block each other, and the sync prelude's own exclusive flock uses a nested fd-9 redirect (a
      // Separate open file description), released before this shared acquire — `flock -s -w` bounds a stuck writer.
      const cwd = resolveCwd(options.cwd);
      const { lockPath, script } = createWslSourceMirrorSync(cwd);
      // Reap ext4 source mirrors whose host repo/worktree was deleted — the one cache entry with no lockfile/source
      // Key to supersede it, so it needs its own origin-marker sweep. Strictly after the sync above: that is what
      // (Re)publishes this repo's origin marker, and the reaper's unmarked-and-aged arm is only sound once it has.
      // This run's own entry is excluded by key — the tree bwrap is about to mount cannot be a reap candidate.
      reapAbandonedSourceMirrors(getSourceMirrorKey(cwd));
      return {
        command: [
          "wsl.exe",
          "--exec",
          "env",
          ...createWslEnvArgs(options),
          "sh",
          "-c",
          `{ ${[
            ...(script
              ? [
                  `{ ${script}; } || { syncExitCode="$?"; printf '${WSL_SOURCE_MIRROR_SYNC_FAILURE_MARKER} with exit code %s\\n' "$syncExitCode" >&2; exit "$syncExitCode"; }`,
                ]
              : []),
            `flock -s -w ${SOURCE_MIRROR_TIMEOUT_SECONDS} 9 || exit "$?"`,
            `status="$(mktemp)"`,
            `bwrap --json-status-fd 3 "$@" 3>"$status"`,
            `bwrapExitCode=$?`,
            `printf '${WSL_BWRAP_STATUS_BEGIN.replaceAll("\n", String.raw`\n`)}' >&2`,
            `cat "$status" >&2`,
            `printf '${WSL_BWRAP_STATUS_END.replaceAll("\n", String.raw`\n`)}' >&2`,
            `rm -f "$status"`,
            `exit "$bwrapExitCode"`,
          ].join("; ")}; } 9> ${shellQuote(lockPath)}`,
          marker,
          ...bwrapArgs,
        ],
        // Bare Windows env: wsl.exe is located via the Windows PATH, and options.env (Linux login PATH +
        // Store vars) reaches the Linux child through the `env` args above, not this outer spawn env.
        env: process.env,
        // Ctrl+C reaches only the Windows wsl.exe client, not the bwrap tree under WSL — reap that tree's process
        // Group Linux-side by marker. spawnBackground survives this process exiting via its own windowless console
        // (see there); forwardTerminationSignals guards this call so a synchronous spawn failure can't escape the
        // Signal handler, and the async `error` event is ignored because teardown is best-effort and the run is ending.
        onTerminate: () => {
          const [file, ...args] = buildWslReapCommand(marker);
          spawnBackground(file, args);
        },
        statusSource: "stderr",
      };
    },
    errorName,
  );
};
