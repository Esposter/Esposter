import type { ExecBackend } from "@/models/exec/ExecBackend";

import { createLinuxOsBackend } from "@/services/exec/bwrap/createLinuxOsBackend";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import { createWslOsBackend } from "@/services/exec/wsl/createWslOsBackend";
import { InvalidOperationError, Operation } from "@esposter/shared";
// Runs every command (including native binaries) inside a bubblewrap RAM-overlay: reads fall through to the
// Source, writes land in an invisible tmpfs upper. Unlike the vfs backend it NEVER falls back to native —
// Isolation IS the result here, so a silent fallback would run the command un-isolated (a wrong answer
// Disguised as success); an unsupported host throws at construction instead.
export const createOsBackend = (): ExecBackend => {
  if (!isOsBackendSupported())
    throw new InvalidOperationError(Operation.Create, createOsBackend.name, "requires Linux/WSL + bubblewrap");
  if (process.platform === "linux") return createLinuxOsBackend(createOsBackend.name);
  else if (process.platform === "win32") return createWslOsBackend(createOsBackend.name);
  throw new InvalidOperationError(Operation.Create, createOsBackend.name, "requires Linux/WSL + bubblewrap");
};
