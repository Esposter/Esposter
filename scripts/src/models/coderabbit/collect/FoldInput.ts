import type { PortResult } from "#src/models/coderabbit/collect/PortResult";

export interface FoldInput extends Pick<PortResult, "fixCount" | "queueShas"> {
  // The basis the fold's attempts are counted against (`getMarker`)
  collectorSha: string;
  cwd: string;
  developSha: string;
  // The sha the review frontier sits at — what the fold's own diff is counted against, as the pick loop counts
  frontierSha: string;
  queueSha: string;
  viewerLogin: string;
}
