export interface SyncQueueInput {
  // The basis the resolver's and the reshaper's attempts are counted against (`getMarker`)
  collectorSha: string;
  cwd: string;
  developSha: string;
  isDryRun: boolean;
  // The fixes branch while it still owes develop commits, nothing otherwise — the tree the queue is replayed onto
  owingFixesSha?: string;
  queueSha: string;
  viewerLogin: string;
}
