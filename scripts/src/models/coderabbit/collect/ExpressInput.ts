export interface ExpressInput {
  cwd: string;
  // A queue commit a window already carries is owed to neither branch, so it is never cut again
  developSha: string;
  mainSha: string;
  queueSha: string;
}
