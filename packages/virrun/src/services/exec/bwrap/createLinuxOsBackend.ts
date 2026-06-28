import type { ExecBackend } from "@/models/exec/ExecBackend";

import { buildBwrapArgs } from "@/services/exec/bwrap/buildBwrapArgs";
import { createBwrapBackend } from "@/services/exec/bwrap/createBwrapBackend";

export const createLinuxOsBackend = (errorName: string): ExecBackend =>
  createBwrapBackend(
    buildBwrapArgs,
    (bwrapArgs) => ({ command: ["bwrap", "--json-status-fd", "3", ...bwrapArgs], statusSource: "fd" }),
    errorName,
  );
