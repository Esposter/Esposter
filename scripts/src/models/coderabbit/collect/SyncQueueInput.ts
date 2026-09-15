export interface SyncQueueInput {
  cwd: string;
  developSha: string;
  isDryRun: boolean;
  queueSha: string;
  reviewFixesSha?: string;
  viewerLogin: string;
}
