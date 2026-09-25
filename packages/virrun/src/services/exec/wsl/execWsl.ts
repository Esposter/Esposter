import type { ExecFileHiddenOptions } from "#src/models/exec/util/ExecFileHiddenOptions";

import { execFileHidden } from "#src/services/exec/util/execFileHidden";
import { WSL_EXECUTABLE } from "#src/services/exec/wsl/constants";
// Every wsl.exe probe goes through here so exactly one place knows how wsl.exe writes: its OWN output — the distro
// List, and every launch failure ("Catastrophic failure  Error code: Wsl/Service/E_UNEXPECTED" when the WSL service
// Is wedged) — is UTF-16LE, while an `--exec` child's stdout is that child's raw bytes (utf8). Stderr needs nothing
// Declared: execFileHidden detects utf16le from the buffer, so a wsl.exe spawn that bypasses this wrapper still
// Reports its failure. Stdout cannot be detected mid-stream, hence `encoding: "utf16le"` at the call sites reading
// The `wsl.exe` stdout rather than a child's (getWslNativeCacheRoot's `-l -q`).
//
// Every call names its bound, because a wedged WSL service does not fail a spawn, it never answers it, and
// ExecFileSync waits forever — one such call hangs the whole one-shot CLI with nothing printed. There is no default to
// Fall back on: a round-trip takes the WSL probe tier (WSL_PROBE_TIMEOUT_MS, wide enough for the first call after a
// Shutdown to boot the distro), and a call doing real work takes the tier its work scales with — so the choice is made
// At each site, where what the call does is known, and a site that has not made it does not typecheck.
export const execWsl = (
  args: readonly string[],
  options: ExecFileHiddenOptions & Pick<Required<ExecFileHiddenOptions>, "timeout">,
): string => execFileHidden(WSL_EXECUTABLE, args, options);
