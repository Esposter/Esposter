export interface RepairPromptInput {
  // The basis the repair records on its commit (`getRepairTrailer`)
  collectorSha: string;
  // The tail of every failing job's log, as `getFailedLogExcerpt` cuts it
  failedLog: string;
  mainSha: string;
  runUrl: string;
}
