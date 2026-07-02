// The spawn recipe a bwrap backend's createBwrapCommand emits — the argv, the env handed to the runner process,
// And where the sandbox status block is read from (an extra fd vs. the tail of stderr). See createBwrapBackend.
export interface BwrapCommand {
  readonly command: readonly [string, ...string[]];
  // Environment for the spawned runner process. The two backends diverge: the linux backend spreads
  // `options.env` here because bwrap inherits the spawn env and passes it straight to the sandboxed child;
  // The wsl backend must NOT — its runner is `wsl.exe`, found via the Windows PATH, and `options.env`
  // (whose PATH is a *Linux* login PATH) would clobber it to ENOENT. The wsl backend instead delivers
  // `options.env` to the Linux child through the `env KEY=val` args inside the command (createWslEnvArgs).
  readonly env: NodeJS.ProcessEnv;
  // Best-effort Linux-side teardown fired on Ctrl+C. Only the wsl backend sets it: its spawned child is the
  // Windows `wsl.exe` client, so killing the child cannot reach the bwrap process tree running under WSL — this
  // Reaps that tree's process group instead. The linux/native backends leave it undefined (killing their child
  // Is enough) and forwardTerminationSignals simply skips it.
  readonly onTerminate?: () => void;
  readonly statusSource: "fd" | "stderr";
}
