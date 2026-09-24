import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";

export interface SyncFixesInput extends Pick<CycleInput, "collectorSha"> {
  cwd: string;
  developSha: string;
  isDryRun: boolean;
  // The fixes branch while it still owes develop commits
  owingFixesSha: string;
  viewerLogin: string;
}
