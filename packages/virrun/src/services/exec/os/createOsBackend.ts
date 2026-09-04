import type { ExecBackend } from "#src/models/exec/ExecBackend";
import type { Environment } from "#src/models/virrun/Environment";

import { createLinuxOsBackend } from "#src/services/exec/bwrap/createLinuxOsBackend";
import { checkIsOsBackendSupported } from "#src/services/exec/os/checkIsOsBackendSupported";
import { createWslOsBackend } from "#src/services/exec/wsl/createWslOsBackend";
import { InvalidOperationError, Operation } from "@esposter/shared";
// Runs every command (including native binaries) inside a bubblewrap RAM-overlay: reads fall through to the
// Source, writes land in an invisible tmpfs upper. Unlike the vfs backend it NEVER falls back to native —
// Isolation IS the result here, so a silent fallback would run the command un-isolated (a wrong answer
// Disguised as success); an unsupported host throws at construction instead.
//
// `environment` is only read on win32, where the source mirror's exclude set is derived from the same preset the
// Write-back mask is (createWslOsBackend). Linux mounts the real source, so there is no mirror and nothing to align.
export const createOsBackend = (environment?: Environment): ExecBackend => {
  if (!checkIsOsBackendSupported())
    throw new InvalidOperationError(Operation.Create, createOsBackend.name, "requires Linux/WSL + bubblewrap");
  switch (process.platform) {
    case "linux":
      return createLinuxOsBackend(createOsBackend.name);
    case "win32":
      return createWslOsBackend(createOsBackend.name, environment);
    default:
      throw new InvalidOperationError(Operation.Create, createOsBackend.name, "requires Linux/WSL + bubblewrap");
  }
};
