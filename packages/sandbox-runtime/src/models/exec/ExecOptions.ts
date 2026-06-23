export interface ExecOptions {
  // Working directory the command runs in. Empty string means the current process cwd.
  cwd: string;
  stdio: ExecStdio;
}

// "pipe" captures stdout/stderr into the ExecResult (used for differential correctness checks).
// "inherit" streams them live to the host terminal (used by the CLI for long-running commands).
export type ExecStdio = "inherit" | "pipe";
