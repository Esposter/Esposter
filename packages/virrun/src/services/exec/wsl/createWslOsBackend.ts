import type { ExecBackend } from "@/models/exec/ExecBackend";

import { WSL_BWRAP_STATUS_BEGIN, WSL_BWRAP_STATUS_END } from "@/services/exec/bwrap/constants";
import { createBwrapBackend } from "@/services/exec/bwrap/createBwrapBackend";
import { createWslBwrapArgs } from "@/services/exec/wsl/createWslBwrapArgs";
import { createWslEnvArgs } from "@/services/exec/wsl/createWslEnvArgs";

export const createWslOsBackend = (errorName: string): ExecBackend =>
  createBwrapBackend(
    createWslBwrapArgs,
    (bwrapArgs, options) => ({
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
        "virrun-bwrap",
        ...bwrapArgs,
      ],
      // Bare Windows env: wsl.exe is located via the Windows PATH, and options.env (Linux login PATH +
      // Store vars) reaches the Linux child through the `env` args above, not this outer spawn env.
      env: process.env,
      statusSource: "stderr",
    }),
    errorName,
  );
