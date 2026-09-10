import {
  SIGNAL_EXIT_CODE_BASE,
  WSL_SOURCE_MIRROR_LOCK_FAILURE_MARKER,
  WSL_SOURCE_MIRROR_SYNC_FAILURE_MARKER,
} from "#src/services/exec/bwrap/constants";
// Name the failure behind a run whose child closed without bwrap ever writing a status block. Everything that ends
// The wsl backend's folded script early lands here, and only ONE of those is bubblewrap: the two prelude failures
// Print their own marker line before exiting, and an external kill prints nothing at all. Blaming bubblewrap for
// All of them is what makes a concurrency incident unfalsifiable — the run that another run's startup orphan sweep
// (reapOrphanedWslRuns) or a terminal's Ctrl+C TERMs reports a sandbox-setup failure with an empty stderr, so
// The one fact that would explain it, that the process was killed rather than that it failed, is the fact thrown
// Away. A signal is read from `signal` when node has one (the linux backend spawns bwrap itself) and from the
// 128+n exit status when it does not (the wsl backend's child is the `wsl.exe` client, which relays the Linux
// Status rather than dying itself).
export const getNoStatusFailureHeadline = (stderr: string, exitCode?: number, signal?: NodeJS.Signals): string => {
  if (stderr.includes(WSL_SOURCE_MIRROR_SYNC_FAILURE_MARKER))
    return "the source mirror sync failed before the sandbox started";
  else if (stderr.includes(WSL_SOURCE_MIRROR_LOCK_FAILURE_MARKER))
    return "the source mirror lock was never acquired, so the sandbox never started";
  else if (signal !== undefined) return `the sandbox was killed by ${signal} — an external kill, not a bwrap failure`;
  else if (exitCode !== undefined && exitCode > SIGNAL_EXIT_CODE_BASE)
    return `the sandbox was killed by signal ${exitCode - SIGNAL_EXIT_CODE_BASE} — an external kill, not a bwrap failure`;
  return "bubblewrap failed to set up the sandbox";
};
