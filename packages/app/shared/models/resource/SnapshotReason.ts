// Why a revision exists, which is the whole of what makes one choosable in a history list — a bare version
// Number and a timestamp are not something a person can pick between. Carried as blob metadata, so the
// Listing hands it back without opening a single snapshot
export enum SnapshotReason {
  // The first save after an idle window elapsed, so a working session leaves a handful of recovery points
  Automatic = "Automatic",
  BeforeDeploy = "BeforeDeploy",
  BeforeImport = "BeforeImport",
  BeforeRestore = "BeforeRestore",
  // The owner's own Save version command, and the only reason that may carry a label
  Manual = "Manual",
}
