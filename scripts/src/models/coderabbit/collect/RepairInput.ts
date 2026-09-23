import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";

export interface RepairInput extends Pick<CycleInput, "collectorSha"> {
  cwd: string;
  isDryRun: boolean;
  mainSha: string;
  viewerLogin: string;
}
