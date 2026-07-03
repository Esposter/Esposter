import type { ExecBackend } from "@/models/exec/ExecBackend";

import { WSL_BWRAP_STATUS_BEGIN, WSL_BWRAP_STATUS_END } from "@/services/exec/bwrap/constants";
import { createBwrapBackend } from "@/services/exec/bwrap/createBwrapBackend";
import { spawnBackground } from "@/services/exec/util/spawnBackground";
import { buildWslReapCommand } from "@/services/exec/wsl/buildWslReapCommand";
import { createWslBwrapArgs } from "@/services/exec/wsl/createWslBwrapArgs";
import { createWslEnvArgs } from "@/services/exec/wsl/createWslEnvArgs";
import { createWslProcessMarker } from "@/services/exec/wsl/createWslProcessMarker";
import { reapAbandonedSourceMirrors } from "@/services/exec/wsl/reapAbandonedSourceMirrors";
import { reapOrphanedWslRuns } from "@/services/exec/wsl/reapOrphanedWslRuns";

export const createWslOsBackend = (errorName: string): ExecBackend => {
  // Reap any bwrap tree a previous hard-killed run left orphaned (its onTerminate reaper never fired) before this
  // Backend spawns its own — off the critical path, and scoped to true orphans so a concurrent live run is untouched.
  reapOrphanedWslRuns();
  // Reap ext4 source mirrors whose host repo/worktree was deleted — the one cache entry with no lockfile/source key to
  // Supersede it, so it needs its own origin-marker sweep. Also best-effort, off the critical path, spares live repos.
  reapAbandonedSourceMirrors();
  return createBwrapBackend(
    createWslBwrapArgs,
    (bwrapArgs, options) => {
      // Tag this run's shell with a unique `$0` so Ctrl+C can find and group-kill exactly its process tree.
      const marker = createWslProcessMarker();
      return {
        command: [
          "wsl.exe",
          "--exec",
          "env",
          ...createWslEnvArgs(options),
          "sh",
          "-c",
          [
            `status="$(mktemp)"`,
            `bwrap --json-status-fd 3 "$@" 3>"$status"`,
            `bwrapExitCode=$?`,
            `printf '${WSL_BWRAP_STATUS_BEGIN.replaceAll("\n", String.raw`\n`)}' >&2`,
            `cat "$status" >&2`,
            `printf '${WSL_BWRAP_STATUS_END.replaceAll("\n", String.raw`\n`)}' >&2`,
            `rm -f "$status"`,
            `exit "$bwrapExitCode"`,
          ].join("; "),
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
