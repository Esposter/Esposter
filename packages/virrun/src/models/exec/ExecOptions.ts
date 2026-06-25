export interface ExecOptions {
  // Working directory the command runs in. Empty string means the current process cwd.
  cwd: string;
  // Whether the sandbox keeps network access (os backend only). Off by default for full isolation;
  // Real installs need it on for registry fetches and supply-chain verification.
  isNetworkEnabled?: boolean;
  // Extra directories to mount as their own RAM overlay (os backend only) so a process can write into
  // Them without the write reaching the host disk — e.g. a package store whose index must stay writable.
  overlayDirs?: readonly string[];
  stdio: ExecStdio;
}

// "pipe" captures stdout/stderr into the ExecResult (used for differential correctness checks).
// "inherit" streams them live to the host terminal (used by the CLI for long-running commands).
export type ExecStdio = "inherit" | "pipe";
