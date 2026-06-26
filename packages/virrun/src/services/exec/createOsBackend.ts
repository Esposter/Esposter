import type { ExecBackend } from "@/models/exec/ExecBackend";

import { createLinuxOsBackend } from "@/services/exec/createLinuxOsBackend";
import { createWslOsBackend } from "@/services/exec/createWslOsBackend";
import { isOsBackendSupported } from "@/services/exec/isOsBackendSupported";
import { InvalidOperationError, Operation } from "@esposter/shared";
// The os backend: run every command — including native binaries — inside a bubblewrap RAM-overlay, so
// Reads fall through to the source while writes land in an invisible tmpfs upper, never touching the
// Host disk. This is what breaks the subprocess wall the vfs backend can't see past. The command runs
// As `bwrap <overlay flags> -- <command>` on Linux, or the same argv through `wsl.exe` on Windows.
//
// Unlike createVfsBackend, this backend NEVER falls back to native. vfs falls back for correctness —
// A command it can't run in-process still produces the baseline result. Here isolation IS the result,
// So a silent native fallback would run the command un-isolated: a wrong answer disguised as success.
// An unsupported host (no Linux/WSL bridge, or no bubblewrap) therefore throws at construction instead.
//
// Bwrap reports the sandboxed child's real exit code on a dedicated status fd (3). A child exit-code
// There means the command actually ran; its absence means the sandbox failed to set up (bad flag,
// Missing binary, overlay mount failure), so the backend rejects with a sandbox error instead of
// Passing bwrap's own diagnostics off as the command's result — which would also poison a diff against
// The native baseline (native stderr never contains `bwrap:` lines).
export const createOsBackend = (): ExecBackend => {
  if (!isOsBackendSupported())
    throw new InvalidOperationError(Operation.Create, createOsBackend.name, "requires Linux/WSL + bubblewrap");
  if (process.platform === "linux") return createLinuxOsBackend(createOsBackend.name);
  else if (process.platform === "win32") return createWslOsBackend(createOsBackend.name);
  throw new InvalidOperationError(Operation.Create, createOsBackend.name, "requires Linux/WSL + bubblewrap");
};
