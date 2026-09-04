import type { ExecFileHiddenOptions } from "#src/models/exec/util/ExecFileHiddenOptions";

import { WSL_PROBE_TIMEOUT_MS } from "#src/services/exec/util/constants";
import { execFileHidden } from "#src/services/exec/util/execFileHidden";
// Every wsl.exe probe goes through here so exactly one place knows how wsl.exe writes: its OWN output — the distro
// List, and every launch failure ("Catastrophic failure  Error code: Wsl/Service/E_UNEXPECTED" when the WSL service
// Is wedged) — is UTF-16LE, while an `--exec` child's stdout is that child's raw bytes (utf8). Stderr needs nothing
// Declared: execFileHidden detects utf16le from the buffer, so a wsl.exe spawn that bypasses this wrapper still
// Reports its failure. Stdout cannot be detected mid-stream, hence `encoding: "utf16le"` at the call sites reading
// Wsl.exe's own stdout rather than a child's (getWslNativeCacheRoot's `-l -q`).
//
// Every call is bounded here too, defaulting to the WSL cap: a wedged WSL service does not fail a spawn, it never
// Answers it, and execFileSync waits forever — one such call hangs the whole one-shot CLI with nothing printed. The
// Default suits the round-trips (wslpath, `echo $HOME`, a version string) and, deliberately, is the wider WSL cap
// Rather than the in-process probe one, because the first round-trip after a shutdown boots the distro before it
// Runs anything; a call that does real work overrides it (WSL_WORK_TIMEOUT_MS), which is why the bound lives here
// Rather than at each site that remembered to pass one.
export const execWsl = (args: readonly string[], options: ExecFileHiddenOptions = {}): string =>
  execFileHidden("wsl.exe", args, { timeout: WSL_PROBE_TIMEOUT_MS, ...options });
