export const WSL_BWRAP_STATUS_BEGIN = "\n__VIRRUN_BWRAP_STATUS_BEGIN__\n";
export const WSL_BWRAP_STATUS_END = "\n__VIRRUN_BWRAP_STATUS_END__\n";
// The labelled line the wsl backend's folded sync prelude prints before exiting when the source-mirror sync fails.
// The sandbox never starts on that path, so no status block reaches stderr and the close handler would otherwise read the
// Missing block as a sandbox-setup failure — createBwrapBackend keys on this marker to surface the sync failure as
// What it is. Lives here beside the status markers because both ends (the wsl script that prints it and the generic
// Close handler that detects it) must never drift apart.
export const WSL_SOURCE_MIRROR_SYNC_FAILURE_MARKER = "virrun: source mirror sync failed";
