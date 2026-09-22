import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";

export interface RepairPromptInput extends Pick<CycleInput, "collectorSha"> {
  // The tail of every failing job's log, as `getFailedLogExcerpt` cuts it
  failedLog: string;
  mainSha: string;
  runUrl: string;
}
