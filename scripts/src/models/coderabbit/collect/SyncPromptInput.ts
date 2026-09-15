export interface SyncPromptInput {
  // The paths the sequence stopped on, and the queue commit it stopped on
  conflictedPaths: string[];
  conflictSha: string;
  // The branch whose tree the queue is being rebuilt on
  targetBranch: string;
}
