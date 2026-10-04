import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";
import type { PortInput } from "#src/models/coderabbit/collect/PortInput";

export interface SyncQueueInput extends Pick<CycleInput, "collectorSha">, Pick<PortInput, "mergeBaseSha"> {
  cwd: string;
  developSha: string;
  isDryRun: boolean;
  // The fixes branch while it still owes develop commits, nothing otherwise — the tree the queue is replayed onto
  owingFixesSha?: string;
  queueSha: string;
  viewerLogin: string;
}
