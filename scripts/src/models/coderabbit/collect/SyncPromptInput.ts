export interface SyncPromptInput {
  // The branch whose owed commits are being replayed
  branch: string;
  // The paths the sequence stopped on, and the commit it stopped on
  conflictedPaths: string[];
  conflictSha: string;
  // The branch whose tree it is being rebuilt on
  targetBranch: string;
}
