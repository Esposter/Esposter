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
  stdio: ExecStdio;
}

// "pipe" captures stdout/stderr into the ExecResult (used for differential correctness checks).
// "inherit" streams them live to the host terminal (used by the CLI for long-running commands).
export type ExecStdio = "inherit" | "pipe";
