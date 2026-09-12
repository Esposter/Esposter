import type { ExecBackend } from "#src/models/exec/ExecBackend";

import { BwrapStatusSource } from "#src/models/exec/bwrap/BwrapStatusSource";
import { buildBwrapArgs } from "#src/services/exec/bwrap/buildBwrapArgs";
import { createBwrapBackend } from "#src/services/exec/bwrap/createBwrapBackend";

export const createLinuxOsBackend = (errorName: string): ExecBackend =>
  createBwrapBackend(
    (command, cwd, options) => buildBwrapArgs(command, cwd, options, options.overlayLayers),
    (bwrapArgs, options) => ({
      command: ["bwrap", "--json-status-fd", "3", ...bwrapArgs],
      env: { ...process.env, ...options.env },
      statusSource: BwrapStatusSource.Fd,
    }),
    errorName,
  );
