// Where an export is in its life. Only Building and Queued hold the person's one active slot, so a Ready or Failed
// Export no longer blocks a new request. A Failed export keeps its reason and offers no link
export enum DataExportStatus {
  Building = "building",
  Failed = "failed",
  Queued = "queued",
  Ready = "ready",
}
