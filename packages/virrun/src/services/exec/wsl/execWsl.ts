import type { ExecFileHiddenOptions } from "@/models/exec/util/ExecFileHiddenOptions";

import { execFileHidden } from "@/services/exec/util/execFileHidden";
// Every wsl.exe probe goes through here so exactly one place knows how wsl.exe writes: its OWN output — the distro
// List, and every launch failure ("Catastrophic failure  Error code: Wsl/Service/E_UNEXPECTED" when the WSL service
// Is wedged) — is UTF-16LE, while an `--exec` child's stdout is that child's raw bytes (utf8). Stderr needs nothing
// Declared: execFileHidden detects utf16le from the buffer, so a wsl.exe spawn that bypasses this wrapper still
// Reports its failure. Stdout cannot be detected mid-stream, hence `encoding: "utf16le"` at the call sites reading
// Wsl.exe's own stdout rather than a child's (getWslNativeCacheRoot's `-l -q`).
export const execWsl = (args: readonly string[], options: ExecFileHiddenOptions = {}): string =>
  execFileHidden("wsl.exe", args, options);
