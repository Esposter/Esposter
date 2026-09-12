// Describes how the working directory's RAM overlay is layered, so one bwrap argv builder can express all three
// Snapshot states. The source directory is always the base read-only lower; these fields stack on top of it:
//   - ephemeral (default, `{}`): no extra lowers, writes vanish in an invisible tmpfs upper.
//   - capture (`upperDirectory` + `workDirectory`): writes persist as real files in `upperDirectory` — the warm snapshot.
//   - fork (`lowerDirectories: [snapshotUpper]`): the frozen snapshot stacks above the source as a read-only lower
//     And writes vanish again, so each forked run reuses the install without an upper of its own.
export interface OverlayLayers {
  // Extra read-only lower layers stacked above the source directory, lowest-priority first (a fork run passes the
  // Captured snapshot's upper here).
  lowerDirectories?: readonly string[];
  // Host directory that captures writes as real files (a capture run); must be paired with workDirectory. Omitted → writes
  // Go to an invisible tmpfs upper.
  upperDirectory?: string;
  // Empty scratch directory on the same filesystem as upperDirectory, required by overlayfs whenever upperDirectory is set.
  workDirectory?: string;
}
