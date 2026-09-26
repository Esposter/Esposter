import type { ExecFileHiddenOptions } from "#src/models/exec/util/ExecFileHiddenOptions";

import { execFileHidden } from "#src/services/exec/util/execFileHidden";
import { WSL_EXECUTABLE } from "#src/services/exec/wsl/constants";

// Every wsl.exe probe goes through here so exactly one place knows how wsl.exe writes: its OWN output — the distro
// List, and every launch failure ("Catastrophic failure  Error code: Wsl/Service/E_UNEXPECTED" when the WSL service
// Is wedged) — is UTF-16LE, and a launch failure lands on stdout, while an `--exec` child's stdout is that child's raw
// Bytes (utf8). A failure needs nothing declared: execFileHidden detects utf16le from each captured buffer and names
// The failure by stdout when stderr is empty, so a wsl.exe spawn that bypasses this wrapper still reports it. A
// Successful stdout cannot be detected mid-stream, hence `encoding: "utf16le"` at the call sites reading the `wsl.exe`
// Stdout rather than a child's (getWslNativeCacheRoot's `-l -q`).
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
