// Describes how the working dir's RAM overlay is layered, so one bwrap argv builder can express all three
// Snapshot states. The source dir is always the base read-only lower; these fields stack on top of it:
//   - ephemeral (default, `{}`): no extra lowers, writes vanish in an invisible tmpfs upper.
//   - capture (`upperDir` + `workDir`): writes persist as real files in `upperDir` — the warm snapshot.
//   - fork (`lowerDirs: [snapshotUpper]`): the frozen snapshot stacks above the source as a read-only lower
//     And writes vanish again, so each forked run reuses the install without an upper of its own.
export interface OverlayLayers {
  // Extra read-only lower layers stacked above the source dir, lowest-priority first. A fork run passes the
  // Captured snapshot's upper here so its files shadow the source while the working dir itself stays read-only.
  lowerDirs?: readonly string[];
  // Host dir that captures writes as real files (a capture run); must be paired with workDir. Omitted means
  // Writes go to an invisible tmpfs upper (the default ephemeral run and every fork run).
  upperDir?: string;
  // Empty scratch dir on the same filesystem as upperDir, required by overlayfs whenever upperDir is set.
  workDir?: string;
}
