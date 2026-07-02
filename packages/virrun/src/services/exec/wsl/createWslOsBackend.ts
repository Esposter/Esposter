import type { ExecBackend } from "@/models/exec/ExecBackend";

import { WSL_BWRAP_STATUS_BEGIN, WSL_BWRAP_STATUS_END } from "@/services/exec/bwrap/constants";
import { createBwrapBackend } from "@/services/exec/bwrap/createBwrapBackend";
import { buildWslReapCommand } from "@/services/exec/wsl/buildWslReapCommand";
import { createWslBwrapArgs } from "@/services/exec/wsl/createWslBwrapArgs";
import { createWslEnvArgs } from "@/services/exec/wsl/createWslEnvArgs";
import { createWslProcessMarker } from "@/services/exec/wsl/createWslProcessMarker";
import { spawn } from "node:child_process";

export const createWslOsBackend = (errorName: string): ExecBackend =>
  createBwrapBackend(
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
        // Group Linux-side by marker. Detached + unref so it survives this process exiting; forwardTerminationSignals
        // Guards this call, so a synchronous spawn failure can't escape the signal handler, and the async `error`
        // Event is ignored because teardown is best-effort and the run is already ending.
        onTerminate: () => {
          const [file, ...args] = buildWslReapCommand(marker);
          const reaper = spawn(file, args, { detached: true, stdio: "ignore" });
          reaper.on("error", () => undefined);
          reaper.unref();
        },
        statusSource: "stderr",
      };
    },
    errorName,
  );
