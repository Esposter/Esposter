import type { ExecBackend } from "@/models/exec/ExecBackend";

import { buildBwrapArgs } from "@/services/exec/buildBwrapArgs";
import { createBwrapBackend } from "@/services/exec/createBwrapBackend";

export const createLinuxOsBackend = (errorName: string): ExecBackend =>
  createBwrapBackend(
    buildBwrapArgs,
    (bwrapArgs) => ({ command: ["bwrap", ...bwrapArgs], statusSource: "fd" }),
    errorName,
  );
