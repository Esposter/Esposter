import type { ExecFileHiddenOptions } from "@/models/exec/util/ExecFileHiddenOptions";

import { execFileHidden } from "@/services/exec/util/execFileHidden";
// Every wsl.exe probe goes through here so exactly one place knows how wsl.exe writes: its OWN diagnostics — the
// Distro list, and every launch failure ("Catastrophic failure  Error code: Wsl/Service/E_UNEXPECTED" when the WSL
// Service is wedged) — are UTF-16LE, while an `--exec` child's stdout is that child's raw bytes (utf8). Decoding
// Stderr as utf8 turns the one line explaining a broken host into NUL-interleaved text the terminal drops, leaving a
// Bare "Command failed: wsl.exe …"; hence the utf16le stderr default here, and `encoding: "utf16le"` at the call
// Sites that read wsl.exe's own stdout rather than a child's (getWslNativeCacheRoot's `-l -q`).
export const execWsl = (args: readonly string[], options: ExecFileHiddenOptions = {}): string =>
  execFileHidden("wsl.exe", args, { stderrEncoding: "utf16le", ...options });
