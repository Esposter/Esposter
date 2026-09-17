export interface RepairPromptInput {
  // The tail of every failing job's log, as `getFailedLogExcerpt` cuts it
  failedLog: string;
  mainSha: string;
  runUrl: string;
}
