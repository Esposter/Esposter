import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";
import type { PortInput } from "#src/models/coderabbit/collect/PortInput";

export interface ReshapeInput extends Pick<CycleInput, "collectorSha">, Pick<PortInput, "mergeBaseSha"> {
  cwd: string;
  isDryRun: boolean;
  // The tree the queue was just rebuilt on — the owed commits are everything above it
  targetSha: string;
  viewerLogin: string;
}
