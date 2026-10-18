import type { DryRunOptions } from "#src/models/shared/DryRunOptions";
import type { ContainerClient } from "@azure/storage-blob";

export interface PruneGameDataOptions extends DryRunOptions {
  containerClient: ContainerClient;
  // Every object a live lock reaches, which a prune keeps whatever its age
  liveHashes: Set<string>;
  // The instant the retention window ends at, in epoch milliseconds
  now: number;
}
