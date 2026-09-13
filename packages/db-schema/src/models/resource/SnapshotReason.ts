// Why a revision exists. A column on the version row, so the listing hands it back without opening a single
// Version. Absent on a published version, whose channel already says why it was taken
export enum SnapshotReason {
  // The first save after an idle window elapsed, so a working session leaves a handful of recovery points
  Automatic = "Automatic",
  BeforeImport = "BeforeImport",
  BeforeRestore = "BeforeRestore",
}
