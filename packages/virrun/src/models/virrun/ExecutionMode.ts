// Which execution path a passthrough command (`virrun -- <cmd>`, `virrun run`, `virrun exec`) takes on the os
// backend. All three are native-equivalent in their observable result; they differ in dependency reuse and whether
// the command's writes reach the host. See specs/write-back.md and specs/snapshot-fork.md.
export enum ExecutionMode {
  // Cold plain exec — run directly through the resolved backend with no warm-snapshot reuse (`virrun exec`).
  Exec = "exec",
  // Warm snapshot, writes vanish — ephemeral verification where no output is wanted, e.g. CI lint/test
  // (`virrun run --ephemeral`).
  Fork = "fork",
  // Warm snapshot, produced files flushed back to the host so disk matches native — the default mutation path that
  // lets every command move onto the prefix (`virrun -- <cmd>`, `virrun run`).
  Persist = "persist",
}
