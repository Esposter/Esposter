import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { GameDataObjectRef } from "#src/models/gameData/GameDataObjectRef";
import type { DryRunOptions } from "#src/models/shared/DryRunOptions";

export interface PruneGameDataOptions extends DryRunOptions {
  bucketClient: R2BucketClient;
  // Every object a live lock reaches, which a prune keeps whatever its age
  liveObjects: GameDataObjectRef[];
  // The instant the retention window ends at, in epoch milliseconds
  now: number;
}
