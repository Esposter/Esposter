export interface ReshapeInput {
  cwd: string;
  isDryRun: boolean;
  // The tree the queue was just rebuilt on — the owed commits are everything above it
  targetSha: string;
  viewerLogin: string;
}
