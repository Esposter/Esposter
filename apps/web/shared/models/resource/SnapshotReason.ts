// Why a revision exists. Carried as blob metadata, so the listing hands it back without opening a single
// Snapshot
export enum SnapshotReason {
  // The first save after an idle window elapsed, so a working session leaves a handful of recovery points
  Automatic = "Automatic",
  BeforeImport = "BeforeImport",
  BeforeRestore = "BeforeRestore",
  // The owner's own Save version command, and the only reason that may carry a label
  Manual = "Manual",
}
