export const WSL_BWRAP_STATUS_BEGIN = "\n__VIRRUN_BWRAP_STATUS_BEGIN__\n";
export const WSL_BWRAP_STATUS_END = "\n__VIRRUN_BWRAP_STATUS_END__\n";
// The labelled line the wsl backend's folded sync prelude prints before exiting when the source-mirror sync fails.
// The sandbox never starts on that path, so no status block reaches stderr and the close handler would otherwise read the
// Missing block as a sandbox-setup failure — createBwrapBackend keys on this marker to surface the sync failure as
// What it is. Lives here beside the status markers because both ends (the wsl script that prints it and the generic
// Close handler that detects it) must never drift apart.
export const WSL_SOURCE_MIRROR_SYNC_FAILURE_MARKER = "virrun: source mirror sync failed";
// The same, for the other prelude that can end the folded script before bwrap starts: the shared `flock` every run
// Holds over the mirror lower for its whole duration. It is bounded (SOURCE_MIRROR_TIMEOUT_SECONDS) so a wedged
// Writer cannot hang the CLI, and a run that hits that bound is the one case where a *concurrent* run is the whole
// Explanation — which is exactly the failure that must not read as "bubblewrap failed to set up the sandbox".
export const WSL_SOURCE_MIRROR_LOCK_FAILURE_MARKER = "virrun: source mirror lock was not acquired";
// A shell reports a signalled child as 128 + the signal number, and `wsl.exe` relays that status rather than dying
// Itself — so this is how a killed WSL-side run reaches the host, where node's own `signal` is empty.
export const SIGNAL_EXIT_CODE_BASE = 128;
