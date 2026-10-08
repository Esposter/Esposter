import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";
import type { PortResult } from "#src/models/coderabbit/collect/PortResult";

export interface FoldInput extends Pick<PortResult, "fixCount" | "queueShas">, Pick<CycleInput, "collectorSha"> {
  // The base the bot reviews the window against, as the port counts it — the fold's diff is counted against the same one
  baseSha: string;
  cwd: string;
  developSha: string;
  queueSha: string;
  viewerLogin: string;
}
