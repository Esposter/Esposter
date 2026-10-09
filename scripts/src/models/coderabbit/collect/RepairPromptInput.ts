import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";

export interface RepairPromptInput extends Pick<CycleInput, "collectorSha"> {
  // The tail of every failing job's log, as `getFailedLogExcerpt` cuts it
  failedLog: string;
  // The tail of the install that failed on the red head (`runInstall`), absent when it installed
  installFailure?: string;
  mainSha: string;
  runUrl: string;
}
