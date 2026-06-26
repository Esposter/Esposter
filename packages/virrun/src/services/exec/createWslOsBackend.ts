import type { ExecBackend } from "@/models/exec/ExecBackend";

import { WSL_BWRAP_STATUS_BEGIN, WSL_BWRAP_STATUS_END } from "@/services/exec/constants";
import { createBwrapBackend } from "@/services/exec/createBwrapBackend";
import { createWslBwrapArgs } from "@/services/exec/createWslBwrapArgs";
import { createWslEnvArgs } from "@/services/exec/createWslEnvArgs";

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
          `printf '${WSL_BWRAP_STATUS_BEGIN.replaceAll("\n", "\\n")}' >&2`,
          `cat "$status" >&2`,
          `printf '${WSL_BWRAP_STATUS_END.replaceAll("\n", "\\n")}' >&2`,
          `rm -f "$status"`,
          `exit "$bwrapExitCode"`,
        ].join("; "),
        "virrun-bwrap",
        ...bwrapArgs,
      ],
      statusSource: "stderr",
    }),
    errorName,
  );
