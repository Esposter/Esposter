import type { OverlayLayers } from "@/models/exec/OverlayLayers";

export interface ExecOptions {
  // Host directories to bind writable into the sandbox (os backend only), e.g. the shared package store.
  bindDirs?: readonly string[];
  // Working directory the command runs in. Empty string means the current process cwd.
  cwd: string;
  // Extra environment merged over the host env inside the sandbox (os backend only), e.g. pointing pnpm at the store.
  env?: Readonly<Record<string, string>>;
  // Whether the sandbox keeps network access (os backend only). Off by default; real installs need it on.
  isNetworkEnabled?: boolean;
  // How the working dir's RAM overlay is layered (os backend only). Omitted is ephemeral (writes vanish in tmpfs); a
  // Capture run sets upperDir/workDir to persist writes into the snapshot; a fork run sets lowerDirs.
  overlayLayers?: OverlayLayers;
  stdio: ExecStdio;
  // With stdio "pipe" (os backend only), also stream stdout/stderr live to the host while capturing them — a tee. The
  // Task cache's recording path uses it so a miss under a bare `virrun -- <cmd>` isn't silent until exit.
  tee?: boolean;
}

// "pipe" captures stdout/stderr into the ExecResult; "inherit" streams them live to the host terminal.
export type ExecStdio = "inherit" | "pipe";
