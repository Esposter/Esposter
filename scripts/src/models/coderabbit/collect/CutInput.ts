import type { PortResult } from "#src/models/coderabbit/collect/PortResult";

export interface CutInput extends Pick<PortResult, "fixCount" | "queueShas"> {
  cwd: string;
  developSha: string;
  // The sha the review frontier sits at — what the fold's own diff is counted against, as the pick loop counts
  frontierSha: string;
  queueSha: string;
}
