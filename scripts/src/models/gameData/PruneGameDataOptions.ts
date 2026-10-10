import type { ContainerClient } from "@azure/storage-blob";

export interface PruneGameDataOptions {
  containerClient: ContainerClient;
  // Whether to list what would be deleted without deleting it
  isDryRun: boolean;
  // Every object a live lock reaches, which a prune keeps whatever its age
  liveHashes: Set<string>;
  // The instant the retention window ends at, in epoch milliseconds
  now: number;
}
