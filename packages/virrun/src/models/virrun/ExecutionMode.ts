// Execution path a passthrough command takes on the os backend (apps/web/content/docs/virrun/write-back.md and
// Snapshot-and-fork.md).
export enum ExecutionMode {
  // Cold plain exec, no warm-cache reuse (`virrun exec`).
  Exec = "exec",
  // Warm snapshot, writes vanish — ephemeral verification (`virrun run --ephemeral`).
  Fork = "fork",
  // Warm snapshot, produced files flushed to the host so disk matches native — the default (`virrun -- <cmd>`).
  Persist = "persist",
}
