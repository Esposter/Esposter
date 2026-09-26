import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";
import type { PortResult } from "#src/models/coderabbit/collect/PortResult";

export interface FoldInput extends Pick<PortResult, "fixCount" | "queueShas">, Pick<CycleInput, "collectorSha"> {
  cwd: string;
  developSha: string;
  // Where the release's review starts reading — what the fold's own diff is counted against, as the pick loop counts
  mergeBaseSha: string;
  queueSha: string;
  viewerLogin: string;
}
