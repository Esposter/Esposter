import type { OverlayLayers } from "@/models/exec/OverlayLayers";

export interface ExecOptions {
  // Host directories to bind writable into the sandbox (os backend only). Used for intentional host
  // Caches such as the shared package store.
  bindDirs?: readonly string[];
  // Working directory the command runs in. Empty string means the current process cwd.
  cwd: string;
  // Extra environment variables merged over the host env inside the sandbox (os backend only). Used to
  // Point pnpm at the shared package store (store dir + copy import method) without CLI flag injection.
  env?: Readonly<Record<string, string>>;
  // Whether the sandbox keeps network access (os backend only). Off by default for full isolation;
  // Real installs need it on for registry fetches and supply-chain verification.
  isNetworkEnabled?: boolean;
  // How the working dir's RAM overlay is layered (os backend only). Default (omitted) is ephemeral — reads
  // Fall through to the source, writes vanish in tmpfs. A capture run sets upperDir/workDir so post-install
  // Writes persist into the snapshot; a fork run sets lowerDirs to stack a captured snapshot read-only.
  overlayLayers?: OverlayLayers;
  stdio: ExecStdio;
}

// "pipe" captures stdout/stderr into the ExecResult (used for differential correctness checks).
// "inherit" streams them live to the host terminal (used by the CLI for long-running commands).
export type ExecStdio = "inherit" | "pipe";
