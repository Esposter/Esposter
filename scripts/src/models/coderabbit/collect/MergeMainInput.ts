import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";

export interface MergeMainInput extends Pick<CycleInput, "collectorSha"> {
  cwd: string;
  viewerLogin: string;
}
