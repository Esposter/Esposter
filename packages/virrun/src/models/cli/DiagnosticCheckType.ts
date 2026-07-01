// Identifies which os-backend prerequisite a DiagnosticCheck covers, so the report summary can name the precise
// Consequence of that specific check failing (a Sandbox failure degrades os → native; the others leave the sandbox
// Mounted but a command hits a toolchain/write-back gap).
export enum DiagnosticCheckType {
  // The bubblewrap binary at an overlay-capable version.
  Bubblewrap = "bubblewrap",
  // python3, used by write-back to flush produced files back to host.
  Python3 = "python3",
  // The real overlay-mount probe (isOsBackendSupported) — the authoritative "would fall back to native" verdict.
  Sandbox = "sandbox",
  // A Linux node reachable inside WSL2 (win32 only), so node-based commands resolve inside the sandbox.
  WslNode = "wslNode",
}
