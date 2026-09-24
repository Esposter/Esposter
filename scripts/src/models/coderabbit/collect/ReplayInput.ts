import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";

export interface ReplayInput extends Pick<CycleInput, "collectorSha"> {
  // The branch whose owed commits are replayed, named to the resolver
  branch: string;
  cwd: string;
  isDryRun: boolean;
  sourceSha: string;
  targetBranch: string;
  targetSha: string;
  viewerLogin: string;
}
