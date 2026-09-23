import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";

export interface ReshapeInput extends Pick<CycleInput, "collectorSha"> {
  cwd: string;
  isDryRun: boolean;
  // The tree the queue was just rebuilt on — the owed commits are everything above it
  targetSha: string;
  viewerLogin: string;
}
